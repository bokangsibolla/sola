/**
 * Fetch Google's curated hero images for countries and cities.
 *
 * When you search "Thailand" or "Cape Town" on Google, the knowledge panel
 * shows a beautiful, curated landscape image. That's what this script gets —
 * by searching for the country/city NAME as a place entity (not a landmark).
 *
 * The first photo from a country/city entity on Google Places is typically
 * that iconic, high-quality overview shot.
 *
 * Downloads at maximum resolution (4800px), resizes to 1200x800 JPEG,
 * uploads to Supabase Storage.
 *
 * Usage:
 *   npx tsx scripts/enrich-country-heroes.ts
 *   npx tsx scripts/enrich-country-heroes.ts --dry-run
 *   npx tsx scripts/enrich-country-heroes.ts --only=countries
 *   npx tsx scripts/enrich-country-heroes.ts --only=cities
 */

import {
  supabase,
  BUCKET,
  selectBestPhotos,
  downloadAndResize,
  uploadToStorage,
  sleep,
  type PhotoCandidate,
  type ResizeConfig,
} from './lib/image-utils';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const HERO_CONFIG: ResizeConfig = { width: 1200, height: 800, quality: 85, fetchWidth: 4800 };
const DELAY_MS = 600;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Flags {
  dryRun: boolean;
  only: 'countries' | 'cities' | null;
}

function parseFlags(): Flags {
  const args = process.argv.slice(2);
  const flags: Flags = { dryRun: false, only: null };
  for (const arg of args) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--only=countries') flags.only = 'countries';
    else if (arg === '--only=cities') flags.only = 'cities';
    else { console.error(`Unknown flag: ${arg}`); process.exit(1); }
  }
  return flags;
}

// ---------------------------------------------------------------------------
// Google Places — search for entity photos
// ---------------------------------------------------------------------------

/**
 * Search Google Places for a place entity and return ALL photo candidates.
 * When you search for "Thailand" or "Bangkok", Google returns the country/city
 * entity with its curated photos — these are the Knowledge Panel images.
 */
async function searchEntityPhotos(query: string): Promise<{
  placeId: string;
  candidates: PhotoCandidate[];
} | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 1,
      languageCode: 'en',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text Search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const place = data.places?.[0];
  if (!place) return null;

  const candidates: PhotoCandidate[] = (place.photos ?? []).map((p: any) => ({
    photoName: p.name,
    widthPx: p.widthPx ?? 0,
    heightPx: p.heightPx ?? 0,
    attribution: p.authorAttributions?.[0]?.displayName ?? null,
  }));

  return { placeId: place.id, candidates };
}

/**
 * Try multiple search queries in order, return first result with photos.
 */
async function searchWithFallbacks(queries: string[]): Promise<{
  placeId: string;
  candidates: PhotoCandidate[];
  query: string;
} | null> {
  for (const q of queries) {
    const result = await searchEntityPhotos(q);
    if (result && result.candidates.length > 0) {
      return { ...result, query: q };
    }
    await sleep(200);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

async function enrichCountries(flags: Flags) {
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, slug, name')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  if (!countries?.length) {
    console.log('  No active countries found.');
    return { enriched: 0, failed: 0 };
  }

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < countries.length; i++) {
    const c = countries[i];
    const label = `[${i + 1}/${countries.length}] ${c.name}`;

    // Search for the COUNTRY ENTITY — not a landmark
    const queries = [
      c.name,                           // "Thailand" — gets the country entity
      `${c.name} country`,              // "Thailand country" — more specific
      `${c.name} landscape panoramic`,  // fallback for scenic shot
    ];

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (queries: ${queries.map((q) => `"${q}"`).join(' → ')})`);
      continue;
    }

    try {
      const result = await searchWithFallbacks(queries);
      if (!result) throw new Error('No entity found');

      // Pick the best landscape photo (Google's first photo is usually the curated one)
      const best = selectBestPhotos(result.candidates, 1);
      if (best.length === 0) throw new Error('No landscape photos found');

      // Download at max resolution (4800px) for crisp hero
      const imageData = await downloadAndResize(best[0].photoName, HERO_CONFIG);
      const storagePath = `countries/${c.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      // Update DB
      const { error: updateError } = await supabase
        .from('countries')
        .update({
          hero_image_url: imageUrl,
          google_place_id: result.placeId,
          image_source: 'google',
          image_attribution: best[0].attribution,
          image_cached_at: new Date().toISOString(),
        })
        .eq('id', c.id);

      if (updateError) throw updateError;

      const dims = `${best[0].widthPx}x${best[0].heightPx}`;
      console.log(`  ${label} -> OK (matched: "${result.query}", original: ${dims})`);
      enriched++;
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  return { enriched, failed };
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

async function enrichCities(flags: Flags) {
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, slug, name, countries(name)')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  if (!cities?.length) {
    console.log('  No active cities found.');
    return { enriched: 0, failed: 0 };
  }

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < cities.length; i++) {
    const c = cities[i] as any;
    const countryName = c.countries?.name ?? '';
    const label = `[${i + 1}/${cities.length}] ${c.name}`;

    // Search for the CITY ENTITY
    const queries = [
      `${c.name} ${countryName}`,               // "Bangkok Thailand" — city entity
      c.name,                                     // "Bangkok" — simpler
      `${c.name} city ${countryName}`,           // "Bangkok city Thailand"
      `${c.name} skyline panoramic`,             // fallback scenic
    ];

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (queries: ${queries.map((q) => `"${q}"`).join(' → ')})`);
      continue;
    }

    try {
      const result = await searchWithFallbacks(queries);
      if (!result) throw new Error('No entity found');

      const best = selectBestPhotos(result.candidates, 1);
      if (best.length === 0) throw new Error('No landscape photos found');

      const imageData = await downloadAndResize(best[0].photoName, HERO_CONFIG);
      const storagePath = `cities/${c.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      const { error: updateError } = await supabase
        .from('cities')
        .update({
          hero_image_url: imageUrl,
          google_place_id: result.placeId,
          image_source: 'google',
          image_attribution: best[0].attribution,
          image_cached_at: new Date().toISOString(),
        })
        .eq('id', c.id);

      if (updateError) throw updateError;

      const dims = `${best[0].widthPx}x${best[0].heightPx}`;
      console.log(`  ${label} -> OK (matched: "${result.query}", original: ${dims})`);
      enriched++;
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  return { enriched, failed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const flags = parseFlags();

  console.log('Fetching Google curated hero images (entity photos)');
  console.log(`  dry-run: ${flags.dryRun}`);
  console.log(`  only:    ${flags.only ?? 'countries + cities'}`);
  console.log(`  resolution: ${HERO_CONFIG.width}x${HERO_CONFIG.height} @ quality ${HERO_CONFIG.quality}`);
  console.log(`  fetch width: ${HERO_CONFIG.fetchWidth}px (max res download)`);
  console.log('');

  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  let totalEnriched = 0;
  let totalFailed = 0;

  if (!flags.only || flags.only === 'countries') {
    console.log('--- Countries ---');
    const r = await enrichCountries(flags);
    totalEnriched += r.enriched;
    totalFailed += r.failed;
    console.log('');
  }

  if (!flags.only || flags.only === 'cities') {
    console.log('--- Cities ---');
    const r = await enrichCities(flags);
    totalEnriched += r.enriched;
    totalFailed += r.failed;
    console.log('');
  }

  console.log('========================================');
  console.log(`Enriched: ${totalEnriched} | Failed: ${totalFailed}`);
  console.log('Done!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
