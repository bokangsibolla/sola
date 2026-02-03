/**
 * Batch Accommodation Verification Script
 *
 * Verifies all unverified accommodations in a city or country.
 *
 * Usage:
 *   npx tsx scripts/verify-accommodations.ts --city bangkok
 *   npx tsx scripts/verify-accommodations.ts --country thailand
 *   npx tsx scripts/verify-accommodations.ts --city bangkok --dry-run
 *   npx tsx scripts/verify-accommodations.ts --city bangkok --limit 5
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
// Types (same as verify-place.ts)
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

interface VerificationSummary {
  total: number;
  passed: number;
  failed: number;
  insufficientData: number;
  errors: number;
}

// Rate limiting: 2 seconds between API calls
const RATE_LIMIT_MS = 2000;

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

async function fetchGooglePlaceData(googlePlaceId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

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
    if (data.status !== 'OK') return null;
    return data.result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Claude AI Verification (same as verify-place.ts)
// ---------------------------------------------------------------------------

async function analyzeWithClaude(
  place: Record<string, unknown>,
  googleData: GooglePlaceResult | null,
): Promise<VerificationResult> {
  const anthropic = new Anthropic();

  const reviewsText = googleData?.reviews
    ?.slice(0, 10)
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

1. ROOM CLARITY - Is room/bathroom type clearly stated? Female-only options marked?
2. SECURITY SIGNALS - Any mentions of locks, security, feeling safe? Complaints?
3. SURROUNDINGS - Walkable neighborhood? Transport access? Area safety?
4. OPERATIONS - Check-in hours clear? 24h option? Guest policy? Hidden fees?
5. ACCURACY - Photos accurate? Location correct? Bait-and-switch complaints?
6. SOLO TRAVELER EXPERIENCE - Solo/female traveler reviews positive? Harassment mentions?

Respond with a JSON object:
{
  "status": "baseline_passed" | "baseline_failed" | "insufficient_data",
  "signals": { "signal_key": { "value": "true/false/text", "confidence": 0.0-1.0, "source": "string" } },
  "sola_notes": [{ "type": "highlight|context|consideration", "text": "Short factual note", "context": "always" }],
  "confidence_score": 0.0-1.0,
  "reasoning": "Brief explanation"
}

For sola_notes, create 2-4 SHORT, FACTUAL notes (e.g., "Female-only dorm available", "24h check-in", "5 min walk to metro").

Only output the JSON object.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse Claude response');

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

async function getUnverifiedAccommodations(
  cityId?: string,
  countryId?: string,
  limit?: number,
) {
  let query = supabase
    .from('places')
    .select('*, cities!inner(id, name, country_id)')
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .eq('is_active', true)
    .eq('verification_status', 'unverified');

  if (cityId) {
    query = query.eq('city_id', cityId);
  } else if (countryId) {
    query = query.eq('cities.country_id', countryId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function getCityBySlug(slug: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', slug)
    .single();
  if (error) throw new Error(`City not found: ${slug}`);
  return data;
}

async function getCountryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name')
    .eq('slug', slug)
    .single();
  if (error) throw new Error(`Country not found: ${slug}`);
  return data;
}

async function saveVerificationResult(
  placeId: string,
  result: VerificationResult,
  googleData: GooglePlaceResult | null,
) {
  const now = new Date().toISOString();

  // Update place
  await supabase
    .from('places')
    .update({
      verification_status: result.status,
      verified_at: now,
    })
    .eq('id', placeId);

  // Save verification run
  await supabase
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

  // Save signals
  for (const [key, signal] of Object.entries(result.signals)) {
    await supabase
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
  }

  // Save Sola notes
  await supabase.from('place_sola_notes').delete().eq('place_id', placeId);
  for (let i = 0; i < result.solaNotes.length; i++) {
    const note = result.solaNotes[i];
    await supabase.from('place_sola_notes').insert({
      place_id: placeId,
      note_type: note.type,
      note_text: note.text,
      display_context: note.context ?? 'always',
      order_index: i,
    });
  }
}

// ---------------------------------------------------------------------------
// Main Verification Loop
// ---------------------------------------------------------------------------

async function verifyAccommodations(
  places: Record<string, unknown>[],
  dryRun: boolean,
): Promise<VerificationSummary> {
  const summary: VerificationSummary = {
    total: places.length,
    passed: 0,
    failed: 0,
    insufficientData: 0,
    errors: 0,
  };

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const placeId = place.id as string;
    const placeName = place.name as string;
    const placeType = place.place_type as string;

    console.log(`\n[${i + 1}/${places.length}] ${placeName} (${placeType})`);

    try {
      // Fetch Google data
      let googleData: GooglePlaceResult | null = null;
      if (place.google_place_id) {
        googleData = await fetchGooglePlaceData(place.google_place_id as string);
      }

      // Analyze with Claude
      const result = await analyzeWithClaude(place, googleData);

      // Update summary
      if (result.status === 'baseline_passed') {
        summary.passed++;
        console.log(`   ✅ PASSED (${(result.confidenceScore * 100).toFixed(0)}% confidence)`);
      } else if (result.status === 'baseline_failed') {
        summary.failed++;
        console.log(`   ❌ FAILED: ${result.reasoning}`);
      } else {
        summary.insufficientData++;
        console.log(`   ⚠️  INSUFFICIENT DATA: ${result.reasoning}`);
      }

      // Show Sola notes
      if (result.solaNotes.length > 0) {
        console.log(`   Notes: ${result.solaNotes.map(n => n.text).join(' | ')}`);
      }

      // Save to database
      if (!dryRun) {
        await saveVerificationResult(placeId, result, googleData);
      }
    } catch (error) {
      summary.errors++;
      console.log(`   💥 ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Rate limit
    if (i < places.length - 1) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
    }
  }

  return summary;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const citySlug = args.includes('--city')
    ? args[args.indexOf('--city') + 1]
    : undefined;
  const countrySlug = args.includes('--country')
    ? args[args.indexOf('--country') + 1]
    : undefined;
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1], 10)
    : undefined;
  const dryRun = args.includes('--dry-run');

  if (!citySlug && !countrySlug) {
    console.log('Sola Batch Accommodation Verification');
    console.log('─'.repeat(50));
    console.log('Usage:');
    console.log('  npx tsx scripts/verify-accommodations.ts --city <slug>');
    console.log('  npx tsx scripts/verify-accommodations.ts --country <slug>');
    console.log('  npx tsx scripts/verify-accommodations.ts --city <slug> --limit 5');
    console.log('  npx tsx scripts/verify-accommodations.ts --city <slug> --dry-run');
    console.log('\nRequired environment variables:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY, EXPO_PUBLIC_SUPABASE_URL');
    console.log('  GOOGLE_PLACES_API_KEY, ANTHROPIC_API_KEY');
    process.exit(1);
  }

  // Check env vars
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required');
    process.exit(1);
  }

  console.log('🔍 Sola Batch Accommodation Verification');
  console.log('─'.repeat(50));

  try {
    let cityId: string | undefined;
    let countryId: string | undefined;
    let locationName: string;

    if (citySlug) {
      const city = await getCityBySlug(citySlug);
      cityId = city.id;
      locationName = city.name;
      console.log(`📍 City: ${locationName}`);
    } else {
      const country = await getCountryBySlug(countrySlug!);
      countryId = country.id;
      locationName = country.name;
      console.log(`📍 Country: ${locationName}`);
    }

    if (dryRun) console.log('⏭️  Dry run mode - not saving to database');
    if (limit) console.log(`📊 Limit: ${limit} places`);

    // Get unverified accommodations
    const places = await getUnverifiedAccommodations(cityId, countryId, limit);
    console.log(`📦 Found ${places.length} unverified accommodations`);

    if (places.length === 0) {
      console.log('\n✅ No unverified accommodations to process');
      return;
    }

    // Verify all places
    const summary = await verifyAccommodations(places, dryRun);

    // Print summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total processed: ${summary.total}`);
    console.log(`✅ Passed:        ${summary.passed}`);
    console.log(`❌ Failed:        ${summary.failed}`);
    console.log(`⚠️  Insufficient:  ${summary.insufficientData}`);
    console.log(`💥 Errors:        ${summary.errors}`);
    console.log('═'.repeat(50));

    if (!dryRun) {
      console.log('\n✅ All results saved to database');
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

main();
