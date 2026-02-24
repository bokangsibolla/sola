/**
 * Mega Accommodation Discovery + Seeding Script
 *
 * Discovers new accommodations across ALL cities, seeds with full data,
 * downloads photos, and cross-checks women-only.
 *
 * Budget-aware: tracks API costs in real-time with configurable hard cap.
 *
 * Usage:
 *   npx tsx scripts/mega-discover-accommodations.ts
 *   npx tsx scripts/mega-discover-accommodations.ts --budget 5
 *   npx tsx scripts/mega-discover-accommodations.ts --dry-run
 *   npx tsx scripts/mega-discover-accommodations.ts --max-per-city 3
 */

import { randomUUID } from 'crypto';
import {
  supabase,
  BUCKET,
  selectBestPhotos,
  downloadAndResize,
  uploadToStorage,
  sleep,
  slugify,
  type PhotoCandidate,
  type ResizeConfig,
} from './lib/image-utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const PRIMARY_CONFIG: ResizeConfig = { width: 800, height: 600, fetchWidth: 1600 };
const SECONDARY_CONFIG: ResizeConfig = { width: 600, height: 400, fetchWidth: 1200 };
const RATE_LIMIT_MS = 400;
const MAX_PHOTOS = 5;

/** Approximate per-request costs (USD) — Google Places API (New) */
const API_COST = {
  textSearch: 0.040,    // Advanced SKU (photos + rating fields)
  photoDownload: 0.007, // Photo media download
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CityRow {
  id: string;
  slug: string;
  name: string;
  country: string;
  countrySlug: string;
  accomCount: number;
}

interface DiscoveredPlace {
  googlePlaceId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: number | null;
  website: string | null;
  phone: string | null;
  photos: PhotoCandidate[];
  placeType: 'hotel' | 'hostel' | 'homestay';
  womenOnly: boolean;
  searchQuery: string;
}

// ---------------------------------------------------------------------------
// Cost tracker
// ---------------------------------------------------------------------------

let costSearches = 0;
let costPhotos = 0;

function currentCost(): number {
  return costSearches * API_COST.textSearch + costPhotos * API_COST.photoDownload;
}

function canAfford(type: 'search' | 'photo', budget: number): boolean {
  const cost = type === 'search' ? API_COST.textSearch : API_COST.photoDownload;
  return currentCost() + cost <= budget;
}

// ---------------------------------------------------------------------------
// Google Places API (New) — Text Search
// ---------------------------------------------------------------------------

async function textSearchLodging(query: string, max: number = 10): Promise<DiscoveredPlace[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': [
        'places.id', 'places.displayName', 'places.formattedAddress',
        'places.location', 'places.rating', 'places.userRatingCount',
        'places.websiteUri', 'places.internationalPhoneNumber',
        'places.photos', 'places.priceLevel',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery: query,
      includedType: 'lodging',
      maxResultCount: max,
      languageCode: 'en',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`    ⚠ API error (${res.status}): ${text.slice(0, 120)}`);
    return [];
  }

  const data = await res.json();
  return (data.places ?? []).map((p: any) => {
    const name: string = p.displayName?.text ?? '';
    const nl = name.toLowerCase();

    // Infer accommodation type
    // Known hostel brands that don't have "hostel" in the name
    const HOSTEL_BRANDS = [
      'mad monkey', 'lub d', 'slumber party', 'selina', 'zostel',
      'the hive', 'bodega', 'che lagarto', 'wild rover', 'loki',
      'reggae mansion', 'nook', 'tropica bungalow', 'bed station',
      'sleep club', 'snooze', 'doze', 'bunk', 'urban slumber',
    ];
    let placeType: 'hotel' | 'hostel' | 'homestay' = 'hotel';
    if (
      nl.includes('hostel') || nl.includes('backpacker') ||
      nl.includes('capsule') || nl.includes('pod') || nl.includes('dorm') ||
      HOSTEL_BRANDS.some(brand => nl.includes(brand))
    ) {
      placeType = 'hostel';
    } else if (nl.includes('guesthouse') || nl.includes('guest house') || nl.includes('homestay') || nl.includes('riad') || nl.includes('ryokan') || nl.includes('pension') || nl.includes('villa')) {
      placeType = 'homestay';
    }

    // Women-only detection from name
    const womenOnly =
      nl.includes('female') || nl.includes('women only') ||
      nl.includes('woman only') || nl.includes('ladies only') ||
      nl.includes('girls only') || nl.includes('women\'s');

    // Price level enum → number
    const priceLevelMap: Record<string, number> = {
      PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    };

    const photos: PhotoCandidate[] = (p.photos ?? []).map((ph: any) => ({
      photoName: ph.name,
      widthPx: ph.widthPx ?? 0,
      heightPx: ph.heightPx ?? 0,
      attribution: ph.authorAttributions?.[0]?.displayName ?? null,
    }));

    return {
      googlePlaceId: p.id,
      name,
      address: p.formattedAddress ?? '',
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
      priceLevel: priceLevelMap[p.priceLevel] ?? null,
      website: p.websiteUri ?? null,
      phone: p.internationalPhoneNumber ?? null,
      photos,
      placeType,
      womenOnly,
      searchQuery: query,
    } satisfies DiscoveredPlace;
  });
}

// ---------------------------------------------------------------------------
// Region-aware search queries
// ---------------------------------------------------------------------------

function getSearchQueries(city: CityRow): string[] {
  const { name, country, countrySlug, accomCount } = city;
  const loc = `${name} ${country}`;

  // For well-covered cities, only search for women-specific
  if (accomCount >= 5) {
    return [`women only female only hostel ${loc}`];
  }

  // Base queries for all regions
  const queries: string[] = [
    `best hostel solo female traveler ${loc}`,
    `boutique hotel for women ${loc}`,
  ];

  // Region-specific additions
  if (['japan'].includes(countrySlug)) {
    queries.push(`women only capsule hotel ${loc}`);
  } else if (['morocco'].includes(countrySlug)) {
    queries[1] = `riad boutique for women ${loc}`;
  } else if (['south-africa', 'mozambique', 'namibia', 'zimbabwe', 'lesotho'].includes(countrySlug)) {
    queries[1] = `boutique lodge guesthouse ${loc}`;
  } else if (['indonesia'].includes(countrySlug)) {
    queries.push(`yoga retreat women ${loc}`);
  }

  // Extra search for very underserved cities
  if (accomCount <= 1) {
    queries.push(`accommodation guesthouse ${loc}`);
  }

  return queries;
}

// ---------------------------------------------------------------------------
// Database operations
// ---------------------------------------------------------------------------

async function getExistingGoogleIds(cityId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('places')
    .select('google_place_id')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .not('google_place_id', 'is', null);
  return new Set((data ?? []).map((r: any) => r.google_place_id));
}

async function getExistingNames(cityId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('places')
    .select('name')
    .eq('city_id', cityId)
    .eq('is_active', true);
  return new Set((data ?? []).map((r: any) => r.name.toLowerCase()));
}

async function insertPlace(
  place: DiscoveredPlace,
  city: CityRow,
): Promise<string> {
  const id = randomUUID();
  // Make slug unique by appending short UUID
  const slug = `${slugify(place.name)}-${id.slice(0, 6)}`;

  const curationScore = (place.rating && place.reviewCount)
    ? +(place.rating * Math.log10(place.reviewCount + 1)).toFixed(2)
    : null;

  // Build a useful description
  const ratingText = place.rating ? `${place.rating}/5 by ${place.reviewCount ?? 0} travelers` : 'Newly discovered';
  const womenText = place.womenOnly ? ' This is a women-only establishment.' : '';
  const description = `${place.name} — a ${place.placeType} in ${city.name}, ${city.country}. Rated ${ratingText}.${womenText}`;

  const positioningSummary = description.slice(0, 200);

  const { error } = await supabase.from('places').insert({
    id,
    city_id: city.id,
    slug,
    name: place.name,
    place_type: place.placeType,
    lat: place.lat,
    lng: place.lng,
    address: place.address,
    google_place_id: place.googlePlaceId,
    phone: place.phone,
    website: place.website,
    price_level: place.priceLevel,
    description,
    is_active: true,
    curation_score: curationScore,
    google_rating: place.rating,
    google_review_count: place.reviewCount,
    discovered_at: new Date().toISOString(),
    women_only: place.womenOnly,
    positioning_summary: positioningSummary,
    check_in_time: '2:00 PM',
    check_out_time: '11:00 AM',
    payment_types: ['Cash', 'Credit Card'],
    best_time_of_day: 'any',
    original_type: place.placeType,
  });

  if (error) throw error;
  return id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const budget = args.includes('--budget')
    ? parseFloat(args[args.indexOf('--budget') + 1])
    : 10.0;
  const dryRun = args.includes('--dry-run');
  const skipRecent = args.includes('--skip-recent');
  const maxPerCity = args.includes('--max-per-city')
    ? parseInt(args[args.indexOf('--max-per-city') + 1], 10)
    : 5;

  console.log('🚀 MEGA ACCOMMODATION DISCOVERY');
  console.log('═'.repeat(60));
  console.log(`  Budget:       $${budget.toFixed(2)}`);
  console.log(`  Max/city:     ${maxPerCity}`);
  console.log(`  Skip recent:  ${skipRecent}`);
  console.log(`  Dry run:      ${dryRun}`);
  console.log('');

  // ---- Load all cities with accommodation counts ----

  const { data: cityData, error: cityErr } = await supabase
    .from('cities')
    .select('id, slug, name, countries!inner(name, slug)')
    .order('name');
  if (cityErr) throw cityErr;

  const { data: accomRows } = await supabase
    .from('places')
    .select('city_id')
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .eq('is_active', true);

  const countMap = new Map<string, number>();
  for (const r of accomRows ?? []) {
    countMap.set(r.city_id, (countMap.get(r.city_id) ?? 0) + 1);
  }

  const cities: CityRow[] = (cityData ?? []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    country: (c.countries as any)?.name ?? '',
    countrySlug: (c.countries as any)?.slug ?? '',
    accomCount: countMap.get(c.id) ?? 0,
  }));

  // Sort: fewest accommodations first (maximum impact)
  cities.sort((a, b) => a.accomCount - b.accomCount);

  console.log(`📍 ${cities.length} cities total\n`);
  console.log('Tier breakdown:');
  console.log(`  0 accommodations: ${cities.filter(c => c.accomCount === 0).length} cities`);
  console.log(`  1 accommodation:  ${cities.filter(c => c.accomCount === 1).length} cities`);
  console.log(`  2 accommodations: ${cities.filter(c => c.accomCount === 2).length} cities`);
  console.log(`  3 accommodations: ${cities.filter(c => c.accomCount === 3).length} cities`);
  console.log(`  4 accommodations: ${cities.filter(c => c.accomCount === 4).length} cities`);
  console.log(`  5+ accommodations: ${cities.filter(c => c.accomCount >= 5).length} cities`);
  console.log('');

  // Ensure storage bucket exists
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // If --skip-recent, find cities that were already enriched today
  const recentlyEnrichedCityIds = new Set<string>();
  if (skipRecent) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { data: recentPlaces } = await supabase
      .from('places')
      .select('city_id')
      .in('place_type', ['hotel', 'hostel', 'homestay'])
      .gte('discovered_at', `${today}T00:00:00Z`);
    for (const r of recentPlaces ?? []) {
      recentlyEnrichedCityIds.add(r.city_id);
    }
    console.log(`⏭ Skipping ${recentlyEnrichedCityIds.size} cities enriched today\n`);
  }

  // ---- Process cities ----

  let totalDiscovered = 0;
  let totalSeeded = 0;
  let totalPhotos = 0;
  let totalWomenOnly = 0;
  let citiesProcessed = 0;

  for (const city of cities) {
    if (!canAfford('search', budget)) {
      console.log(`\n💰 Budget limit reached ($${currentCost().toFixed(2)} / $${budget.toFixed(2)}). Done.`);
      break;
    }

    // Skip recently enriched cities
    if (skipRecent && recentlyEnrichedCityIds.has(city.id)) {
      continue;
    }

    console.log(`\n📍 ${city.name}, ${city.country} [${city.accomCount} existing]`);
    console.log('─'.repeat(50));
    citiesProcessed++;

    // Get search queries for this city
    const queries = getSearchQueries(city);

    // Load existing places for dedup
    const existingIds = await getExistingGoogleIds(city.id);
    const existingNames = await getExistingNames(city.id);

    const candidates: DiscoveredPlace[] = [];
    const seenIds = new Set<string>();

    // Run searches
    for (const q of queries) {
      if (!canAfford('search', budget)) break;

      console.log(`  🔍 "${q}"`);
      const results = await textSearchLodging(q, 10);
      costSearches++;

      let newCount = 0;
      for (const p of results) {
        if (existingIds.has(p.googlePlaceId)) continue;
        if (existingNames.has(p.name.toLowerCase())) continue;
        if (seenIds.has(p.googlePlaceId)) continue;
        if (p.rating !== null && p.rating < 3.5) continue;
        if (p.reviewCount !== null && p.reviewCount < 5) continue;
        if (p.lat === 0 && p.lng === 0) continue;

        seenIds.add(p.googlePlaceId);
        candidates.push(p);
        newCount++;
      }

      console.log(`    → ${results.length} results, ${newCount} new candidates`);
      await sleep(RATE_LIMIT_MS);
    }

    totalDiscovered += candidates.length;

    if (candidates.length === 0) {
      console.log('  ⏭ No new candidates');
      continue;
    }

    // Sort by quality + ensure type diversity
    candidates.sort((a, b) => {
      const sa = (a.rating ?? 0) * Math.log10((a.reviewCount ?? 1) + 1);
      const sb = (b.rating ?? 0) * Math.log10((b.reviewCount ?? 1) + 1);
      return sb - sa;
    });

    // Pick top N with type diversity
    const byType = {
      hostel: candidates.filter(p => p.placeType === 'hostel'),
      hotel: candidates.filter(p => p.placeType === 'hotel'),
      homestay: candidates.filter(p => p.placeType === 'homestay'),
    };

    const picked: DiscoveredPlace[] = [];
    // Round-robin across types
    let idx = 0;
    const types = ['hostel', 'hotel', 'homestay'] as const;
    while (picked.length < maxPerCity) {
      let added = false;
      for (const t of types) {
        if (picked.length >= maxPerCity) break;
        if (byType[t].length > idx) {
          picked.push(byType[t][idx]);
          added = true;
        }
      }
      if (!added) break;
      idx++;
    }

    console.log(`  ✨ Seeding ${picked.length} places:`);

    // Seed each picked place
    for (const place of picked) {
      const icon = place.placeType === 'hostel' ? '🏠' : place.placeType === 'hotel' ? '🏨' : '🏡';
      const wTag = place.womenOnly ? ' [WOMEN ONLY]' : '';
      console.log(`    ${icon} ${place.name} (${place.rating ?? '?'}★, ${place.reviewCount ?? 0} reviews)${wTag}`);

      if (dryRun) {
        totalSeeded++;
        if (place.womenOnly) totalWomenOnly++;
        continue;
      }

      try {
        const placeId = await insertPlace(place, city);

        // Download photos
        const best = selectBestPhotos(place.photos, MAX_PHOTOS);
        let primaryUrl: string | null = null;

        for (let i = 0; i < best.length; i++) {
          if (!canAfford('photo', budget)) {
            console.log('      ⚠ Budget limit, skipping remaining photos');
            break;
          }

          try {
            const config = i === 0 ? PRIMARY_CONFIG : SECONDARY_CONFIG;
            const suffix = i === 0 ? '' : `-${i + 1}`;
            const path = `places/${city.countrySlug}/${slugify(place.name)}-${placeId.slice(0, 8)}${suffix}.jpg`;

            const img = await downloadAndResize(best[i].photoName, config);
            costPhotos++;
            const url = await uploadToStorage(path, img);

            if (i === 0) primaryUrl = url;

            await supabase.from('place_media').insert({
              id: randomUUID(),
              place_id: placeId,
              url,
              media_type: 'image',
              caption: best[i].attribution ? `Photo by ${best[i].attribution}` : null,
              source: 'google',
              order_index: i,
            });
            totalPhotos++;
          } catch (e: any) {
            console.log(`      ⚠ Photo ${i + 1} failed: ${e.message.slice(0, 60)}`);
          }
          await sleep(150);
        }

        if (primaryUrl) {
          await supabase.from('places').update({ image_url_cached: primaryUrl }).eq('id', placeId);
        }

        totalSeeded++;
        if (place.womenOnly) totalWomenOnly++;
        console.log(`      ✅ Seeded (${best.length} photos)`);
      } catch (e: any) {
        console.log(`      ❌ ${e.message.slice(0, 100)}`);
      }

      await sleep(RATE_LIMIT_MS);
    }
  }

  // ---- Summary ----

  console.log('\n' + '═'.repeat(60));
  console.log('📊 MEGA DISCOVERY SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Cities processed:    ${citiesProcessed}`);
  console.log(`  Places discovered:   ${totalDiscovered}`);
  console.log(`  Places seeded:       ${totalSeeded}`);
  console.log(`  Women-only found:    ${totalWomenOnly}`);
  console.log(`  Photos uploaded:     ${totalPhotos}`);
  console.log('');
  console.log('💰 API COSTS');
  console.log(`  Text searches:   ${costSearches.toString().padStart(4)} × $${API_COST.textSearch.toFixed(3)} = $${(costSearches * API_COST.textSearch).toFixed(2)}`);
  console.log(`  Photo downloads: ${costPhotos.toString().padStart(4)} × $${API_COST.photoDownload.toFixed(3)} = $${(costPhotos * API_COST.photoDownload).toFixed(2)}`);
  console.log(`  ──────────────────────────────────────`);
  console.log(`  TOTAL:  $${currentCost().toFixed(2)} / $${budget.toFixed(2)} budget`);
  console.log('═'.repeat(60));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
