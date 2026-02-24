/**
 * Mega Philippines Population Script
 *
 * Discovers and seeds across all 12 Philippine cities:
 *   - Accommodations (hostels, hotels, guesthouses)
 *   - Activities & Things To Do (tours, diving, landmarks, wellness)
 *   - Healthcare (hospitals, clinics, pharmacies)
 *
 * Budget-aware with real-time cost tracking.
 *
 * Usage:
 *   npx tsx scripts/mega-populate-philippines.ts --budget 5
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

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const PRI: ResizeConfig = { width: 800, height: 600, fetchWidth: 1600 };
const SEC: ResizeConfig = { width: 600, height: 400, fetchWidth: 1200 };
const RATE_MS = 350;

const COST = { search: 0.040, photo: 0.007 };

const PHOTO_LIMITS: Record<Cat, number> = {
  accommodation: 4,
  activity: 3,
  healthcare: 1,
};

// Quality filters per category
const MIN_RATING: Record<Cat, number> = { accommodation: 3.5, activity: 3.0, healthcare: 0 };
const MIN_REVIEWS: Record<Cat, number> = { accommodation: 3, activity: 2, healthcare: 0 };

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type Cat = 'accommodation' | 'activity' | 'healthcare';
type PT =
  | 'hotel' | 'hostel' | 'homestay'
  | 'activity' | 'landmark' | 'tour' | 'wellness' | 'spa'
  | 'hospital' | 'clinic' | 'pharmacy';

interface City {
  id: string;
  slug: string;
  name: string;
  placeCount: number;
}

interface Found {
  gid: string;
  name: string;
  addr: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviews: number | null;
  price: number | null;
  web: string | null;
  phone: string | null;
  photos: PhotoCandidate[];
  pt: PT;
  cat: Cat;
  womenOnly: boolean;
  womenHealth: boolean;
}

interface SearchJob {
  query: string;
  cat: Cat;
  type?: string; // Google includedType
  max?: number;
}

// ═══════════════════════════════════════════════════════════════════
// BUDGET TRACKING
// ═══════════════════════════════════════════════════════════════════

let nSearch = 0;
let nPhoto = 0;
const spent = () => nSearch * COST.search + nPhoto * COST.photo;
const canAfford = (t: 'search' | 'photo', budget: number) =>
  spent() + COST[t] <= budget;

// ═══════════════════════════════════════════════════════════════════
// GOOGLE PLACES TEXT SEARCH
// ═══════════════════════════════════════════════════════════════════

const PL: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

async function textSearch(
  query: string,
  opts?: { type?: string; max?: number },
): Promise<Omit<Found, 'pt' | 'cat' | 'womenOnly' | 'womenHealth'>[]> {
  const body: Record<string, unknown> = {
    textQuery: query,
    maxResultCount: opts?.max ?? 10,
    languageCode: 'en',
  };
  if (opts?.type) body.includedType = opts.type;

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.rating',
        'places.userRatingCount',
        'places.websiteUri',
        'places.internationalPhoneNumber',
        'places.photos',
        'places.priceLevel',
      ].join(','),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`    ⚠ API ${res.status}: ${text.slice(0, 120)}`);
    return [];
  }

  const data = await res.json();
  return (data.places ?? []).map((p: any) => {
    const photos: PhotoCandidate[] = (p.photos ?? []).map((ph: any) => ({
      photoName: ph.name,
      widthPx: ph.widthPx ?? 0,
      heightPx: ph.heightPx ?? 0,
      attribution: ph.authorAttributions?.[0]?.displayName ?? null,
    }));

    return {
      gid: p.id,
      name: (p.displayName?.text ?? '').trim(),
      addr: p.formattedAddress ?? '',
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      rating: p.rating ?? null,
      reviews: p.userRatingCount ?? null,
      price: PL[p.priceLevel] ?? null,
      web: p.websiteUri ?? null,
      phone: p.internationalPhoneNumber ?? null,
      photos,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// TYPE INFERENCE
// ═══════════════════════════════════════════════════════════════════

function inferAccom(name: string): PT {
  const n = name.toLowerCase();
  if (/hostel|backpacker|capsule|pod|dorm/.test(n)) return 'hostel';
  if (/guesthouse|guest\s?house|homestay|villa|pension|bnb|b&b|airbnb/.test(n))
    return 'homestay';
  return 'hotel';
}

function inferActivity(name: string): PT {
  const n = name.toLowerCase();
  if (
    /museum|church|temple|fort|monument|cathedral|ruins|shrine|national\s?park|heritage|plaza|cemetery|basilica|mosque/.test(
      n,
    )
  )
    return 'landmark';
  if (/tour|island\s?hopping|day\s?trip|cruise|boat|expedition|adventure/.test(n))
    return 'tour';
  if (/spa|massage|wellness|yoga|retreat/.test(n)) return 'wellness';
  return 'activity';
}

function inferHealth(name: string): PT {
  const n = name.toLowerCase();
  if (/pharmacy|drugstore|mercury\s?drug|watsons|generika|south\s?star|rose\s?pharmacy|the\s?generics/.test(n))
    return 'pharmacy';
  if (/clinic|health\s?center|ob.?gyn|doctor|dental|diagnostic|laboratory/.test(n))
    return 'clinic';
  return 'hospital';
}

function detectWomenOnly(name: string): boolean {
  return /female[\s-]?only|women[\s-]?only|woman[\s-]?only|ladies[\s-]?only|girls[\s-]?only|women's\s/i.test(
    name,
  );
}

function detectWomenHealth(name: string): boolean {
  return /women'?s[\s-]?health|ob[\s.-]?gyn|obstetric|gynecol|maternity|family[\s-]?planning|reproductive/i.test(
    name,
  );
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH QUERY DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/** City-specific activity queries for round 2 */
const CITY_ACTIVITY_Q: Record<string, string> = {
  manila: 'food tour walking tour Intramuros museum gallery',
  cebu: 'whale shark watching Kawasan Falls Oslob diving',
  'el-nido': 'island hopping kayaking lagoon diving snorkeling',
  coron: 'island hopping diving shipwreck snorkeling Kayangan Lake',
  siargao: 'surfing Cloud 9 island hopping Sugba Lagoon rock pool',
  siquijor: 'waterfall cliff jumping Cambugahay balete tree healing',
  boracay: 'water sports sunset cruise parasailing helmet diving',
  bohol: 'Chocolate Hills tarsier sanctuary Loboc River cruise',
  baguio: 'hiking Burnham Park strawberry farm mines view camp john hay',
  'la-union': 'surfing San Juan beach yoga retreat sunset',
  'puerto-princesa': 'underground river Honda Bay island hopping mangrove paddle',
  dumaguete: 'Apo Island diving Casaroro Falls twin lakes whale watching',
};

function buildRound1Jobs(city: City): SearchJob[] {
  const loc = `${city.name} Philippines`;
  return [
    // Healthcare — hospitals
    {
      query: `hospital medical center emergency ${loc}`,
      cat: 'healthcare' as Cat,
      type: 'hospital',
      max: 8,
    },
    // Healthcare — pharmacies
    {
      query: `pharmacy drugstore ${loc}`,
      cat: 'healthcare' as Cat,
      type: 'pharmacy',
      max: 5,
    },
    // Activities — tourist attractions
    {
      query: `top attractions things to do ${loc}`,
      cat: 'activity' as Cat,
      type: 'tourist_attraction',
      max: 10,
    },
    // Accommodations
    {
      query: `best hostel guesthouse solo traveler ${loc}`,
      cat: 'accommodation' as Cat,
      type: 'lodging',
      max: 10,
    },
  ];
}

function buildRound2Jobs(city: City): SearchJob[] {
  const loc = `${city.name} Philippines`;
  const jobs: SearchJob[] = [];

  // City-specific activities
  const aq = CITY_ACTIVITY_Q[city.slug];
  if (aq) {
    jobs.push({
      query: `${aq} ${loc}`,
      cat: 'activity',
      max: 10,
    });
  }

  // More accommodations — boutique / women-focused
  jobs.push({
    query: `boutique hotel resort women ${loc}`,
    cat: 'accommodation',
    type: 'lodging',
    max: 10,
  });

  // Women's health clinics
  jobs.push({
    query: `women's health clinic ob gyn ${loc}`,
    cat: 'healthcare',
    max: 5,
  });

  return jobs;
}

// ═══════════════════════════════════════════════════════════════════
// DATABASE HELPERS
// ═══════════════════════════════════════════════════════════════════

async function getExistingGids(cityId: string): Promise<Set<string>> {
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
  return new Set((data ?? []).map((r: any) => (r.name as string).toLowerCase()));
}

function buildDesc(f: Found, cityName: string): string {
  if (f.cat === 'healthcare') {
    const ph = f.phone ? ` Phone: ${f.phone}.` : '';
    const wh = f.womenHealth ? " Offers women's health services." : '';
    return `${f.name} — ${f.pt} in ${cityName}, Philippines.${ph}${wh}`;
  }

  if (f.cat === 'accommodation') {
    const wo = f.womenOnly ? ' Women-only establishment.' : '';
    return `${f.name} — ${f.pt} in ${cityName}, Philippines.${wo}`;
  }

  return `${f.name} — ${f.pt} in ${cityName}, Philippines.`;
}

async function insertFound(f: Found, city: City): Promise<string> {
  const id = randomUUID();
  const slug = `${slugify(f.name)}-${id.slice(0, 6)}`;
  const desc = buildDesc(f, city.name);
  const score =
    f.rating && f.reviews
      ? +(f.rating * Math.log10(f.reviews + 1)).toFixed(2)
      : null;

  const row: Record<string, unknown> = {
    id,
    city_id: city.id,
    slug,
    name: f.name,
    place_type: f.pt,
    lat: f.lat,
    lng: f.lng,
    address: f.addr,
    google_place_id: f.gid,
    phone: f.phone,
    website: f.web,
    description: desc,
    is_active: true,
    curation_score: score,
    google_rating: f.rating,
    google_review_count: f.reviews,
    discovered_at: new Date().toISOString(),
    positioning_summary: desc.slice(0, 200),
    best_time_of_day: 'any',
    original_type: f.pt,
  };

  if (f.cat === 'accommodation') {
    row.price_level = f.price;
    row.women_only = f.womenOnly;
    row.check_in_time = '2:00 PM';
    row.check_out_time = '11:00 AM';
    row.payment_types = ['Cash', 'Credit Card'];
  } else if (f.cat === 'activity') {
    row.price_level = f.price;
  }
  // Healthcare: phone + website are the most useful fields (already included)

  const { error } = await supabase.from('places').insert(row);
  if (error) throw error;
  return id;
}

// ═══════════════════════════════════════════════════════════════════
// PHOTO DOWNLOAD + UPLOAD
// ═══════════════════════════════════════════════════════════════════

async function downloadPhotos(
  f: Found,
  placeId: string,
  city: City,
  budget: number,
): Promise<{ count: number; primaryUrl: string | null }> {
  const limit = PHOTO_LIMITS[f.cat];
  const best = selectBestPhotos(f.photos, limit);
  let primaryUrl: string | null = null;
  let count = 0;

  for (let i = 0; i < best.length; i++) {
    if (!canAfford('photo', budget)) break;

    try {
      const config = i === 0 ? PRI : SEC;
      const suffix = i === 0 ? '' : `-${i + 1}`;
      const path = `places/philippines/${slugify(f.name)}-${placeId.slice(0, 8)}${suffix}.jpg`;

      const img = await downloadAndResize(best[i].photoName, config);
      nPhoto++;
      const url = await uploadToStorage(path, img);

      if (i === 0) primaryUrl = url;

      await supabase.from('place_media').insert({
        id: randomUUID(),
        place_id: placeId,
        url,
        media_type: 'image',
        caption: best[i].attribution
          ? `Photo by ${best[i].attribution}`
          : null,
        source: 'google',
        order_index: i,
      });
      count++;
    } catch (e: any) {
      console.log(`      ⚠ Photo ${i + 1}: ${e.message.slice(0, 60)}`);
    }
    await sleep(120);
  }

  if (primaryUrl) {
    await supabase
      .from('places')
      .update({ image_url_cached: primaryUrl })
      .eq('id', placeId);
  }

  return { count, primaryUrl };
}

// ═══════════════════════════════════════════════════════════════════
// PROCESS SEARCH RESULTS
// ═══════════════════════════════════════════════════════════════════

function classifyResults(
  raw: Omit<Found, 'pt' | 'cat' | 'womenOnly' | 'womenHealth'>[],
  cat: Cat,
): Found[] {
  return raw.map((r) => {
    let pt: PT;
    if (cat === 'accommodation') pt = inferAccom(r.name);
    else if (cat === 'activity') pt = inferActivity(r.name);
    else pt = inferHealth(r.name);

    return {
      ...r,
      pt,
      cat,
      womenOnly: cat === 'accommodation' ? detectWomenOnly(r.name) : false,
      womenHealth: cat === 'healthcare' ? detectWomenHealth(r.name) : false,
    };
  });
}

function filterAndDedup(
  places: Found[],
  existingGids: Set<string>,
  existingNames: Set<string>,
  seenGids: Set<string>,
): Found[] {
  const filtered: Found[] = [];

  for (const p of places) {
    // Skip duplicates
    if (existingGids.has(p.gid)) continue;
    if (existingNames.has(p.name.toLowerCase())) continue;
    if (seenGids.has(p.gid)) continue;

    // Skip places with no location
    if (p.lat === 0 && p.lng === 0) continue;

    // Quality filter (healthcare passes everything)
    const minRat = MIN_RATING[p.cat];
    const minRev = MIN_REVIEWS[p.cat];
    if (p.rating !== null && p.rating < minRat && (p.reviews ?? 0) > 5) continue;
    if (p.cat !== 'healthcare' && p.reviews !== null && p.reviews < minRev && p.rating === null) continue;

    seenGids.add(p.gid);
    filtered.push(p);
  }

  return filtered;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const budget = args.includes('--budget')
    ? parseFloat(args[args.indexOf('--budget') + 1])
    : 5.0;

  console.log('🇵🇭 MEGA PHILIPPINES POPULATION');
  console.log('═'.repeat(60));
  console.log(`  Budget:  $${budget.toFixed(2)}`);
  console.log(`  Scope:   Accommodations + Activities + Healthcare`);
  console.log('');

  // ---- Load Philippine cities ----

  const { data: cityData, error: cityErr } = await supabase
    .from('cities')
    .select('id, slug, name, countries!inner(name, slug)')
    .eq('countries.slug', 'philippines')
    .order('name');
  if (cityErr) throw cityErr;

  // Count existing places per city
  const { data: placeRows } = await supabase
    .from('places')
    .select('city_id')
    .eq('is_active', true);

  const countMap = new Map<string, number>();
  for (const r of placeRows ?? []) {
    countMap.set(r.city_id, (countMap.get(r.city_id) ?? 0) + 1);
  }

  const cities: City[] = (cityData ?? []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    placeCount: countMap.get(c.id) ?? 0,
  }));

  // Sort: least covered first
  cities.sort((a, b) => a.placeCount - b.placeCount);

  console.log(`📍 ${cities.length} Philippine cities:`);
  for (const c of cities) {
    console.log(`   ${c.name.padEnd(20)} ${c.placeCount} places`);
  }
  console.log('');

  // Ensure storage bucket
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // ---- Stats ----

  const stats = {
    searches: 0,
    discovered: 0,
    seeded: { accommodation: 0, activity: 0, healthcare: 0, total: 0 },
    photos: 0,
    womenOnly: 0,
    womenHealth: 0,
    byCat: { accommodation: 0, activity: 0, healthcare: 0 },
  };

  // ═══════════════════════════════════════════════════════════════
  // ROUND 1: Essential coverage for every city
  // ═══════════════════════════════════════════════════════════════

  console.log('━'.repeat(60));
  console.log('ROUND 1: Essential Coverage');
  console.log('━'.repeat(60));

  for (const city of cities) {
    if (!canAfford('search', budget)) {
      console.log(`\n💰 Budget reached ($${spent().toFixed(2)}). Stopping.`);
      break;
    }

    console.log(`\n📍 ${city.name} [${city.placeCount} existing]`);
    console.log('─'.repeat(50));

    const gids = await getExistingGids(city.id);
    const names = await getExistingNames(city.id);
    const seenGids = new Set<string>();

    const jobs = buildRound1Jobs(city);

    for (const job of jobs) {
      if (!canAfford('search', budget)) {
        console.log('  💰 Budget limit — skipping remaining searches');
        break;
      }

      const icon = job.cat === 'healthcare' ? '🏥' : job.cat === 'activity' ? '🎯' : '🏨';
      console.log(`  ${icon} "${job.query.slice(0, 55)}..."`);

      const raw = await textSearch(job.query, {
        type: job.type,
        max: job.max,
      });
      nSearch++;
      stats.searches++;

      const classified = classifyResults(raw, job.cat);
      const valid = filterAndDedup(classified, gids, names, seenGids);

      console.log(`     → ${raw.length} results, ${valid.length} new`);
      stats.discovered += valid.length;

      // Seed each valid place
      for (const place of valid) {
        if (!canAfford('photo', budget) && place.photos.length > 0) {
          // Can still insert without photos if budget is tight
        }

        try {
          const placeId = await insertFound(place, city);

          // Download photos
          const { count } = await downloadPhotos(place, placeId, city, budget);
          stats.photos += count;

          // Track stats
          stats.seeded.total++;
          stats.seeded[place.cat]++;
          stats.byCat[place.cat]++;
          if (place.womenOnly) stats.womenOnly++;
          if (place.womenHealth) stats.womenHealth++;

          // Add to dedup sets so round 2 doesn't re-add
          gids.add(place.gid);
          names.add(place.name.toLowerCase());

          const tag =
            place.womenOnly
              ? ' 👩'
              : place.womenHealth
                ? ' 👩‍⚕️'
                : '';
          console.log(
            `     ✅ ${place.pt.padEnd(10)} ${place.name.slice(0, 40)}${tag} (${count} 📷)`,
          );
        } catch (e: any) {
          console.log(`     ❌ ${place.name.slice(0, 30)}: ${e.message.slice(0, 60)}`);
        }

        await sleep(RATE_MS);
      }

      await sleep(RATE_MS);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ROUND 2: Enrichment (city-specific activities, more hotels, women's health)
  // ═══════════════════════════════════════════════════════════════

  if (canAfford('search', budget)) {
    console.log('\n' + '━'.repeat(60));
    console.log('ROUND 2: Enrichment');
    console.log('━'.repeat(60));

    for (const city of cities) {
      if (!canAfford('search', budget)) {
        console.log(`\n💰 Budget reached ($${spent().toFixed(2)}). Stopping.`);
        break;
      }

      console.log(`\n📍 ${city.name} (enrichment)`);
      console.log('─'.repeat(50));

      const gids = await getExistingGids(city.id);
      const names = await getExistingNames(city.id);
      const seenGids = new Set<string>();

      const jobs = buildRound2Jobs(city);

      for (const job of jobs) {
        if (!canAfford('search', budget)) break;

        const icon = job.cat === 'healthcare' ? '🏥' : job.cat === 'activity' ? '🎯' : '🏨';
        console.log(`  ${icon} "${job.query.slice(0, 55)}..."`);

        const raw = await textSearch(job.query, {
          type: job.type,
          max: job.max,
        });
        nSearch++;
        stats.searches++;

        const classified = classifyResults(raw, job.cat);
        const valid = filterAndDedup(classified, gids, names, seenGids);

        console.log(`     → ${raw.length} results, ${valid.length} new`);
        stats.discovered += valid.length;

        for (const place of valid) {
          try {
            const placeId = await insertFound(place, city);
            const { count } = await downloadPhotos(place, placeId, city, budget);
            stats.photos += count;
            stats.seeded.total++;
            stats.seeded[place.cat]++;
            stats.byCat[place.cat]++;
            if (place.womenOnly) stats.womenOnly++;
            if (place.womenHealth) stats.womenHealth++;

            gids.add(place.gid);
            names.add(place.name.toLowerCase());

            const tag =
              place.womenOnly
                ? ' 👩'
                : place.womenHealth
                  ? ' 👩‍⚕️'
                  : '';
            console.log(
              `     ✅ ${place.pt.padEnd(10)} ${place.name.slice(0, 40)}${tag} (${count} 📷)`,
            );
          } catch (e: any) {
            console.log(`     ❌ ${place.name.slice(0, 30)}: ${e.message.slice(0, 60)}`);
          }
          await sleep(RATE_MS);
        }

        await sleep(RATE_MS);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════

  console.log('\n' + '═'.repeat(60));
  console.log('📊 PHILIPPINES POPULATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Cities:              ${cities.length}`);
  console.log(`  API searches:        ${stats.searches}`);
  console.log(`  Places discovered:   ${stats.discovered}`);
  console.log(`  Places seeded:       ${stats.seeded.total}`);
  console.log(`    Accommodations:    ${stats.seeded.accommodation}`);
  console.log(`    Activities:        ${stats.seeded.activity}`);
  console.log(`    Healthcare:        ${stats.seeded.healthcare}`);
  console.log(`  Women-only accom:    ${stats.womenOnly}`);
  console.log(`  Women's health:      ${stats.womenHealth}`);
  console.log(`  Photos uploaded:     ${stats.photos}`);
  console.log('');
  console.log('💰 API COSTS');
  console.log(
    `  Searches:    ${String(nSearch).padStart(4)} × $${COST.search.toFixed(3)} = $${(nSearch * COST.search).toFixed(2)}`,
  );
  console.log(
    `  Photos:      ${String(nPhoto).padStart(4)} × $${COST.photo.toFixed(3)} = $${(nPhoto * COST.photo).toFixed(2)}`,
  );
  console.log('  ' + '─'.repeat(40));
  console.log(`  TOTAL: $${spent().toFixed(2)} / $${budget.toFixed(2)} budget`);
  console.log('═'.repeat(60));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
