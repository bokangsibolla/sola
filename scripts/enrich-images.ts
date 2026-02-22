/**
 * Enrich country, city, and area hero images using Google Places API (New).
 *
 * Fetches landmark/city/area photos via Google Places Text Search (New),
 * scores candidates for quality, resizes via Sharp, uploads to Supabase Storage,
 * and updates the corresponding DB rows.
 *
 * Country/city: 1200x800 hero images
 * Areas: 1000x667 hero images
 *
 * Usage:
 *   npm run enrich:images
 *   npm run enrich:images -- --dry-run
 *   npm run enrich:images -- --refresh
 *   npm run enrich:images -- --only=countries
 *   npm run enrich:images -- --only=cities
 *   npm run enrich:images -- --only=areas
 *   npm run enrich:images -- --delay=1000
 */

import {
  supabase,
  BUCKET,
  searchPlaceWithPhotos,
  selectBestPhotos,
  downloadAndResize,
  uploadToStorage,
  sleep,
  slugify,
  type ResizeConfig,
} from './lib/image-utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_CONFIG: ResizeConfig = { width: 1200, height: 800, fetchWidth: 2400 };
const AREA_CONFIG: ResizeConfig = { width: 1000, height: 667, fetchWidth: 2000 };

// ---------------------------------------------------------------------------
// Country landmark mapping
// ---------------------------------------------------------------------------

const COUNTRY_LANDMARKS: Record<string, string> = {
  thailand: 'Grand Palace Bangkok',
  vietnam: 'Ha Long Bay Vietnam',
  indonesia: 'Tegallalang Rice Terraces Bali',
  philippines: 'El Nido Palawan Philippines',
  malaysia: 'Petronas Towers Kuala Lumpur',
  singapore: 'Marina Bay Sands Singapore',
  cambodia: 'Angkor Wat Cambodia',
  laos: 'Luang Prabang Laos',
  myanmar: 'Bagan Temples Myanmar',
  japan: 'Mount Fuji Japan',
  portugal: 'Belem Tower Lisbon',
  morocco: 'Chefchaouen Blue City Morocco',
  'south-africa': 'Table Mountain Cape Town',
  zimbabwe: 'Victoria Falls Zimbabwe',
  namibia: 'Sossusvlei Dunes Namibia',
  mozambique: 'Tofo Beach Mozambique',
  lesotho: 'Maletsunyane Falls Lesotho',
};

// ---------------------------------------------------------------------------
// CLI flag parsing
// ---------------------------------------------------------------------------

interface CliFlags {
  dryRun: boolean;
  refresh: boolean;
  only: 'countries' | 'cities' | 'areas' | null;
  delay: number;
}

function parseFlags(): CliFlags {
  const args = process.argv.slice(2);
  const flags: CliFlags = {
    dryRun: false,
    refresh: false,
    only: null,
    delay: 500,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--refresh') {
      flags.refresh = true;
    } else if (arg.startsWith('--only=')) {
      const val = arg.split('=')[1];
      if (val === 'countries' || val === 'cities' || val === 'areas') {
        flags.only = val;
      } else {
        console.error(`Invalid --only value: "${val}". Must be "countries", "cities", or "areas".`);
        process.exit(1);
      }
    } else if (arg.startsWith('--delay=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (isNaN(val) || val < 0) {
        console.error(`Invalid --delay value. Must be a non-negative integer.`);
        process.exit(1);
      }
      flags.delay = val;
    } else {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    }
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Result tracking
// ---------------------------------------------------------------------------

interface EnrichResult {
  name: string;
  status: 'enriched' | 'skipped' | 'failed';
  reason?: string;
}

// ---------------------------------------------------------------------------
// Search with fallback queries
// ---------------------------------------------------------------------------

async function searchWithFallbacks(queries: string[]) {
  for (const q of queries) {
    const result = await searchPlaceWithPhotos(q);
    if (result && result.candidates.length > 0) {
      return result;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Enrichment: Countries
// ---------------------------------------------------------------------------

async function enrichCountries(flags: CliFlags): Promise<EnrichResult[]> {
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, slug, name, image_cached_at')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  if (!countries?.length) {
    console.log('  No active countries found.');
    return [];
  }

  const results: EnrichResult[] = [];

  for (let i = 0; i < countries.length; i++) {
    const c = countries[i];
    const label = `[${i + 1}/${countries.length}] country: ${c.name}`;

    if (c.image_cached_at && !flags.refresh) {
      console.log(`  ${label} -> SKIP (already cached)`);
      results.push({ name: c.name, status: 'skipped' });
      continue;
    }

    const query = COUNTRY_LANDMARKS[c.slug] ?? `${c.name} famous landmark`;

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (query: "${query}")`);
      results.push({ name: c.name, status: 'skipped', reason: 'dry-run' });
      continue;
    }

    try {
      const searchResult = await searchPlaceWithPhotos(query);
      if (!searchResult) throw new Error('No place found');
      if (searchResult.candidates.length === 0) throw new Error('Place has no photos');

      const best = selectBestPhotos(searchResult.candidates, 1);
      if (best.length === 0) throw new Error('No photos passed quality filter');

      const imageData = await downloadAndResize(best[0].photoName, HERO_CONFIG);
      const storagePath = `countries/${c.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      const { error: updateError } = await supabase
        .from('countries')
        .update({
          hero_image_url: imageUrl,
          google_place_id: searchResult.placeId,
          image_source: 'google',
          image_attribution: best[0].attribution,
          image_cached_at: new Date().toISOString(),
        })
        .eq('id', c.id);

      if (updateError) throw updateError;

      console.log(`  ${label} -> OK`);
      results.push({ name: c.name, status: 'enriched' });
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      results.push({ name: c.name, status: 'failed', reason: err.message });
    }

    await sleep(flags.delay);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Enrichment: Cities
// ---------------------------------------------------------------------------

async function enrichCities(flags: CliFlags): Promise<EnrichResult[]> {
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, slug, name, image_cached_at, countries(name)')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  if (!cities?.length) {
    console.log('  No active cities found.');
    return [];
  }

  const results: EnrichResult[] = [];

  for (let i = 0; i < cities.length; i++) {
    const c = cities[i] as any;
    const countryName = c.countries?.name ?? '';
    const label = `[${i + 1}/${cities.length}] city: ${c.name}`;

    if (c.image_cached_at && !flags.refresh) {
      console.log(`  ${label} -> SKIP (already cached)`);
      results.push({ name: c.name, status: 'skipped' });
      continue;
    }

    // Better search queries with fallbacks
    const queries = [
      `${c.name} skyline aerial view`,
      `${c.name} ${countryName} cityscape`,
      `${c.name} ${countryName}`,
    ];

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (queries: ${queries.map((q) => `"${q}"`).join(', ')})`);
      results.push({ name: c.name, status: 'skipped', reason: 'dry-run' });
      continue;
    }

    try {
      const searchResult = await searchWithFallbacks(queries);
      if (!searchResult) throw new Error('No place found');

      const best = selectBestPhotos(searchResult.candidates, 1);
      if (best.length === 0) throw new Error('No photos passed quality filter');

      const imageData = await downloadAndResize(best[0].photoName, HERO_CONFIG);
      const storagePath = `cities/${c.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      const { error: updateError } = await supabase
        .from('cities')
        .update({
          hero_image_url: imageUrl,
          google_place_id: searchResult.placeId,
          image_source: 'google',
          image_attribution: best[0].attribution,
          image_cached_at: new Date().toISOString(),
        })
        .eq('id', c.id);

      if (updateError) throw updateError;

      console.log(`  ${label} -> OK`);
      results.push({ name: c.name, status: 'enriched' });
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      results.push({ name: c.name, status: 'failed', reason: err.message });
    }

    await sleep(flags.delay);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Enrichment: Areas
// ---------------------------------------------------------------------------

async function enrichAreas(flags: CliFlags): Promise<EnrichResult[]> {
  const { data: areas, error } = await supabase
    .from('city_areas')
    .select('id, name, slug, hero_image_url, cities(name, slug)')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  if (!areas?.length) {
    console.log('  No active areas found.');
    return [];
  }

  const results: EnrichResult[] = [];

  for (let i = 0; i < areas.length; i++) {
    const a = areas[i] as any;
    const cityName = a.cities?.name ?? '';
    const citySlug = a.cities?.slug ?? '';
    const areaSlug = a.slug ?? slugify(a.name);
    const label = `[${i + 1}/${areas.length}] area: ${a.name} (${cityName})`;

    // Skip if already has an image (unless --refresh)
    if (a.hero_image_url && !flags.refresh) {
      console.log(`  ${label} -> SKIP (already has image)`);
      results.push({ name: a.name, status: 'skipped' });
      continue;
    }

    // Fallback search queries
    const queries = [
      `${a.name} ${cityName} street`,
      `${a.name} neighborhood ${cityName}`,
      `${a.name} ${cityName}`,
    ];

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (queries: ${queries.map((q) => `"${q}"`).join(', ')})`);
      results.push({ name: a.name, status: 'skipped', reason: 'dry-run' });
      continue;
    }

    try {
      const searchResult = await searchWithFallbacks(queries);
      if (!searchResult) throw new Error('No place found');

      const best = selectBestPhotos(searchResult.candidates, 1);
      if (best.length === 0) throw new Error('No photos passed quality filter');

      const imageData = await downloadAndResize(best[0].photoName, AREA_CONFIG);
      const storagePath = `areas/${citySlug}-${areaSlug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      const { error: updateError } = await supabase
        .from('city_areas')
        .update({ hero_image_url: imageUrl })
        .eq('id', a.id);

      if (updateError) throw updateError;

      console.log(`  ${label} -> OK`);
      results.push({ name: a.name, status: 'enriched' });
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      results.push({ name: a.name, status: 'failed', reason: err.message });
    }

    await sleep(flags.delay);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const flags = parseFlags();

  console.log('Enriching hero images via Google Places API (New)');
  console.log(`  dry-run: ${flags.dryRun}`);
  console.log(`  refresh: ${flags.refresh}`);
  console.log(`  only:    ${flags.only ?? 'all'}`);
  console.log(`  delay:   ${flags.delay}ms`);
  console.log('');

  // Ensure bucket exists
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  let countryResults: EnrichResult[] = [];
  let cityResults: EnrichResult[] = [];
  let areaResults: EnrichResult[] = [];

  if (!flags.only || flags.only === 'countries') {
    console.log('--- Countries ---');
    countryResults = await enrichCountries(flags);
    console.log('');
  }

  if (!flags.only || flags.only === 'cities') {
    console.log('--- Cities ---');
    cityResults = await enrichCities(flags);
    console.log('');
  }

  if (!flags.only || flags.only === 'areas') {
    console.log('--- Areas ---');
    areaResults = await enrichAreas(flags);
    console.log('');
  }

  // Summary
  const all = [...countryResults, ...cityResults, ...areaResults];
  const enriched = all.filter((r) => r.status === 'enriched');
  const skipped = all.filter((r) => r.status === 'skipped');
  const failed = all.filter((r) => r.status === 'failed');

  console.log('========================================');
  console.log(`Total: ${all.length} | Enriched: ${enriched.length} | Skipped: ${skipped.length} | Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed items:');
    for (const f of failed) {
      console.log(`  - ${f.name}: ${f.reason}`);
    }
  }

  console.log('\nDone!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
