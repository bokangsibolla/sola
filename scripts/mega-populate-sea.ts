/**
 * Mega Southeast Asia Population Script
 *
 * Discovers and seeds places across ALL Southeast Asian cities:
 *   - Accommodations (hostels, hotels, guesthouses — women-focused)
 *   - Activities & Things To Do (tours, diving, landmarks, wellness)
 *   - Food & Drink (cafes, restaurants popular with solo travelers)
 *   - Healthcare (hospitals, pharmacies)
 *
 * Budget-aware with real-time cost tracking.
 * Prioritizes underpopulated cities and women-specific places.
 *
 * Usage:
 *   npx tsx scripts/mega-populate-sea.ts --budget 30
 *   npx tsx scripts/mega-populate-sea.ts --budget 10 --country thailand
 *   npx tsx scripts/mega-populate-sea.ts --budget 5 --country philippines --skip-above 60
 *   npx tsx scripts/mega-populate-sea.ts --budget 30 --dry-run
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

type Cat = 'accommodation' | 'activity' | 'food' | 'healthcare';
type PT =
  | 'hotel' | 'hostel' | 'homestay'
  | 'activity' | 'landmark' | 'tour' | 'wellness' | 'spa'
  | 'restaurant' | 'cafe' | 'bar'
  | 'hospital' | 'clinic' | 'pharmacy';

const PHOTO_LIMITS: Record<Cat, number> = {
  accommodation: 4,
  activity: 3,
  food: 2,
  healthcare: 1,
};

const MIN_RATING: Record<Cat, number> = {
  accommodation: 3.5,
  activity: 3.0,
  food: 3.5,
  healthcare: 0,
};

const MIN_REVIEWS: Record<Cat, number> = {
  accommodation: 3,
  activity: 2,
  food: 5,
  healthcare: 0,
};

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface City {
  id: string;
  slug: string;
  name: string;
  countryName: string;
  countrySlug: string;
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
): Promise<Omit<Found, 'pt' | 'cat' | 'womenOnly'>[]> {
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
  if (/guesthouse|guest\s?house|homestay|villa|pension|bnb|b&b|riad|ryokan/.test(n))
    return 'homestay';
  return 'hotel';
}

function inferActivity(name: string): PT {
  const n = name.toLowerCase();
  if (
    /museum|church|temple|fort|monument|cathedral|ruins|shrine|national\s?park|heritage|plaza|cemetery|basilica|mosque|palace|pagoda|stupa|wat\s/.test(n)
  )
    return 'landmark';
  if (/tour|island\s?hopping|day\s?trip|cruise|boat|expedition|adventure|hopping/.test(n))
    return 'tour';
  if (/spa|massage|wellness|yoga|retreat/.test(n)) return 'wellness';
  return 'activity';
}

function inferFood(name: string): PT {
  const n = name.toLowerCase();
  if (/cafe|coffee|bakery|brunch/.test(n)) return 'cafe';
  if (/bar|pub|rooftop|cocktail|wine/.test(n)) return 'bar';
  return 'restaurant';
}

function inferHealth(name: string): PT {
  const n = name.toLowerCase();
  if (/pharmacy|drugstore|watsons|guardian|boots/.test(n)) return 'pharmacy';
  if (/clinic|health\s?center|doctor|dental|diagnostic/.test(n)) return 'clinic';
  return 'hospital';
}

function detectWomenOnly(name: string): boolean {
  return /female[\s-]?only|women[\s-]?only|woman[\s-]?only|ladies[\s-]?only|girls[\s-]?only|women's\s|female\s?dorm/i.test(
    name,
  );
}

// ═══════════════════════════════════════════════════════════════════
// CITY-SPECIFIC ACTIVITY QUERIES
// ═══════════════════════════════════════════════════════════════════

/** City-specific queries for deeply relevant local activities */
const CITY_QUERIES: Record<string, string[]> = {
  // ---- THAILAND ----
  'bangkok': [
    'temple tour Grand Palace Wat Pho Wat Arun Bangkok',
    'floating market Chatuchak weekend market Bangkok',
    'cooking class street food tour Bangkok',
    'rooftop bar restaurant solo traveler Bangkok',
  ],
  'chiang-mai': [
    'temple Old City night market Chiang Mai',
    'elephant sanctuary ethical Chiang Mai',
    'cooking class trekking waterfall Chiang Mai',
    'cafe coworking digital nomad Chiang Mai',
  ],
  'phuket': [
    'island hopping Phi Phi snorkeling diving Phuket',
    'Big Buddha Old Town Phuket',
    'beach Kata Karon Patong Phuket',
  ],
  'koh-phangan': [
    'yoga retreat wellness Koh Phangan',
    'beach snorkeling Thong Nai Pan Koh Phangan',
  ],
  'krabi': [
    'Railay beach rock climbing island hopping Krabi',
    'hot springs tiger cave temple Krabi',
  ],
  'koh-samui': [
    'Ang Thong marine park waterfall temple Koh Samui',
    'beach Lamai Chaweng Koh Samui',
  ],
  'pai': [
    'Pai canyon hot springs waterfall rice paddy',
    'night market cafe Pai',
  ],
  'koh-lanta': [
    'beach kayaking snorkeling Old Town Koh Lanta',
  ],
  'koh-tao': [
    'diving certification snorkeling viewpoint Koh Tao',
  ],
  'chiang-rai': [
    'White Temple Blue Temple Black House Golden Triangle Chiang Rai',
  ],

  // ---- VIETNAM ----
  'hanoi': [
    'Old Quarter Hoan Kiem Lake temple of literature Hanoi',
    'street food tour water puppet show Hanoi',
    'Ho Chi Minh mausoleum museum Hanoi',
    'egg coffee cafe Old Quarter Hanoi',
  ],
  'ho-chi-minh-city': [
    'Cu Chi tunnels War Remnants Museum Ben Thanh market Ho Chi Minh City',
    'cooking class street food tour Saigon',
    'Notre Dame cafe district 1 Ho Chi Minh City',
  ],
  'da-nang': [
    'marble mountains Ba Na Hills Golden Bridge Da Nang',
    'My Khe beach dragon bridge Da Nang',
  ],
  'hoi-an': [
    'ancient town lantern night Hoi An',
    'cooking class tailor bicycle tour Hoi An',
    'An Bang beach basket boat Hoi An',
  ],
  'ha-long': [
    'Ha Long Bay cruise kayaking cave',
    'Cat Ba island Ti Top island Ha Long',
  ],

  // ---- INDONESIA ----
  'bali': [
    'Ubud rice terrace monkey forest temple Bali',
    'yoga retreat wellness Ubud Bali',
    'waterfall Tegallalang Tirta Empul Bali',
    'beach club Seminyak Canggu surfing Bali',
  ],
  'ubud': [
    'rice terrace monkey forest art market Ubud',
    'yoga retreat cooking class waterfall Ubud',
  ],
  'yogyakarta': [
    'Borobudur Prambanan kraton Yogyakarta',
    'batik workshop Malioboro street Yogyakarta',
  ],
  'lombok': [
    'Gili islands snorkeling beach waterfall Lombok',
    'surfing Kuta Lombok',
  ],
  'jakarta': [
    'Kota Tua museum food tour Jakarta',
    'cafe restaurant Menteng Kemang Jakarta',
  ],

  // ---- CAMBODIA ----
  'siem-reap': [
    'Angkor Wat temple sunrise tour Siem Reap',
    'floating village cooking class night market Siem Reap',
    'Angkor Thom Bayon Ta Prohm Siem Reap',
  ],
  'phnom-penh': [
    'Royal Palace Silver Pagoda Killing Fields S21 Phnom Penh',
    'riverside night market food Phnom Penh',
  ],
  'kampot': [
    'pepper farm cave Bokor mountain Kampot',
    'kayaking riverside sunset Kampot',
  ],
  'sihanoukville': [
    'Koh Rong island beach snorkeling Sihanoukville',
  ],

  // ---- MALAYSIA ----
  'kuala-lumpur': [
    'Petronas Towers Batu Caves food tour Kuala Lumpur',
    'Central Market Chinatown Jalan Alor Kuala Lumpur',
    'cafe rooftop restaurant Kuala Lumpur',
  ],
  'penang': [
    'Georgetown street art food tour Penang',
    'temple Kek Lok Si Penang Hill Penang',
    'hawker food char kway teow laksa Penang',
  ],
  'langkawi': [
    'cable car Sky Bridge mangrove tour Langkawi',
    'beach island hopping Langkawi',
  ],
  'malacca': [
    'historic town river cruise Jonker Street Malacca',
    'food tour Nyonya cuisine Malacca',
  ],
  'cameron-highlands': [
    'tea plantation strawberry farm mossy forest Cameron Highlands',
  ],

  // ---- LAOS ----
  'luang-prabang': [
    'Kuang Si Falls temple alms giving night market Luang Prabang',
    'cooking class Mekong cruise weaving village Luang Prabang',
  ],
  'vientiane': [
    'That Luang Patuxay Buddha Park Vientiane',
    'riverside cafe night market Vientiane',
  ],
  'vang-vieng': [
    'blue lagoon cave tubing kayaking Vang Vieng',
  ],

  // ---- MYANMAR ----
  'bagan': [
    'temple sunrise hot air balloon ancient ruins Bagan',
    'lacquerware workshop Bagan',
  ],
  'yangon': [
    'Shwedagon Pagoda colonial buildings Bogyoke market Yangon',
    'street food tea house Yangon',
  ],
  'mandalay': [
    'U Bein bridge Mandalay Hill temple monastery Mandalay',
  ],

  // ---- SINGAPORE ----
  'singapore': [
    'Gardens by the Bay Marina Bay Sands Sentosa Singapore',
    'hawker centre Chinatown Little India Singapore',
    'cafe brunch rooftop restaurant Singapore',
    'museum art gallery Singapore',
  ],

  // ---- TAIWAN ----
  'taipei': [
    'night market Taipei 101 temple hot springs Taipei',
    'Jiufen Shifen day trip Taipei',
    'cafe brunch Ximending Da An Taipei',
  ],
  'tainan': [
    'temple historic fort food tour Tainan',
    'Anping Old Street Tainan',
  ],

  // ---- PHILIPPINES (enrichment — already well populated) ----
  'manila': [
    'Intramuros museum food tour Manila',
    'cafe restaurant Makati BGC Manila',
  ],
  'cebu': [
    'whale shark Oslob Kawasan Falls temple of Leah Cebu',
    'island hopping diving Mactan Cebu',
  ],
  'el-nido': [
    'island hopping tour A B C D El Nido Palawan',
    'lagoon kayaking snorkeling El Nido',
  ],
  'siargao': [
    'surfing Cloud 9 island hopping Sugba Lagoon Siargao',
    'rock pool Magpupungko tide pool Siargao',
  ],
  'boracay': [
    'water sports sunset cruise parasailing Boracay',
    'beach restaurant nightlife Boracay',
  ],
};

// ═══════════════════════════════════════════════════════════════════
// SEARCH QUERY BUILDERS
// ═══════════════════════════════════════════════════════════════════

function buildSearchJobs(city: City): SearchJob[] {
  const loc = `${city.name} ${city.countryName}`;
  const jobs: SearchJob[] = [];

  // ── ACCOMMODATIONS ──
  jobs.push({
    query: `best hostel solo female traveler ${loc}`,
    cat: 'accommodation',
    type: 'lodging',
    max: 10,
  });
  jobs.push({
    query: `women friendly boutique hotel guesthouse ${loc}`,
    cat: 'accommodation',
    type: 'lodging',
    max: 10,
  });

  // ── ACTIVITIES — generic ──
  jobs.push({
    query: `top attractions things to do ${loc}`,
    cat: 'activity',
    type: 'tourist_attraction',
    max: 10,
  });

  // ── ACTIVITIES — city-specific ──
  const cityQueries = CITY_QUERIES[city.slug] ?? [];
  for (const q of cityQueries) {
    jobs.push({ query: q, cat: 'activity', max: 10 });
  }

  // ── FOOD ──
  jobs.push({
    query: `best cafe restaurant solo traveler ${loc}`,
    cat: 'food',
    max: 8,
  });

  // ── HEALTHCARE ──
  jobs.push({
    query: `hospital pharmacy ${loc}`,
    cat: 'healthcare',
    type: 'hospital',
    max: 5,
  });

  return jobs;
}

/** Extra women-specific search for round 2 */
function buildWomenJobs(city: City): SearchJob[] {
  const loc = `${city.name} ${city.countryName}`;
  const jobs: SearchJob[] = [];

  jobs.push({
    query: `female only women only hostel dorm ${loc}`,
    cat: 'accommodation',
    type: 'lodging',
    max: 10,
  });

  // Country-specific women searches
  if (city.countrySlug === 'indonesia') {
    jobs.push({
      query: `yoga retreat wellness women ${loc}`,
      cat: 'activity',
      max: 8,
    });
  } else if (city.countrySlug === 'thailand') {
    jobs.push({
      query: `wellness spa retreat women ${loc}`,
      cat: 'activity',
      max: 8,
    });
  }

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

function classifyResults(
  raw: Omit<Found, 'pt' | 'cat' | 'womenOnly'>[],
  cat: Cat,
): Found[] {
  return raw.map((r) => {
    let pt: PT;
    if (cat === 'accommodation') pt = inferAccom(r.name);
    else if (cat === 'activity') pt = inferActivity(r.name);
    else if (cat === 'food') pt = inferFood(r.name);
    else pt = inferHealth(r.name);

    return {
      ...r,
      pt,
      cat,
      womenOnly: cat === 'accommodation' ? detectWomenOnly(r.name) : false,
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
    if (existingGids.has(p.gid)) continue;
    if (existingNames.has(p.name.toLowerCase())) continue;
    if (seenGids.has(p.gid)) continue;
    if (p.lat === 0 && p.lng === 0) continue;

    const minRat = MIN_RATING[p.cat];
    const minRev = MIN_REVIEWS[p.cat];
    if (p.rating !== null && p.rating < minRat && (p.reviews ?? 0) > 5) continue;
    if (p.cat !== 'healthcare' && p.reviews !== null && p.reviews < minRev && p.rating === null) continue;

    seenGids.add(p.gid);
    filtered.push(p);
  }

  return filtered;
}

function buildDesc(f: Found, city: City): string {
  const rt = f.rating
    ? `Rated ${f.rating}/5 by ${f.reviews ?? 0} visitors`
    : 'Recently discovered';

  if (f.cat === 'healthcare') {
    const ph = f.phone ? ` Phone: ${f.phone}.` : '';
    return `${f.name} — ${f.pt} in ${city.name}, ${city.countryName}.${ph} ${rt}.`;
  }

  if (f.cat === 'accommodation') {
    const wo = f.womenOnly ? ' Women-only establishment.' : '';
    return `${f.name} — ${f.pt} in ${city.name}, ${city.countryName}. ${rt}.${wo}`;
  }

  return `${f.name} — ${f.pt} in ${city.name}, ${city.countryName}. ${rt}.`;
}

async function insertFound(f: Found, city: City, dryRun: boolean): Promise<string> {
  const id = randomUUID();
  const slug = `${slugify(f.name)}-${id.slice(0, 6)}`;
  const desc = buildDesc(f, city);
  const score =
    f.rating && f.reviews
      ? +(f.rating * Math.log10(f.reviews + 1)).toFixed(2)
      : null;

  if (dryRun) return id;

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
  } else if (f.cat === 'activity' || f.cat === 'food') {
    row.price_level = f.price;
  }

  const { error } = await supabase.from('places').insert(row);
  if (error) throw error;
  return id;
}

async function downloadPhotos(
  f: Found,
  placeId: string,
  city: City,
  budget: number,
  dryRun: boolean,
): Promise<number> {
  if (dryRun) return 0;

  const limit = PHOTO_LIMITS[f.cat];
  const best = selectBestPhotos(f.photos, limit);
  let primaryUrl: string | null = null;
  let count = 0;

  for (let i = 0; i < best.length; i++) {
    if (!canAfford('photo', budget)) break;

    try {
      const config = i === 0 ? PRI : SEC;
      const suffix = i === 0 ? '' : `-${i + 1}`;
      const path = `places/${city.countrySlug}/${slugify(f.name)}-${placeId.slice(0, 8)}${suffix}.jpg`;

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

  return count;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const budget = args.includes('--budget')
    ? parseFloat(args[args.indexOf('--budget') + 1])
    : 10.0;
  const dryRun = args.includes('--dry-run');
  const countryFilter = args.includes('--country')
    ? args[args.indexOf('--country') + 1]
    : null;
  const skipAbove = args.includes('--skip-above')
    ? parseInt(args[args.indexOf('--skip-above') + 1], 10)
    : 999;

  const SE_ASIA_SLUGS = [
    'philippines', 'thailand', 'vietnam', 'indonesia', 'malaysia',
    'cambodia', 'myanmar', 'laos', 'taiwan', 'singapore',
  ];

  const targetCountries = countryFilter ? [countryFilter] : SE_ASIA_SLUGS;

  console.log('🌏 MEGA SOUTHEAST ASIA POPULATION');
  console.log('═'.repeat(60));
  console.log(`  Budget:     $${budget.toFixed(2)}`);
  console.log(`  Countries:  ${targetCountries.join(', ')}`);
  console.log(`  Skip >      ${skipAbove} places`);
  console.log(`  Dry run:    ${dryRun}`);
  console.log('');

  // ── Load cities ──

  const { data: cityData, error: cityErr } = await supabase
    .from('cities')
    .select('id, slug, name, countries!inner(name, slug)')
    .in('countries.slug', targetCountries)
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

  const allCities: City[] = (cityData ?? []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    countryName: (c.countries as any)?.name ?? '',
    countrySlug: (c.countries as any)?.slug ?? '',
    placeCount: countMap.get(c.id) ?? 0,
  }));

  // Filter out over-populated cities and sort: least populated first
  const cities = allCities
    .filter((c) => c.placeCount <= skipAbove)
    .sort((a, b) => a.placeCount - b.placeCount);

  console.log(`📍 ${cities.length} cities to process (${allCities.length - cities.length} skipped):\n`);

  // Group by country for display
  const byCountry = new Map<string, City[]>();
  for (const c of cities) {
    const arr = byCountry.get(c.countryName) ?? [];
    arr.push(c);
    byCountry.set(c.countryName, arr);
  }
  for (const [country, cs] of Array.from(byCountry.entries())) {
    console.log(`  ${country}:`);
    for (const c of cs) {
      console.log(`    ${c.name.padEnd(22)} ${String(c.placeCount).padStart(3)} places`);
    }
  }
  console.log('');

  // Ensure storage bucket
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // ── Stats ──

  const stats = {
    searches: 0,
    discovered: 0,
    seeded: 0,
    photos: 0,
    womenOnly: 0,
    byCat: { accommodation: 0, activity: 0, food: 0, healthcare: 0 },
    byCountry: new Map<string, number>(),
  };

  // ═══════════════════════════════════════════════════════════════
  // ROUND 1: Main coverage for every city
  // ═══════════════════════════════════════════════════════════════

  console.log('━'.repeat(60));
  console.log('ROUND 1: Main Coverage');
  console.log('━'.repeat(60));

  for (const city of cities) {
    if (!canAfford('search', budget)) {
      console.log(`\n💰 Budget reached ($${spent().toFixed(2)}). Stopping.`);
      break;
    }

    console.log(`\n📍 ${city.name}, ${city.countryName} [${city.placeCount} existing]`);
    console.log('─'.repeat(50));

    const gids = await getExistingGids(city.id);
    const names = await getExistingNames(city.id);
    const seenGids = new Set<string>();

    const jobs = buildSearchJobs(city);

    for (const job of jobs) {
      if (!canAfford('search', budget)) {
        console.log('  💰 Budget limit — skipping remaining searches');
        break;
      }

      const icon =
        job.cat === 'healthcare' ? '🏥' :
        job.cat === 'activity' ? '🎯' :
        job.cat === 'food' ? '🍜' : '🏨';
      console.log(`  ${icon} "${job.query.slice(0, 60)}..."`);

      const raw = await textSearch(job.query, { type: job.type, max: job.max });
      nSearch++;
      stats.searches++;

      const classified = classifyResults(raw, job.cat);
      const valid = filterAndDedup(classified, gids, names, seenGids);

      console.log(`     → ${raw.length} results, ${valid.length} new`);
      stats.discovered += valid.length;

      for (const place of valid) {
        try {
          const placeId = await insertFound(place, city, dryRun);
          const photoCount = await downloadPhotos(place, placeId, city, budget, dryRun);
          stats.photos += photoCount;
          stats.seeded++;
          stats.byCat[place.cat]++;
          stats.byCountry.set(
            city.countryName,
            (stats.byCountry.get(city.countryName) ?? 0) + 1,
          );
          if (place.womenOnly) stats.womenOnly++;

          gids.add(place.gid);
          names.add(place.name.toLowerCase());

          const tag = place.womenOnly ? ' 👩' : '';
          console.log(
            `     ✅ ${place.pt.padEnd(10)} ${place.name.slice(0, 40)}${tag} (${photoCount} 📷)`,
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
  // ROUND 2: Women-specific enrichment
  // ═══════════════════════════════════════════════════════════════

  if (canAfford('search', budget)) {
    console.log('\n' + '━'.repeat(60));
    console.log('ROUND 2: Women-Specific Enrichment');
    console.log('━'.repeat(60));

    for (const city of cities) {
      if (!canAfford('search', budget)) {
        console.log(`\n💰 Budget reached ($${spent().toFixed(2)}). Stopping.`);
        break;
      }

      const gids = await getExistingGids(city.id);
      const names = await getExistingNames(city.id);
      const seenGids = new Set<string>();

      const jobs = buildWomenJobs(city);
      if (jobs.length === 0) continue;

      console.log(`\n👩 ${city.name}, ${city.countryName}`);

      for (const job of jobs) {
        if (!canAfford('search', budget)) break;

        console.log(`  🔍 "${job.query.slice(0, 55)}..."`);

        const raw = await textSearch(job.query, { type: job.type, max: job.max });
        nSearch++;
        stats.searches++;

        const classified = classifyResults(raw, job.cat);
        const valid = filterAndDedup(classified, gids, names, seenGids);

        console.log(`     → ${raw.length} results, ${valid.length} new`);
        stats.discovered += valid.length;

        for (const place of valid) {
          try {
            const placeId = await insertFound(place, city, dryRun);
            const photoCount = await downloadPhotos(place, placeId, city, budget, dryRun);
            stats.photos += photoCount;
            stats.seeded++;
            stats.byCat[place.cat]++;
            stats.byCountry.set(
              city.countryName,
              (stats.byCountry.get(city.countryName) ?? 0) + 1,
            );
            if (place.womenOnly) stats.womenOnly++;

            gids.add(place.gid);
            names.add(place.name.toLowerCase());

            const tag = place.womenOnly ? ' 👩' : '';
            console.log(
              `     ✅ ${place.pt.padEnd(10)} ${place.name.slice(0, 40)}${tag} (${photoCount} 📷)`,
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
  console.log('📊 SOUTHEAST ASIA POPULATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Cities processed:    ${cities.length}`);
  console.log(`  API searches:        ${stats.searches}`);
  console.log(`  Places discovered:   ${stats.discovered}`);
  console.log(`  Places seeded:       ${stats.seeded}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    Accommodations:    ${stats.byCat.accommodation}`);
  console.log(`    Activities:        ${stats.byCat.activity}`);
  console.log(`    Food & Drink:      ${stats.byCat.food}`);
  console.log(`    Healthcare:        ${stats.byCat.healthcare}`);
  console.log(`  Women-only found:    ${stats.womenOnly}`);
  console.log(`  Photos uploaded:     ${stats.photos}`);
  console.log('');
  console.log('📍 BY COUNTRY');
  for (const [country, count] of Array.from(stats.byCountry.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${country.padEnd(20)} +${count}`);
  }
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
