/**
 * Sola Place Verification Script
 *
 * Verifies a place against the Sola baseline using:
 * 1. Google Places API for structured data and reviews
 * 2. Claude AI for analysis against baseline criteria
 *
 * Usage:
 *   npx tsx scripts/verify-place.ts <place_id>
 *   npx tsx scripts/verify-place.ts <place_id> --dry-run  # Don't save to DB
 *
 * Required environment variables:
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - GOOGLE_PLACES_API_KEY
 *   - ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './seed-utils';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GooglePlaceResult {
  name?: string;
  formatted_address?: string;
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }[];
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  types?: string[];
  price_level?: number;
}

interface VerificationSignal {
  value: string;
  confidence: number;
  source: string;
}

interface SolaNote {
  type: 'highlight' | 'context' | 'consideration';
  text: string;
  context?: string;
}

interface VerificationResult {
  status: 'baseline_passed' | 'baseline_failed' | 'insufficient_data';
  signals: Record<string, VerificationSignal>;
  solaNotes: SolaNote[];
  confidenceScore: number;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

async function fetchGooglePlaceData(googlePlaceId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  GOOGLE_PLACES_API_KEY not set, skipping Google data');
    return null;
  }

  const fields = [
    'name',
    'formatted_address',
    'opening_hours',
    'reviews',
    'rating',
    'user_ratings_total',
    'website',
    'types',
    'price_level',
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=${fields}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn(`⚠️  Google Places API error: ${data.status}`);
      return null;
    }

    return data.result;
  } catch (error) {
    console.warn('⚠️  Failed to fetch Google Places data:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Claude AI Verification
// ---------------------------------------------------------------------------

async function analyzeWithClaude(
  place: Record<string, unknown>,
  googleData: GooglePlaceResult | null,
): Promise<VerificationResult> {
  const anthropic = new Anthropic();

  // Build context for Claude
  const reviewsText = googleData?.reviews
    ?.slice(0, 10) // Limit to 10 reviews to manage token usage
    ?.map((r, i) => `Review ${i + 1} (${r.rating}★): ${r.text}`)
    .join('\n\n') ?? 'No reviews available';

  const placeContext = `
PLACE INFORMATION:
Name: ${place.name}
Type: ${place.place_type}
Address: ${place.address ?? 'Not stated'}
Website: ${place.website ?? 'Not available'}
Description: ${place.description ?? 'None'}
Hours: ${place.hours_text ?? 'Not stated'}

GOOGLE PLACES DATA:
Rating: ${googleData?.rating ?? 'N/A'} (${googleData?.user_ratings_total ?? 0} reviews)
Price Level: ${googleData?.price_level ?? 'N/A'}
Opening Hours: ${googleData?.opening_hours?.weekday_text?.join(', ') ?? 'Not available'}

REVIEWS (up to 10):
${reviewsText}
`;

  const prompt = `You are analyzing an accommodation listing for Sola, a travel app built specifically for solo female travelers.

Your job is to verify this place against our baseline criteria. We check things that matter for solo female travelers - not whether it's "good" or "nice", but whether the information is clear, consistent, and there are no red flags.

${placeContext}

BASELINE CRITERIA TO CHECK:

1. ROOM CLARITY
- Is the room type clearly stated (private vs shared)?
- Is the bathroom situation clear (private vs shared)?
- For hostels: Is female-only dorm option clearly available/marked?
- For hostels: Is mixed dorm clearly disclosed?

2. SECURITY SIGNALS
- Do reviews mention locks, security, or feeling safe positively?
- Are there any complaints about locks or security?
- For hostels: Are lockers mentioned?

3. SURROUNDINGS
- Is the neighborhood described as walkable?
- Is distance to public transport stated or inferable?
- Are there any safety concerns mentioned about the area?

4. OPERATIONS
- Are check-in hours/process clearly stated?
- Is 24h check-in or late arrival option available?
- Is guest/visitor policy stated (for hostels)?
- Are there complaints about hidden fees or surprise charges?

5. ACCURACY
- Do reviews say photos are accurate?
- Are there complaints about misleading photos?
- Is the location/map described as accurate?
- Are there bait-and-switch complaints (different room than booked)?

6. SOLO TRAVELER EXPERIENCE
- Do solo travelers leave positive reviews?
- Do female travelers mention feeling comfortable?
- Is there any mention of harassment or unwanted attention?

Based on your analysis, respond with a JSON object:

{
  "status": "baseline_passed" | "baseline_failed" | "insufficient_data",
  "signals": {
    "signal_key": { "value": "true/false/text", "confidence": 0.0-1.0, "source": "google_reviews/listing/inference" },
    ...
  },
  "sola_notes": [
    { "type": "highlight|context|consideration", "text": "Short note for UI", "context": "always|late_arrival|first_timer" }
  ],
  "confidence_score": 0.0-1.0,
  "reasoning": "Brief explanation of your assessment"
}

IMPORTANT GUIDELINES:
- "baseline_passed": Enough clear information, no red flags
- "baseline_failed": Clear red flags (security complaints, accuracy issues, harassment mentions)
- "insufficient_data": Not enough reviews or information to verify

For sola_notes, create 2-4 SHORT, FACTUAL notes that would be helpful for solo female travelers:
- Good examples: "Female-only dorm available", "24h check-in", "5 min walk to BTS", "Quiet residential area"
- Bad examples: "Great place!", "Highly recommended", "Nice staff" (too vague or opinionated)

Only output the JSON object, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Parse JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse Claude response as JSON');
  }

  const result = JSON.parse(jsonMatch[0]);

  return {
    status: result.status,
    signals: result.signals ?? {},
    solaNotes: result.sola_notes ?? [],
    confidenceScore: result.confidence_score ?? 0,
    reasoning: result.reasoning ?? '',
  };
}

// ---------------------------------------------------------------------------
// Database Operations
// ---------------------------------------------------------------------------

async function getPlace(placeId: string) {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', placeId)
    .single();

  if (error) throw new Error(`Place not found: ${placeId}`);
  return data;
}

async function saveVerificationResult(
  placeId: string,
  result: VerificationResult,
  googleData: GooglePlaceResult | null,
) {
  const now = new Date().toISOString();

  // 1. Update place verification status
  const { error: placeError } = await supabase
    .from('places')
    .update({
      verification_status: result.status,
      verified_at: now,
    })
    .eq('id', placeId);

  if (placeError) {
    console.error('Failed to update place:', placeError);
    throw placeError;
  }

  // 2. Save verification run
  const { error: verificationError } = await supabase
    .from('place_verifications')
    .insert({
      place_id: placeId,
      status: result.status,
      sources_checked: [
        { source: 'google_places', checked_at: now, has_data: !!googleData },
        { source: 'claude_analysis', checked_at: now },
      ],
      raw_findings: {
        signals: result.signals,
        reasoning: result.reasoning,
        google_rating: googleData?.rating,
        google_review_count: googleData?.user_ratings_total,
      },
      confidence_score: result.confidenceScore,
    });

  if (verificationError) {
    console.error('Failed to save verification:', verificationError);
    throw verificationError;
  }

  // 3. Save signals
  for (const [key, signal] of Object.entries(result.signals)) {
    const { error: signalError } = await supabase
      .from('place_signals')
      .upsert(
        {
          place_id: placeId,
          signal_key: key,
          signal_value: signal.value,
          signal_type: signal.value === 'true' || signal.value === 'false' ? 'boolean' : 'text',
          confidence: signal.confidence,
          source: signal.source,
          updated_at: now,
        },
        { onConflict: 'place_id,signal_key' }
      );

    if (signalError) {
      console.warn(`Failed to save signal ${key}:`, signalError);
    }
  }

  // 4. Save Sola notes (clear existing first)
  await supabase
    .from('place_sola_notes')
    .delete()
    .eq('place_id', placeId);

  for (let i = 0; i < result.solaNotes.length; i++) {
    const note = result.solaNotes[i];
    const { error: noteError } = await supabase
      .from('place_sola_notes')
      .insert({
        place_id: placeId,
        note_type: note.type,
        note_text: note.text,
        display_context: note.context ?? 'always',
        order_index: i,
      });

    if (noteError) {
      console.warn(`Failed to save note:`, noteError);
    }
  }

  console.log('✓ Verification saved to database');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function verifyPlace(placeId: string, dryRun: boolean) {
  console.log(`\n🔍 Verifying place: ${placeId}`);
  console.log('─'.repeat(50));

  // 1. Get place from database
  const place = await getPlace(placeId);
  console.log(`📍 ${place.name} (${place.place_type})`);

  // 2. Fetch Google Places data
  let googleData: GooglePlaceResult | null = null;
  if (place.google_place_id) {
    console.log('📡 Fetching Google Places data...');
    googleData = await fetchGooglePlaceData(place.google_place_id);
    if (googleData) {
      console.log(`   Rating: ${googleData.rating ?? 'N/A'} (${googleData.user_ratings_total ?? 0} reviews)`);
    }
  } else {
    console.log('⚠️  No Google Place ID, skipping Google data');
  }

  // 3. Analyze with Claude
  console.log('🤖 Analyzing with Claude...');
  const result = await analyzeWithClaude(place, googleData);

  // 4. Display results
  console.log('\n📊 VERIFICATION RESULT');
  console.log('─'.repeat(50));
  console.log(`Status: ${result.status.toUpperCase()}`);
  console.log(`Confidence: ${(result.confidenceScore * 100).toFixed(0)}%`);
  console.log(`\nReasoning: ${result.reasoning}`);

  console.log('\n📝 Sola Notes:');
  for (const note of result.solaNotes) {
    console.log(`   • [${note.type}] ${note.text}`);
  }

  console.log('\n🔢 Signals:');
  for (const [key, signal] of Object.entries(result.signals)) {
    console.log(`   ${key}: ${signal.value} (${(signal.confidence * 100).toFixed(0)}% confidence)`);
  }

  // 5. Save to database (unless dry run)
  if (!dryRun) {
    console.log('\n💾 Saving to database...');
    await saveVerificationResult(placeId, result, googleData);
  } else {
    console.log('\n⏭️  Dry run - not saving to database');
  }

  console.log('\n✅ Verification complete');
  return result;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const placeId = args.find(a => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');

  if (!placeId) {
    console.log('Sola Place Verification');
    console.log('─'.repeat(50));
    console.log('Usage:');
    console.log('  npx tsx scripts/verify-place.ts <place_id>');
    console.log('  npx tsx scripts/verify-place.ts <place_id> --dry-run');
    console.log('\nRequired environment variables:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY');
    console.log('  EXPO_PUBLIC_SUPABASE_URL');
    console.log('  GOOGLE_PLACES_API_KEY');
    console.log('  ANTHROPIC_API_KEY');
    process.exit(1);
  }

  // Check required env vars
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required');
    process.exit(1);
  }

  try {
    await verifyPlace(placeId, dryRun);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

main();
