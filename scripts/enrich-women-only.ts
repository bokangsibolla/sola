/**
 * Enrich Women-Only Flag for Accommodations
 *
 * Uses Google Places reviews + Claude to determine whether each
 * accommodation offers women-only options (female dorms, women's
 * floors, ladies-only spaces).
 *
 * Usage:
 *   npx tsx scripts/enrich-women-only.ts
 *   npx tsx scripts/enrich-women-only.ts --city bangkok
 *   npx tsx scripts/enrich-women-only.ts --country thailand
 *   npx tsx scripts/enrich-women-only.ts --dry-run
 *   npx tsx scripts/enrich-women-only.ts --limit 5
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
// Config
// ---------------------------------------------------------------------------

const RATE_LIMIT_MS = 2000;

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
}

interface GooglePlaceResult {
  name?: string;
  reviews?: GoogleReview[];
  types?: string[];
}

interface ClassificationResult {
  hasWomenOnlyOptions: boolean;
  confidence: number;
  evidence: string[];
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Google Places API — fetch reviews
// ---------------------------------------------------------------------------

async function fetchGoogleReviews(googlePlaceId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !googlePlaceId) return null;

  // Skip hex-format IDs
  if (googlePlaceId.includes(':') && !googlePlaceId.startsWith('ChI')) return null;

  const fields = 'name,reviews,types';
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
// Claude Classification
// ---------------------------------------------------------------------------

async function classifyWithClaude(
  place: Record<string, unknown>,
  googleData: GooglePlaceResult | null,
): Promise<ClassificationResult> {
  const anthropic = new Anthropic();

  const reviewsText = googleData?.reviews
    ?.slice(0, 15)
    ?.map((r, i) => `Review ${i + 1} (${r.rating}★): ${r.text}`)
    .join('\n\n') ?? 'No Google reviews available';

  const prompt = `You are classifying an accommodation for Sola, a solo female travel app.

TASK: Determine whether this place offers any WOMEN-ONLY or FEMALE-ONLY accommodation options. This includes:
- Female-only dorms or rooms
- Women's floors
- Ladies-only wings or sections
- Entirely women-only properties
- Female capsule sections

It does NOT include:
- Places that are generally "female-friendly" or "safe for women" (that's different)
- Mixed dorms that happen to have female guests
- Places with good reviews from women (that's different from having dedicated women-only spaces)

PLACE DATA:
Name: ${place.name}
Type: ${place.place_type} (${place.original_type || place.place_type})
City: ${place.city_name || 'Unknown'}
Description: ${place.description || place.why_selected || 'None'}
Highlights: ${JSON.stringify(place.highlights) || 'None'}
Why Selected: ${place.why_selected || 'None'}
Solo Female Reviews: ${place.solo_female_reviews || 'None'}
Considerations: ${JSON.stringify(place.considerations) || 'None'}

GOOGLE REVIEWS:
${reviewsText}

Respond with ONLY a JSON object:
{
  "has_women_only_options": true | false,
  "confidence": 0.0-1.0,
  "evidence": ["quote or signal 1", "quote or signal 2"],
  "reasoning": "One sentence explaining your classification"
}

Be conservative — only set true if there is explicit evidence of women-only accommodation options. "Female-friendly" or "safe for solo women" alone is NOT enough.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { hasWomenOnlyOptions: false, confidence: 0, evidence: [], reasoning: 'Could not parse response' };
  }

  const result = JSON.parse(jsonMatch[0]);
  return {
    hasWomenOnlyOptions: result.has_women_only_options === true,
    confidence: result.confidence ?? 0,
    evidence: result.evidence ?? [],
    reasoning: result.reasoning ?? '',
  };
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

async function getAccommodations(citySlug?: string, countrySlug?: string, limit?: number) {
  let query = supabase
    .from('places')
    .select('*, cities!inner(id, name, slug, country_id, countries!inner(id, name, slug))')
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .eq('is_active', true);

  if (citySlug) {
    query = query.eq('cities.slug', citySlug);
  } else if (countrySlug) {
    query = query.eq('cities.countries.slug', countrySlug);
  }

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const citySlug = args.includes('--city') ? args[args.indexOf('--city') + 1] : undefined;
  const countrySlug = args.includes('--country') ? args[args.indexOf('--country') + 1] : undefined;
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : undefined;

  console.log('🏨 Enriching women-only classification for accommodations...');
  if (dryRun) console.log('  (DRY RUN — no database updates)');
  if (citySlug) console.log(`  City: ${citySlug}`);
  if (countrySlug) console.log(`  Country: ${countrySlug}`);

  const places = await getAccommodations(citySlug, countrySlug, limit);
  console.log(`\n  Found ${places.length} accommodations to classify\n`);

  let classified = 0;
  let markedTrue = 0;
  let markedFalse = 0;
  let errors = 0;

  for (const place of places) {
    const cityName = (place as any).cities?.name ?? 'Unknown';
    const label = `${place.name} (${place.place_type}, ${cityName})`;

    try {
      // Step 1: Fetch Google reviews for additional signals
      const googleData = place.google_place_id
        ? await fetchGoogleReviews(place.google_place_id)
        : null;

      const reviewCount = googleData?.reviews?.length ?? 0;

      // Step 2: Classify with Claude
      const result = await classifyWithClaude(
        { ...place, city_name: cityName },
        googleData,
      );

      const icon = result.hasWomenOnlyOptions ? '🟢' : '⚪';
      console.log(`${icon} ${label}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%  |  Google reviews: ${reviewCount}`);
      console.log(`   ${result.reasoning}`);
      if (result.evidence.length > 0) {
        console.log(`   Evidence: ${result.evidence.join(' | ')}`);
      }

      // Step 3: Update database
      if (!dryRun && result.confidence >= 0.6) {
        await supabase
          .from('places')
          .update({ women_only: result.hasWomenOnlyOptions })
          .eq('id', place.id);
      }

      if (result.hasWomenOnlyOptions) markedTrue++;
      else markedFalse++;
      classified++;

      console.log('');
    } catch (err) {
      console.error(`❌ ${label}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Total classified:  ${classified}`);
  console.log(`  Women-only:        ${markedTrue}`);
  console.log(`  Not women-only:    ${markedFalse}`);
  console.log(`  Errors:            ${errors}`);
  if (dryRun) console.log('\n  (DRY RUN — no changes written)');
  console.log('');
}

main().catch(console.error);
