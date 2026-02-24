/**
 * Enrich accommodations with Google reviews.
 *
 * For each accommodation with a google_place_id:
 *   1. Fetch reviews via Place Details API (New)
 *   2. Extract women-relevant review quotes for `why_women_choose`
 *   3. Detect women-only mentions → update `women_only` flag
 *   4. Extract practical details (check-in, check-out, payment)
 *
 * Usage:
 *   npx tsx scripts/enrich-accommodation-reviews.ts
 *   npx tsx scripts/enrich-accommodation-reviews.ts --budget 5
 *   npx tsx scripts/enrich-accommodation-reviews.ts --dry-run
 *   npx tsx scripts/enrich-accommodation-reviews.ts --limit 50
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const RATE_LIMIT_MS = 300;

/** Place Details with reviews: Atmosphere SKU ~$0.005 + reviews ~$0.01 = ~$0.015 per call */
const COST_PER_DETAIL = 0.017;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaceRow {
  id: string;
  name: string;
  google_place_id: string;
  place_type: string;
  women_only: boolean;
  why_women_choose: string | null;
  description: string | null;
  google_rating: number | null;
  google_review_count: number | null;
}

interface GoogleReview {
  text: string;
  rating: number;
  authorName: string;
  relativePublishTimeDescription: string;
}

// ---------------------------------------------------------------------------
// Google Places API (New) — Place Details with reviews
// ---------------------------------------------------------------------------

async function fetchReviews(googlePlaceId: string): Promise<{
  reviews: GoogleReview[];
  rating: number | null;
  reviewCount: number | null;
  websiteUri: string | null;
  phone: string | null;
} | null> {
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': [
        'reviews', 'rating', 'userRatingCount',
        'websiteUri', 'internationalPhoneNumber',
      ].join(','),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404 || res.status === 400) return null; // stale ID
    throw new Error(`Place Details failed (${res.status}): ${text.slice(0, 120)}`);
  }

  const data = await res.json();
  const reviews: GoogleReview[] = (data.reviews ?? []).map((r: any) => ({
    text: r.text?.text ?? '',
    rating: r.rating ?? 0,
    authorName: r.authorAttribution?.displayName ?? '',
    relativePublishTimeDescription: r.relativePublishTimeDescription ?? '',
  }));

  return {
    reviews,
    rating: data.rating ?? null,
    reviewCount: data.userRatingCount ?? null,
    websiteUri: data.websiteUri ?? null,
    phone: data.internationalPhoneNumber ?? null,
  };
}

// ---------------------------------------------------------------------------
// Review analysis
// ---------------------------------------------------------------------------

/** Keywords that indicate a review is from a woman or about women's experience */
const WOMEN_KEYWORDS = [
  'solo female', 'solo woman', 'woman travel', 'women travel',
  'female travel', 'girl travel', 'ladies', 'as a woman',
  'female only', 'women only', 'girls only', 'ladies only',
  'safe for women', 'safe as a woman', 'felt safe',
  'female dorm', 'women dorm', 'all-female', 'all female',
  'my girlfriend', 'my wife', 'solo girl',
];

const WOMEN_ONLY_KEYWORDS = [
  'female only', 'women only', 'girls only', 'ladies only',
  'all-female', 'all female', 'women-only', 'female-only',
  'female floor', 'women floor', 'female dorm', 'women dorm',
];

const SAFETY_KEYWORDS = [
  'felt safe', 'very safe', 'safe area', 'safe neighborhood',
  'safe location', 'secure', 'well-lit', 'security',
  'comfortable alone', 'no issues', 'staff was helpful',
  'friendly staff', 'welcoming', 'clean',
];

function extractWomenRelevantQuotes(reviews: GoogleReview[]): string[] {
  const quotes: string[] = [];

  for (const review of reviews) {
    const textLower = review.text.toLowerCase();

    // Check for women-relevant content
    const isWomenRelevant = WOMEN_KEYWORDS.some(kw => textLower.includes(kw));
    const isSafetyRelevant = SAFETY_KEYWORDS.some(kw => textLower.includes(kw));

    if (isWomenRelevant || (isSafetyRelevant && review.rating >= 4)) {
      // Extract the most relevant sentence(s)
      const sentences = review.text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.length < 200);

      const relevantSentences = sentences.filter(s => {
        const sl = s.toLowerCase();
        return WOMEN_KEYWORDS.some(kw => sl.includes(kw)) ||
               SAFETY_KEYWORDS.some(kw => sl.includes(kw));
      });

      if (relevantSentences.length > 0) {
        const quote = relevantSentences.slice(0, 2).join('. ') + '.';
        quotes.push(`"${quote}" — ${review.authorName}`);
      } else if (review.text.length < 300) {
        // Short positive review, use whole thing
        quotes.push(`"${review.text.trim()}" — ${review.authorName}`);
      }
    }
  }

  return quotes.slice(0, 3); // Max 3 quotes
}

function detectWomenOnly(reviews: GoogleReview[], currentName: string): boolean {
  const nameLower = currentName.toLowerCase();
  if (WOMEN_ONLY_KEYWORDS.some(kw => nameLower.includes(kw))) return true;

  for (const review of reviews) {
    const textLower = review.text.toLowerCase();
    if (WOMEN_ONLY_KEYWORDS.some(kw => textLower.includes(kw))) return true;
  }

  return false;
}

function buildWhyWomenChoose(
  place: PlaceRow,
  reviews: GoogleReview[],
  womenQuotes: string[],
): string | null {
  const parts: string[] = [];

  // Add women-specific quotes if found
  if (womenQuotes.length > 0) {
    parts.push(womenQuotes.join('\n\n'));
  }

  // If no women-specific quotes, build from positive reviews
  if (parts.length === 0) {
    const positiveReviews = reviews
      .filter(r => r.rating >= 4 && r.text.length > 30)
      .sort((a, b) => b.rating - a.rating);

    // Look for safety/comfort mentions in positive reviews
    const safetyMentions = positiveReviews.filter(r =>
      SAFETY_KEYWORDS.some(kw => r.text.toLowerCase().includes(kw))
    );

    if (safetyMentions.length > 0) {
      const best = safetyMentions[0];
      const sentences = best.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
      const safetySentence = sentences.find(s =>
        SAFETY_KEYWORDS.some(kw => s.toLowerCase().includes(kw))
      );
      if (safetySentence) {
        parts.push(`"${safetySentence}." — ${best.authorName}`);
      }
    }

    // If still nothing, use the best-rated review excerpt
    if (parts.length === 0 && positiveReviews.length > 0) {
      const best = positiveReviews[0];
      const excerpt = best.text.length > 200
        ? best.text.slice(0, 197) + '...'
        : best.text;
      parts.push(`"${excerpt}" — ${best.authorName}`);
    }
  }

  return parts.length > 0 ? parts.join('\n\n') : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const budget = args.includes('--budget')
    ? parseFloat(args[args.indexOf('--budget') + 1])
    : 5.0;
  const dryRun = args.includes('--dry-run');
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1], 10)
    : 2000;
  const onlyEmpty = args.includes('--only-empty');

  console.log('📝 ACCOMMODATION REVIEW ENRICHMENT');
  console.log('═'.repeat(60));
  console.log(`  Budget:     $${budget.toFixed(2)}`);
  console.log(`  Limit:      ${limit}`);
  console.log(`  Only empty: ${onlyEmpty}`);
  console.log(`  Dry run:    ${dryRun}`);
  console.log(`  Cost/call:  $${COST_PER_DETAIL.toFixed(3)}`);
  console.log(`  Max calls:  ${Math.floor(budget / COST_PER_DETAIL)}`);
  console.log('');

  // Fetch all accommodations that need enrichment
  let query = supabase
    .from('places')
    .select('id, name, google_place_id, place_type, women_only, why_women_choose, description, google_rating, google_review_count')
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .eq('is_active', true)
    .not('google_place_id', 'is', null)
    .order('google_review_count', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (onlyEmpty) {
    query = query.or('why_women_choose.is.null,why_women_choose.eq.');
  }

  const { data: places, error } = await query;
  if (error) throw error;

  console.log(`📍 ${places?.length ?? 0} accommodations to process\n`);

  let totalCalls = 0;
  let totalUpdated = 0;
  let totalWomenOnlyFound = 0;
  let totalQuotesFound = 0;
  let totalSkipped = 0;

  for (let i = 0; i < (places?.length ?? 0); i++) {
    const place = places![i] as PlaceRow;

    // Budget check
    const spent = totalCalls * COST_PER_DETAIL;
    if (spent + COST_PER_DETAIL > budget) {
      console.log(`\n💰 Budget reached ($${spent.toFixed(2)} / $${budget.toFixed(2)}). Done.`);
      break;
    }

    const label = `[${i + 1}/${places!.length}] ${place.name}`;

    if (dryRun) {
      console.log(`  ${label} → DRY RUN`);
      totalCalls++;
      continue;
    }

    try {
      const result = await fetchReviews(place.google_place_id);
      totalCalls++;

      if (!result || result.reviews.length === 0) {
        console.log(`  ${label} → no reviews`);
        totalSkipped++;
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      // Extract women-relevant quotes
      const womenQuotes = extractWomenRelevantQuotes(result.reviews);
      const isWomenOnly = detectWomenOnly(result.reviews, place.name);
      const whyWomenChoose = buildWhyWomenChoose(place, result.reviews, womenQuotes);

      // Build update object
      const updates: Record<string, any> = {};

      // Always update rating/review count (freshest data)
      if (result.rating !== null) updates.google_rating = result.rating;
      if (result.reviewCount !== null) updates.google_review_count = result.reviewCount;

      // Update website/phone if missing
      if (result.websiteUri) updates.website = result.websiteUri;
      if (result.phone) updates.phone = result.phone;

      // Update why_women_choose if currently empty or if we found better quotes
      if (whyWomenChoose && (!place.why_women_choose || womenQuotes.length > 0)) {
        updates.why_women_choose = whyWomenChoose;
      }

      // Update women_only if detected
      if (isWomenOnly && !place.women_only) {
        updates.women_only = true;
        totalWomenOnlyFound++;
      }

      // Recalculate curation score
      const rating = result.rating ?? place.google_rating;
      const reviewCount = result.reviewCount ?? place.google_review_count;
      if (rating && reviewCount) {
        updates.curation_score = +(rating * Math.log10(reviewCount + 1)).toFixed(2);
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase
          .from('places')
          .update(updates)
          .eq('id', place.id);
        if (updateErr) throw updateErr;
        totalUpdated++;
      }

      const quotesTag = womenQuotes.length > 0 ? ` [${womenQuotes.length} quotes]` : '';
      const womenTag = isWomenOnly ? ' [WOMEN ONLY]' : '';
      console.log(`  ${label} → ${result.reviews.length} reviews, ${result.rating}★${quotesTag}${womenTag}`);
      if (womenQuotes.length > 0) totalQuotesFound++;

    } catch (err: any) {
      console.log(`  ${label} → ERROR: ${err.message.slice(0, 80)}`);
      totalSkipped++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  const spent = totalCalls * COST_PER_DETAIL;
  console.log('\n' + '═'.repeat(60));
  console.log('📊 REVIEW ENRICHMENT SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  API calls:         ${totalCalls}`);
  console.log(`  Places updated:    ${totalUpdated}`);
  console.log(`  Women quotes found: ${totalQuotesFound}`);
  console.log(`  Women-only found:  ${totalWomenOnlyFound}`);
  console.log(`  Skipped:           ${totalSkipped}`);
  console.log('');
  console.log('💰 API COSTS');
  console.log(`  Detail calls: ${totalCalls} × $${COST_PER_DETAIL.toFixed(3)} = $${spent.toFixed(2)}`);
  console.log(`  Budget:       $${budget.toFixed(2)}`);
  console.log('═'.repeat(60));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
