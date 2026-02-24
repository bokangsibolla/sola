/**
 * Enrich ALL places with Google editorial summaries + reviews.
 *
 * For each place with a garbage/empty description:
 *   1. Fetch editorialSummary + reviews via Place Details API (New)
 *   2. Build a real description from the editorial summary
 *   3. Build a why_selected "Our Take" from reviews
 *   4. Extract practical details (hours, duration hints)
 *   5. Update rating/review count with fresh data
 *
 * Usage:
 *   npx tsx scripts/enrich-all-places.ts
 *   npx tsx scripts/enrich-all-places.ts --budget 10
 *   npx tsx scripts/enrich-all-places.ts --dry-run
 *   npx tsx scripts/enrich-all-places.ts --type landmark
 *   npx tsx scripts/enrich-all-places.ts --only-garbage
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

const RATE_LIMIT_MS = 250;

/**
 * Place Details (New) cost depends on fields requested:
 * - Basic (name, type): free
 * - Advanced (editorialSummary): ~$0.005
 * - Atmosphere (reviews): ~$0.01
 * - Contact (phone, website): ~$0.003
 * Total: ~$0.02 per call
 */
const COST_PER_DETAIL = 0.02;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaceRow {
  id: string;
  name: string;
  google_place_id: string;
  place_type: string;
  description: string | null;
  why_selected: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  city_name: string | null;
}

interface GoogleReview {
  text: string;
  rating: number;
  authorName: string;
}

interface PlaceDetails {
  editorialSummary: string | null;
  reviews: GoogleReview[];
  rating: number | null;
  reviewCount: number | null;
  websiteUri: string | null;
  phone: string | null;
  hoursText: string[] | null;
  goodForChildren: boolean | null;
}

// ---------------------------------------------------------------------------
// Google Places API (New) — Place Details
// ---------------------------------------------------------------------------

async function fetchPlaceDetails(googlePlaceId: string): Promise<PlaceDetails | null> {
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': [
        'editorialSummary',
        'reviews',
        'rating',
        'userRatingCount',
        'websiteUri',
        'internationalPhoneNumber',
        'currentOpeningHours.weekdayDescriptions',
        'goodForChildren',
      ].join(','),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404 || res.status === 400) return null;
    throw new Error(`Place Details failed (${res.status}): ${text.slice(0, 120)}`);
  }

  const data = await res.json();

  const reviews: GoogleReview[] = (data.reviews ?? []).map((r: any) => ({
    text: r.text?.text ?? '',
    rating: r.rating ?? 0,
    authorName: r.authorAttribution?.displayName ?? '',
  }));

  return {
    editorialSummary: data.editorialSummary?.text ?? null,
    reviews,
    rating: data.rating ?? null,
    reviewCount: data.userRatingCount ?? null,
    websiteUri: data.websiteUri ?? null,
    phone: data.internationalPhoneNumber ?? null,
    hoursText: data.currentOpeningHours?.weekdayDescriptions ?? null,
    goodForChildren: data.goodForChildren ?? null,
  };
}

// ---------------------------------------------------------------------------
// Content generation
// ---------------------------------------------------------------------------

/** Build a real description from the editorial summary + reviews */
function buildDescription(
  place: PlaceRow,
  details: PlaceDetails,
): string | null {
  // Priority 1: Google's editorial summary — this is a human-written description
  if (details.editorialSummary && details.editorialSummary.length > 30) {
    return details.editorialSummary;
  }

  // Priority 2: Synthesize from the best reviews
  const goodReviews = details.reviews
    .filter(r => r.rating >= 4 && r.text.length > 40 && r.text.length < 500)
    .sort((a, b) => b.text.length - a.text.length);

  if (goodReviews.length > 0) {
    // Find the most descriptive review (one that describes the place, not just "great!")
    const descriptiveReview = goodReviews.find(r => {
      const lower = r.text.toLowerCase();
      // Look for reviews that describe the place itself
      return lower.includes('this place') || lower.includes('the ') ||
        lower.includes('beautiful') || lower.includes('historic') ||
        lower.includes('famous') || lower.includes('located') ||
        lower.includes('offers') || lower.includes('features') ||
        lower.includes('built') || lower.includes('century') ||
        lower.includes('museum') || lower.includes('temple') ||
        lower.includes('garden') || lower.includes('market') ||
        lower.includes('beach') || lower.includes('view');
    });

    if (descriptiveReview) {
      // Take the first 2-3 sentences that describe the place
      const sentences = descriptiveReview.text
        .split(/[.!]+/)
        .map(s => s.trim())
        .filter(s => s.length > 15 && s.length < 200);

      if (sentences.length > 0) {
        return sentences.slice(0, 3).join('. ') + '.';
      }
    }

    // Fallback: use the longest well-rated review
    const best = goodReviews[0];
    const excerpt = best.text.length > 250 ? best.text.slice(0, 247) + '...' : best.text;
    return excerpt;
  }

  return null;
}

/** Build an "Our Take" from reviews — what matters for solo women */
function buildWhySelected(
  place: PlaceRow,
  details: PlaceDetails,
): string | null {
  const reviews = details.reviews;
  if (reviews.length === 0 && !details.editorialSummary) return null;

  const parts: string[] = [];

  // Extract safety/comfort signals from reviews
  const safetyKeywords = ['safe', 'secure', 'well-lit', 'friendly', 'welcoming',
    'comfortable', 'clean', 'peaceful', 'staff', 'helpful', 'alone', 'solo'];
  const crowdKeywords = ['crowded', 'busy', 'tourist', 'quiet', 'peaceful',
    'off the beaten path', 'hidden gem', 'popular', 'packed'];
  const practicalKeywords = ['bring', 'wear', 'arrive early', 'book ahead',
    'cash only', 'free entry', 'worth', 'skip', 'avoid', 'morning', 'afternoon',
    'sunset', 'sunrise', 'closing', 'opening', 'ticket', 'entry fee', 'entrance'];
  const womenKeywords = ['solo female', 'as a woman', 'solo woman', 'my wife',
    'my girlfriend', 'girls', 'ladies', 'women'];

  // Find the most useful review quotes
  for (const review of reviews) {
    if (review.rating < 3) continue;
    const lower = review.text.toLowerCase();
    const sentences = review.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15 && s.length < 200);

    // Women-specific insights (highest priority)
    const womenSentence = sentences.find(s =>
      womenKeywords.some(kw => s.toLowerCase().includes(kw))
    );
    if (womenSentence && parts.length < 3) {
      parts.push(womenSentence + '.');
      continue;
    }

    // Safety insights
    const safetySentence = sentences.find(s =>
      safetyKeywords.some(kw => s.toLowerCase().includes(kw)) &&
      !s.toLowerCase().includes('not safe') && !s.toLowerCase().includes('unsafe')
    );
    if (safetySentence && parts.length < 3) {
      parts.push(safetySentence + '.');
      continue;
    }

    // Practical tips
    const practicalSentence = sentences.find(s =>
      practicalKeywords.some(kw => s.toLowerCase().includes(kw))
    );
    if (practicalSentence && parts.length < 3) {
      parts.push(practicalSentence + '.');
      continue;
    }
  }

  // If we found useful review extracts, combine them
  if (parts.length > 0) {
    return parts.join(' ');
  }

  // Fallback: editorial summary as why_selected (if we didn't use it for description)
  if (details.editorialSummary && details.editorialSummary.length > 30) {
    return details.editorialSummary;
  }

  // Last resort: best review excerpt
  const bestReview = reviews.find(r => r.rating >= 4 && r.text.length > 50);
  if (bestReview) {
    const sentences = bestReview.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    return sentences.slice(0, 2).join('. ') + '.';
  }

  return null;
}

/** Extract practical "solo_female_reviews" content from reviews */
function buildSoloFemaleReviews(
  reviews: GoogleReview[],
): string | null {
  const womenKeywords = ['solo female', 'as a woman', 'solo woman', 'felt safe',
    'safe for women', 'girls', 'alone', 'my wife', 'my girlfriend', 'solo girl',
    'female travel', 'woman travel'];

  const quotes: string[] = [];

  for (const review of reviews) {
    if (review.rating < 3) continue;
    const lower = review.text.toLowerCase();
    const isRelevant = womenKeywords.some(kw => lower.includes(kw));

    if (isRelevant) {
      const sentences = review.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15 && s.length < 200);
      const relevant = sentences.filter(s =>
        womenKeywords.some(kw => s.toLowerCase().includes(kw))
      );
      if (relevant.length > 0) {
        quotes.push(`"${relevant.slice(0, 2).join('. ')}." — ${review.authorName}`);
      }
    }
  }

  return quotes.length > 0 ? quotes.slice(0, 3).join('\n\n') : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/** Check if description is garbage template */
function isGarbageDescription(desc: string | null): boolean {
  if (!desc) return true;
  if (desc.length < 30) return true;
  // Matches: "Name — type in City. Rated X/5" or "Name — type in City. Phone: ..."
  return /^.+ — .+ in .+\. (Rated|Phone)/.test(desc);
}

async function main() {
  const args = process.argv.slice(2);
  const budget = args.includes('--budget')
    ? parseFloat(args[args.indexOf('--budget') + 1])
    : 10.0;
  const dryRun = args.includes('--dry-run');
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1], 10)
    : 2000;
  const onlyGarbage = args.includes('--only-garbage');
  const typeFilter = args.includes('--type')
    ? args[args.indexOf('--type') + 1]
    : null;

  console.log('📝 UNIVERSAL PLACE ENRICHMENT');
  console.log('═'.repeat(60));
  console.log(`  Budget:       $${budget.toFixed(2)}`);
  console.log(`  Limit:        ${limit}`);
  console.log(`  Type filter:  ${typeFilter ?? 'all'}`);
  console.log(`  Only garbage: ${onlyGarbage}`);
  console.log(`  Dry run:      ${dryRun}`);
  console.log(`  Cost/call:    $${COST_PER_DETAIL.toFixed(3)}`);
  console.log(`  Max calls:    ${Math.floor(budget / COST_PER_DETAIL)}`);
  console.log('');

  // Build query — fetch places that need enrichment
  let query = supabase
    .from('places')
    .select(`
      id, name, google_place_id, place_type,
      description, why_selected,
      google_rating, google_review_count,
      cities!inner(name)
    `)
    .eq('is_active', true)
    .not('google_place_id', 'is', null)
    .order('google_review_count', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (typeFilter) {
    query = query.eq('place_type', typeFilter);
  }

  const { data: rawPlaces, error } = await query;
  if (error) throw error;

  // Map to our type
  const allPlaces: PlaceRow[] = (rawPlaces ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    google_place_id: r.google_place_id,
    place_type: r.place_type,
    description: r.description,
    why_selected: r.why_selected,
    google_rating: r.google_rating,
    google_review_count: r.google_review_count,
    city_name: r.cities?.name ?? null,
  }));

  // Filter to only garbage/empty if requested
  const places = onlyGarbage
    ? allPlaces.filter(p => isGarbageDescription(p.description))
    : allPlaces;

  console.log(`📍 ${places.length} places to process (${allPlaces.length} total fetched)\n`);

  // Stats by type
  const byType: Record<string, number> = {};
  for (const p of places) {
    byType[p.place_type] = (byType[p.place_type] ?? 0) + 1;
  }
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
  console.log('');

  let totalCalls = 0;
  let totalDescUpdated = 0;
  let totalWhyUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];

    // Budget check
    const spent = totalCalls * COST_PER_DETAIL;
    if (spent + COST_PER_DETAIL > budget) {
      console.log(`\n💰 Budget reached ($${spent.toFixed(2)} / $${budget.toFixed(2)}). Done.`);
      break;
    }

    const label = `[${i + 1}/${places.length}] ${place.place_type}/${place.name}`;

    if (dryRun) {
      console.log(`  ${label} → DRY RUN`);
      totalCalls++;
      continue;
    }

    try {
      const details = await fetchPlaceDetails(place.google_place_id);
      totalCalls++;

      if (!details) {
        console.log(`  ${label} → stale ID`);
        totalSkipped++;
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      const updates: Record<string, any> = {};

      // Always update rating/review count
      if (details.rating !== null) updates.google_rating = details.rating;
      if (details.reviewCount !== null) updates.google_review_count = details.reviewCount;

      // Update contact info if missing
      if (details.websiteUri) updates.website = details.websiteUri;
      if (details.phone) updates.phone = details.phone;

      // Update hours if available
      if (details.hoursText && details.hoursText.length > 0) {
        updates.hours_text = details.hoursText.join('; ');
      }

      // Update description if currently garbage
      if (isGarbageDescription(place.description)) {
        const newDesc = buildDescription(place, details);
        if (newDesc && newDesc.length > 30) {
          updates.description = newDesc;
          totalDescUpdated++;
        }
      }

      // Update why_selected if currently empty/short
      if (!place.why_selected || place.why_selected.length < 30 || isGarbageDescription(place.why_selected)) {
        const newWhy = buildWhySelected(place, details);
        if (newWhy && newWhy.length > 30) {
          updates.why_selected = newWhy;
          totalWhyUpdated++;
        }
      }

      // Update solo_female_reviews if we find relevant quotes
      const soloReviews = buildSoloFemaleReviews(details.reviews);
      if (soloReviews) {
        updates.solo_female_reviews = soloReviews;
      }

      // Recalculate curation score
      const rating = details.rating ?? place.google_rating;
      const reviewCount = details.reviewCount ?? place.google_review_count;
      if (rating && reviewCount) {
        updates.curation_score = +(rating * Math.log10(reviewCount + 1)).toFixed(2);
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase
          .from('places')
          .update(updates)
          .eq('id', place.id);
        if (updateErr) throw updateErr;
      }

      const editTag = details.editorialSummary ? ' [editorial]' : '';
      const reviewTag = details.reviews.length > 0 ? ` [${details.reviews.length}r]` : '';
      const descTag = updates.description ? ' [desc✓]' : '';
      const whyTag = updates.why_selected ? ' [why✓]' : '';
      console.log(`  ${label} → ${details.rating ?? '?'}★${editTag}${reviewTag}${descTag}${whyTag}`);

    } catch (err: any) {
      console.log(`  ${label} → ERROR: ${err.message.slice(0, 80)}`);
      totalErrors++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  const spent = totalCalls * COST_PER_DETAIL;
  console.log('\n' + '═'.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  API calls:          ${totalCalls}`);
  console.log(`  Descriptions added: ${totalDescUpdated}`);
  console.log(`  Why selected added: ${totalWhyUpdated}`);
  console.log(`  Skipped:            ${totalSkipped}`);
  console.log(`  Errors:             ${totalErrors}`);
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
