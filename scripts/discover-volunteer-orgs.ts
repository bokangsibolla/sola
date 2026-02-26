/**
 * Volunteer Organization Discovery Script
 *
 * Discovers volunteer organizations across Southeast Asia using
 * Google Places Text Search API. Outputs candidates as JSON for
 * manual verification before seeding.
 *
 * Usage:
 *   npx tsx scripts/discover-volunteer-orgs.ts
 *   npx tsx scripts/discover-volunteer-orgs.ts --country thailand
 *   npx tsx scripts/discover-volunteer-orgs.ts --country thailand --city chiang-mai
 *   npx tsx scripts/discover-volunteer-orgs.ts --budget 5
 *   npx tsx scripts/discover-volunteer-orgs.ts --dry-run
 *
 * Required environment variables:
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - GOOGLE_PLACES_API_KEY
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
const RATE_MS = 400;

// Google Places API costs (New API pricing)
const COST = { search: 0.040, photo: 0.007 };

// Volunteer type inference keywords
type VolunteerType = 'animal' | 'teaching' | 'conservation' | 'community' | 'healthcare' | 'construction' | 'farming';

const PHOTO_LIMIT = 2; // Keep photo costs down during discovery
const MIN_REVIEWS = 3; // Filter out places with too few reviews

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface City {
  id: string;
  slug: string;
  name: string;
  countryName: string;
  countrySlug: string;
}

interface Found {
  gid: string;
  name: string;
  addr: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviews: number | null;
  web: string | null;
  phone: string | null;
  photos: PhotoCandidate[];
  volunteerType: VolunteerType;
  googleMapsUrl: string;
}

interface SearchJob {
  query: string;
  volunteerType: VolunteerType;
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

async function textSearch(
  query: string,
  opts?: { type?: string; max?: number },
): Promise<Omit<Found, 'volunteerType' | 'googleMapsUrl'>[]> {
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
        'places.googleMapsUri',
      ].join(','),
    },
    body: JSON.stringify(body),
  });

  nSearch++;

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
      web: p.websiteUri ?? null,
      phone: p.internationalPhoneNumber ?? null,
      photos,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// VOLUNTEER TYPE INFERENCE
// ═══════════════════════════════════════════════════════════════════

function inferVolunteerType(name: string, query: string): VolunteerType {
  const text = `${name} ${query}`.toLowerCase();

  if (/animal|shelter|rescue|elephant|dog|cat|wildlife|turtle|marine\s*life|monkey|orangutan|bear/.test(text))
    return 'animal';
  if (/teach|school|education|literacy|children|orphan|youth|mentor|tutor/.test(text))
    return 'teaching';
  if (/conserv|reef|coral|mangrove|rainforest|forest|environmental|ecology|turtle\s*nest|marine\s*conserv|national\s*park/.test(text))
    return 'conservation';
  if (/farm|organic|permaculture|agriculture|rice|garden|plantation/.test(text))
    return 'farming';
  if (/health|medical|clinic|hospital|dental|nurse|doctor/.test(text))
    return 'healthcare';
  if (/build|construct|habitat|house|infrastructure/.test(text))
    return 'construction';

  return 'community';
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH QUERIES PER CITY
// ═══════════════════════════════════════════════════════════════════

/** City-specific queries for known volunteer hotspots */
const CITY_VOLUNTEER_QUERIES: Record<string, SearchJob[]> = {
  // ── THAILAND ──
  'chiang-mai': [
    { query: 'elephant sanctuary volunteer Chiang Mai', volunteerType: 'animal' },
    { query: 'dog rescue shelter volunteer Chiang Mai', volunteerType: 'animal' },
    { query: 'teaching English volunteer Chiang Mai', volunteerType: 'teaching' },
    { query: 'organic farm volunteer Chiang Mai', volunteerType: 'farming' },
    { query: 'community development NGO Chiang Mai', volunteerType: 'community' },
  ],
  'bangkok': [
    { query: 'volunteer organization NGO Bangkok', volunteerType: 'community' },
    { query: 'teaching English volunteer Bangkok', volunteerType: 'teaching' },
    { query: 'animal rescue shelter Bangkok', volunteerType: 'animal' },
  ],
  'koh-lanta': [
    { query: 'animal rescue volunteer Koh Lanta', volunteerType: 'animal' },
  ],
  'koh-phangan': [
    { query: 'marine conservation volunteer Koh Phangan', volunteerType: 'conservation' },
    { query: 'permaculture volunteer Koh Phangan', volunteerType: 'farming' },
  ],
  'koh-tao': [
    { query: 'marine conservation coral reef volunteer Koh Tao', volunteerType: 'conservation' },
  ],
  'phuket': [
    { query: 'animal rescue volunteer Phuket', volunteerType: 'animal' },
    { query: 'marine conservation volunteer Phuket', volunteerType: 'conservation' },
  ],
  'chiang-rai': [
    { query: 'volunteer teaching children Chiang Rai', volunteerType: 'teaching' },
    { query: 'elephant sanctuary volunteer Chiang Rai', volunteerType: 'animal' },
  ],

  // ── VIETNAM ──
  'hanoi': [
    { query: 'volunteer teaching NGO Hanoi', volunteerType: 'teaching' },
    { query: 'community development volunteer Hanoi', volunteerType: 'community' },
  ],
  'ho-chi-minh-city': [
    { query: 'volunteer teaching English Ho Chi Minh City', volunteerType: 'teaching' },
    { query: 'community center volunteer Saigon', volunteerType: 'community' },
    { query: 'animal rescue volunteer Ho Chi Minh City', volunteerType: 'animal' },
  ],
  'hoi-an': [
    { query: 'volunteer teaching children Hoi An', volunteerType: 'teaching' },
    { query: 'community development volunteer Hoi An', volunteerType: 'community' },
  ],
  'da-nang': [
    { query: 'volunteer NGO community Da Nang', volunteerType: 'community' },
  ],

  // ── INDONESIA ──
  'ubud': [
    { query: 'volunteer organization community Ubud Bali', volunteerType: 'community' },
    { query: 'animal rescue volunteer Ubud Bali', volunteerType: 'animal' },
    { query: 'organic farm permaculture volunteer Bali', volunteerType: 'farming' },
    { query: 'teaching English volunteer Bali', volunteerType: 'teaching' },
  ],
  'canggu': [
    { query: 'turtle conservation volunteer Bali', volunteerType: 'conservation' },
    { query: 'dog rescue volunteer Bali', volunteerType: 'animal' },
  ],
  'seminyak': [
    { query: 'animal shelter rescue volunteer Seminyak Bali', volunteerType: 'animal' },
  ],
  'yogyakarta': [
    { query: 'volunteer teaching community Yogyakarta', volunteerType: 'teaching' },
    { query: 'environmental conservation volunteer Yogyakarta', volunteerType: 'conservation' },
  ],

  // ── CAMBODIA ──
  'siem-reap': [
    { query: 'volunteer teaching children Siem Reap', volunteerType: 'teaching' },
    { query: 'community development NGO volunteer Siem Reap', volunteerType: 'community' },
    { query: 'wildlife sanctuary volunteer Siem Reap Cambodia', volunteerType: 'animal' },
  ],
  'phnom-penh': [
    { query: 'volunteer teaching NGO Phnom Penh', volunteerType: 'teaching' },
    { query: 'community development organization Phnom Penh', volunteerType: 'community' },
    { query: 'animal rescue shelter Phnom Penh', volunteerType: 'animal' },
  ],
  'kampot': [
    { query: 'volunteer farm community Kampot Cambodia', volunteerType: 'farming' },
  ],

  // ── PHILIPPINES ──
  'manila': [
    { query: 'volunteer NGO community Manila', volunteerType: 'community' },
    { query: 'teaching volunteer Manila Philippines', volunteerType: 'teaching' },
  ],
  'cebu': [
    { query: 'volunteer marine conservation Cebu', volunteerType: 'conservation' },
    { query: 'community volunteer teaching Cebu', volunteerType: 'teaching' },
  ],
  'el-nido': [
    { query: 'marine conservation volunteer El Nido Palawan', volunteerType: 'conservation' },
  ],
  'siargao': [
    { query: 'environmental volunteer Siargao', volunteerType: 'conservation' },
    { query: 'community development volunteer Siargao', volunteerType: 'community' },
  ],

  // ── MALAYSIA ──
  'kuala-lumpur': [
    { query: 'volunteer NGO community Kuala Lumpur', volunteerType: 'community' },
    { query: 'animal rescue shelter Kuala Lumpur', volunteerType: 'animal' },
  ],
  'penang': [
    { query: 'volunteer community conservation Penang', volunteerType: 'community' },
  ],
  'kota-kinabalu': [
    { query: 'wildlife conservation volunteer Kota Kinabalu Sabah', volunteerType: 'conservation' },
    { query: 'marine conservation volunteer Kota Kinabalu', volunteerType: 'conservation' },
  ],

  // ── LAOS ──
  'luang-prabang': [
    { query: 'volunteer teaching children Luang Prabang', volunteerType: 'teaching' },
    { query: 'elephant sanctuary volunteer Laos', volunteerType: 'animal' },
    { query: 'community volunteer Luang Prabang', volunteerType: 'community' },
  ],
  'vientiane': [
    { query: 'volunteer NGO Vientiane Laos', volunteerType: 'community' },
    { query: 'bear rescue volunteer Laos', volunteerType: 'animal' },
  ],

  // ── MYANMAR ──
  'yangon': [
    { query: 'volunteer community organization Yangon Myanmar', volunteerType: 'community' },
    { query: 'teaching volunteer Yangon', volunteerType: 'teaching' },
  ],

  // ── SINGAPORE ──
  'singapore': [
    { query: 'volunteer animal shelter Singapore', volunteerType: 'animal' },
    { query: 'community volunteer organization Singapore', volunteerType: 'community' },
    { query: 'environmental conservation volunteer Singapore', volunteerType: 'conservation' },
  ],

  // ── TAIWAN ──
  'taipei': [
    { query: 'volunteer NGO community Taipei', volunteerType: 'community' },
    { query: 'animal shelter volunteer Taipei', volunteerType: 'animal' },
    { query: 'environmental volunteer Taiwan', volunteerType: 'conservation' },
  ],
};

/** Generic fallback queries for cities without specific entries */
function buildGenericJobs(city: City): SearchJob[] {
  const loc = `${city.name} ${city.countryName}`;
  return [
    { query: `volunteer organization NGO ${loc}`, volunteerType: 'community', max: 8 },
    { query: `animal rescue shelter sanctuary ${loc}`, volunteerType: 'animal', max: 8 },
    { query: `teaching English volunteer ${loc}`, volunteerType: 'teaching', max: 5 },
    { query: `environmental conservation volunteer ${loc}`, volunteerType: 'conservation', max: 5 },
    { query: `organic farm permaculture volunteer ${loc}`, volunteerType: 'farming', max: 5 },
  ];
}

function buildSearchJobs(city: City): SearchJob[] {
  const specific = CITY_VOLUNTEER_QUERIES[city.slug];
  if (specific && specific.length > 0) {
    return specific;
  }
  return buildGenericJobs(city);
}

// ═══════════════════════════════════════════════════════════════════
// FILTERING & DEDUP
// ═══════════════════════════════════════════════════════════════════

/**
 * Filter out results that are clearly NOT volunteer organizations.
 * Google Places returns hotels, restaurants, etc. for broad queries.
 */
function isLikelyVolunteerOrg(name: string, addr: string): boolean {
  const text = `${name} ${addr}`.toLowerCase();

  // Reject obvious non-volunteer places
  const rejectPatterns = [
    /\b(hotel|resort|hostel|guesthouse|guest\s*house|villa|bnb|b&b)\b/,
    /\b(restaurant|cafe|coffee|bar|pub|club|rooftop)\b/,
    /\b(spa|massage|salon|gym|fitness)\b/,
    /\b(shop|store|market|mall|boutique|supermarket)\b/,
    /\b(bank|atm|money\s*exchange)\b/,
    /\b(tour\s*operator|travel\s*agency|booking)\b/,
    /\b(hospital|clinic|pharmacy|dental)\b/,  // Keep healthcare separate
  ];

  for (const pattern of rejectPatterns) {
    if (pattern.test(text)) return false;
  }

  // Accept if name suggests volunteer/NGO nature
  const acceptPatterns = [
    /\b(foundation|ngo|non[\s-]*profit|charity|association)\b/,
    /\b(rescue|sanctuary|shelter|refuge|rehab)\b/,
    /\b(conservation|preserve|wildlife|marine|eco)\b/,
    /\b(volunteer|community\s*center|community\s*development)\b/,
    /\b(school|education|teaching|learning|literacy)\b/,
    /\b(organic\s*farm|permaculture|cooperative|co[\s-]*op)\b/,
    /\b(children|youth|women|humanitarian)\b/,
  ];

  for (const pattern of acceptPatterns) {
    if (pattern.test(text)) return true;
  }

  // If no clear signal, let it through for manual review
  return true;
}

function filterAndDedup(
  results: Found[],
  existingGids: Set<string>,
  seenGids: Set<string>,
): Found[] {
  const filtered: Found[] = [];

  for (const p of results) {
    if (existingGids.has(p.gid)) continue;
    if (seenGids.has(p.gid)) continue;
    if (p.lat === 0 && p.lng === 0) continue;
    if (!isLikelyVolunteerOrg(p.name, p.addr)) continue;

    seenGids.add(p.gid);
    filtered.push(p);
  }

  return filtered;
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

async function insertVolunteer(
  f: Found,
  city: City,
  dryRun: boolean,
): Promise<string> {
  const id = randomUUID();
  const slug = `${slugify(f.name)}-${id.slice(0, 6)}`;

  if (dryRun) return id;

  const row: Record<string, unknown> = {
    id,
    city_id: city.id,
    slug,
    name: f.name,
    place_type: 'volunteer',
    volunteer_type: f.volunteerType,
    lat: f.lat,
    lng: f.lng,
    address: f.addr,
    google_place_id: f.gid,
    phone: f.phone,
    website: f.web,
    google_maps_url: f.googleMapsUrl,
    description: `${f.name} — volunteer opportunity in ${city.name}, ${city.countryName}. Contact directly for details.`,
    is_active: true,
    google_rating: f.rating,
    google_review_count: f.reviews,
    discovered_at: new Date().toISOString(),
    best_time_of_day: 'any',
    original_type: 'volunteer',
    volunteer_details: JSON.stringify({
      skills_needed: [],
      languages: [],
      includes_accommodation: null,
      includes_meals: null,
      cost_note: null,
      how_to_apply: f.web ? `Visit ${f.web} for volunteer information` : (f.phone ? `Call ${f.phone}` : 'Contact directly'),
      what_volunteers_do: null,
      email: null,
    }),
  };

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

  const best = selectBestPhotos(f.photos, PHOTO_LIMIT);
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
  const cityFilter = args.includes('--city')
    ? args[args.indexOf('--city') + 1]
    : null;
  const noPhotos = args.includes('--no-photos');

  const SE_ASIA_SLUGS = [
    'thailand', 'vietnam', 'indonesia', 'cambodia', 'philippines',
    'malaysia', 'myanmar', 'laos', 'singapore', 'taiwan',
  ];

  const targetCountries = countryFilter ? [countryFilter] : SE_ASIA_SLUGS;

  console.log('🤝 VOLUNTEER ORGANIZATION DISCOVERY');
  console.log('═'.repeat(60));
  console.log(`  Budget:     $${budget.toFixed(2)}`);
  console.log(`  Countries:  ${targetCountries.join(', ')}`);
  console.log(`  Photos:     ${noPhotos ? 'disabled' : 'enabled'}`);
  console.log(`  Dry run:    ${dryRun}`);
  console.log('');

  // ── Load cities ──
  let cityQuery = supabase
    .from('cities')
    .select('id, slug, name, countries!inner(name, slug)')
    .in('countries.slug', targetCountries)
    .order('name');

  const { data: cityData, error: cityErr } = await cityQuery;
  if (cityErr) throw cityErr;

  let allCities: City[] = (cityData ?? []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    countryName: (c.countries as any)?.name ?? '',
    countrySlug: (c.countries as any)?.slug ?? '',
  }));

  if (cityFilter) {
    allCities = allCities.filter(c => c.slug === cityFilter);
  }

  console.log(`📍 ${allCities.length} cities to search\n`);

  // Group by country for display
  const byCountry = new Map<string, City[]>();
  for (const c of allCities) {
    const arr = byCountry.get(c.countryName) ?? [];
    arr.push(c);
    byCountry.set(c.countryName, arr);
  }
  for (const [country, cs] of Array.from(byCountry.entries())) {
    console.log(`  ${country}: ${cs.map(c => c.name).join(', ')}`);
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
    byType: new Map<string, number>(),
    byCountry: new Map<string, number>(),
  };

  // ═══════════════════════════════════════════════════════════════
  // DISCOVERY LOOP
  // ═══════════════════════════════════════════════════════════════

  for (const city of allCities) {
    if (!canAfford('search', budget)) {
      console.log(`\n💰 Budget reached ($${spent().toFixed(2)}). Stopping.`);
      break;
    }

    console.log(`\n📍 ${city.name}, ${city.countryName}`);
    console.log('─'.repeat(50));

    const existingGids = await getExistingGids(city.id);
    const seenGids = new Set<string>();
    const jobs = buildSearchJobs(city);

    for (const job of jobs) {
      if (!canAfford('search', budget)) break;

      console.log(`  🔍 "${job.query.slice(0, 50)}..."`);
      const raw = await textSearch(job.query, { max: job.max ?? 10 });
      stats.searches++;
      await sleep(RATE_MS);

      // Map to Found type
      const results: Found[] = raw.map(r => ({
        ...r,
        volunteerType: inferVolunteerType(r.name, job.query),
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${r.gid}`,
      }));

      // Filter and dedup
      const filtered = filterAndDedup(results, existingGids, seenGids);

      if (filtered.length === 0) {
        console.log(`    → 0 candidates`);
        continue;
      }

      console.log(`    → ${filtered.length} candidates:`);

      for (const f of filtered) {
        stats.discovered++;
        const typeLabel = f.volunteerType.toUpperCase().padEnd(12);
        const ratingStr = f.rating ? `★${f.rating}` : '—';
        const reviewStr = f.reviews ? `(${f.reviews})` : '';
        console.log(`      ${typeLabel} ${f.name}`);
        console.log(`                 ${ratingStr} ${reviewStr} | ${f.web ?? 'no website'}`);

        // Insert to database
        try {
          const placeId = await insertVolunteer(f, city, dryRun);

          if (!dryRun) {
            stats.seeded++;
            const countryCount = stats.byCountry.get(city.countryName) ?? 0;
            stats.byCountry.set(city.countryName, countryCount + 1);
            const typeCount = stats.byType.get(f.volunteerType) ?? 0;
            stats.byType.set(f.volunteerType, typeCount + 1);

            // Download photos
            if (!noPhotos && f.photos.length > 0) {
              const photoCount = await downloadPhotos(f, placeId, city, budget, dryRun);
              stats.photos += photoCount;
            }
          }
        } catch (err: any) {
          console.log(`      ⚠ Insert failed: ${err.message.slice(0, 80)}`);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════

  console.log('\n');
  console.log('═'.repeat(60));
  console.log('DISCOVERY SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Searches:    ${stats.searches}`);
  console.log(`  Discovered:  ${stats.discovered}`);
  console.log(`  Seeded:      ${stats.seeded}`);
  console.log(`  Photos:      ${stats.photos}`);
  console.log(`  Cost:        $${spent().toFixed(2)}`);
  console.log('');

  if (stats.byCountry.size > 0) {
    console.log('  By country:');
    for (const [country, count] of Array.from(stats.byCountry.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${country.padEnd(20)} ${count}`);
    }
    console.log('');
    console.log('  By type:');
    for (const [type, count] of Array.from(stats.byType.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${type.padEnd(20)} ${count}`);
    }
  }

  console.log('\n✅ Done!');
  if (dryRun) {
    console.log('   (Dry run — nothing saved to database)');
  }
  if (stats.seeded > 0) {
    console.log(`\n📝 Next step: Enrich volunteer details with:`);
    console.log(`   npx tsx scripts/enrich-volunteer-orgs.ts`);
  }
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
