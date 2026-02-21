/**
 * Enrich Women-Only Flag for Accommodations
 *
 * Scans existing DB text fields + Google Places reviews for keywords
 * that indicate women-only accommodation options (female dorms,
 * women's floors, ladies-only spaces). No AI needed.
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
 */

import { supabase } from './seed-utils';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RATE_LIMIT_MS = 1500;

// Keywords that indicate women-only accommodation options.
// These are matched case-insensitively against all text sources.
const WOMEN_ONLY_KEYWORDS = [
  'female-only dorm',
  'female only dorm',
  'female dorm',
  'all-female dorm',
  'all female dorm',
  'women-only dorm',
  'women only dorm',
  'women\'s dorm',
  'ladies dorm',
  'ladies-only',
  'ladies only',
  'women-only floor',
  'women only floor',
  'women\'s floor',
  'female floor',
  'female-only room',
  'female only room',
  'women-only room',
  'women only room',
  'female capsule',
  'women-only capsule',
  'women only',
  'female-only',
  'female only',
  'women-only hostel',
  'women only hostel',
  'female-only accommodation',
];

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
}

interface GooglePlaceResult {
  name?: string;
  reviews?: GoogleReview[];
}

interface MatchResult {
  matched: boolean;
  sources: string[];   // where the match was found
  keywords: string[];  // which keywords matched
}

// ---------------------------------------------------------------------------
// Keyword matching
// ---------------------------------------------------------------------------

function findKeywordMatches(text: string): string[] {
  const lower = text.toLowerCase();
  return WOMEN_ONLY_KEYWORDS.filter((kw) => lower.includes(kw));
}

function classifyPlace(
  place: Record<string, unknown>,
  googleReviews: string[],
): MatchResult {
  const sources: string[] = [];
  const allKeywords: string[] = [];

  // Check highlights array
  const highlights = place.highlights as string[] | null;
  if (highlights) {
    const text = highlights.join(' ');
    const matches = findKeywordMatches(text);
    if (matches.length > 0) {
      sources.push('highlights');
      allKeywords.push(...matches);
    }
  }

  // Check why_selected
  const whySelected = place.why_selected as string | null;
  if (whySelected) {
    const matches = findKeywordMatches(whySelected);
    if (matches.length > 0) {
      sources.push('why_selected');
      allKeywords.push(...matches);
    }
  }

  // Check solo_female_reviews
  const soloReviews = place.solo_female_reviews as string | null;
  if (soloReviews) {
    const matches = findKeywordMatches(soloReviews);
    if (matches.length > 0) {
      sources.push('solo_female_reviews');
      allKeywords.push(...matches);
    }
  }

  // Check description
  const description = place.description as string | null;
  if (description) {
    const matches = findKeywordMatches(description);
    if (matches.length > 0) {
      sources.push('description');
      allKeywords.push(...matches);
    }
  }

  // Check curation_notes
  const curationNotes = place.curation_notes as string | null;
  if (curationNotes) {
    const matches = findKeywordMatches(curationNotes);
    if (matches.length > 0) {
      sources.push('curation_notes');
      allKeywords.push(...matches);
    }
  }

  // Check Google reviews
  if (googleReviews.length > 0) {
    const allReviewText = googleReviews.join(' ');
    const matches = findKeywordMatches(allReviewText);
    if (matches.length > 0) {
      sources.push(`google_reviews (${googleReviews.length} reviews)`);
      allKeywords.push(...matches);
    }
  }

  // Deduplicate keywords
  const uniqueKeywords = Array.from(new Set(allKeywords));

  return {
    matched: uniqueKeywords.length > 0,
    sources,
    keywords: uniqueKeywords,
  };
}

// ---------------------------------------------------------------------------
// Google Places API — fetch reviews
// ---------------------------------------------------------------------------

async function fetchGoogleReviews(googlePlaceId: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !googlePlaceId) return [];

  // Skip hex-format IDs (not valid place IDs)
  if (googlePlaceId.includes(':') && !googlePlaceId.startsWith('ChI')) return [];

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=reviews&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') return [];
    return (data.result.reviews ?? []).map((r: GoogleReview) => r.text);
  } catch {
    return [];
  }
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

  console.log('🏨 Scanning accommodations for women-only signals...');
  if (dryRun) console.log('  (DRY RUN — no database updates)');
  if (citySlug) console.log(`  City: ${citySlug}`);
  if (countrySlug) console.log(`  Country: ${countrySlug}`);

  const places = await getAccommodations(citySlug, countrySlug, limit);
  console.log(`\n  Found ${places.length} accommodations to scan\n`);

  let scanned = 0;
  let markedTrue = 0;
  let noMatch = 0;
  let errors = 0;

  for (const place of places) {
    const cityName = (place as any).cities?.name ?? 'Unknown';
    const label = `${place.name} (${place.place_type}, ${cityName})`;

    try {
      // Step 1: Check existing DB text fields first
      const dbResult = classifyPlace(place, []);

      // Step 2: If no match in DB, fetch Google reviews for more signals
      let finalResult = dbResult;
      let googleReviewCount = 0;

      if (!dbResult.matched && place.google_place_id) {
        const reviews = await fetchGoogleReviews(place.google_place_id);
        googleReviewCount = reviews.length;

        if (reviews.length > 0) {
          finalResult = classifyPlace(place, reviews);
        }

        // Rate limit Google API calls
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
      }

      // Print result
      if (finalResult.matched) {
        console.log(`🟢 ${label}`);
        console.log(`   Keywords: ${finalResult.keywords.join(', ')}`);
        console.log(`   Found in: ${finalResult.sources.join(', ')}`);
        markedTrue++;
      } else {
        console.log(`⚪ ${label}${googleReviewCount > 0 ? ` (checked ${googleReviewCount} Google reviews)` : ''}`);
        noMatch++;
      }

      // Step 3: Update database
      if (!dryRun && finalResult.matched) {
        await supabase
          .from('places')
          .update({ women_only: true })
          .eq('id', place.id);
        console.log('   → Updated women_only = true');
      }

      scanned++;
    } catch (err) {
      console.error(`❌ ${label}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Scanned:       ${scanned}`);
  console.log(`  Women-only:    ${markedTrue}`);
  console.log(`  No match:      ${noMatch}`);
  console.log(`  Errors:        ${errors}`);
  if (dryRun) console.log('\n  (DRY RUN — no changes written)');
  console.log('');
}

main().catch(console.error);
