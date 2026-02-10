/**
 * Enrich country and city hero images using Google Places API (New).
 *
 * Fetches landmark/city photos via Google Places Text Search (New),
 * resizes to 800x600 JPEG via Sharp, uploads to Supabase Storage `images/` bucket,
 * and updates the corresponding DB rows with image metadata.
 *
 * Prerequisites:
 *   1. Public `images` bucket exists in Supabase Storage
 *   2. countries/cities tables have columns: google_place_id, image_source,
 *      image_attribution, image_cached_at (run the matching migration first)
 *   3. GOOGLE_PLACES_API_KEY, SUPABASE_SERVICE_ROLE_KEY, EXPO_PUBLIC_SUPABASE_URL in .env
 *
 * Usage:
 *   npm run enrich:images
 *   npm run enrich:images -- --dry-run
 *   npm run enrich:images -- --refresh
 *   npm run enrich:images -- --only=countries
 *   npm run enrich:images -- --only=cities
 *   npm run enrich:images -- --delay=1000
 */

import 'dotenv/config';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY is required in .env');
  process.exit(1);
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUCKET = 'images';
const WIDTH = 800;
const HEIGHT = 600;
const QUALITY = 80;
const DEFAULT_DELAY_MS = 500;

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
};

// ---------------------------------------------------------------------------
// CLI flag parsing
// ---------------------------------------------------------------------------

interface CliFlags {
  dryRun: boolean;
  refresh: boolean;
  only: 'countries' | 'cities' | null;
  delay: number;
}

function parseFlags(): CliFlags {
  const args = process.argv.slice(2);
  const flags: CliFlags = {
    dryRun: false,
    refresh: false,
    only: null,
    delay: DEFAULT_DELAY_MS,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--refresh') {
      flags.refresh = true;
    } else if (arg.startsWith('--only=')) {
      const val = arg.split('=')[1];
      if (val === 'countries' || val === 'cities') {
        flags.only = val;
      } else {
        console.error(`Invalid --only value: "${val}". Must be "countries" or "cities".`);
        process.exit(1);
      }
    } else if (arg.startsWith('--delay=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (isNaN(val) || val < 0) {
        console.error(`Invalid --delay value: "${arg.split('=')[1]}". Must be a non-negative integer.`);
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
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ---------------------------------------------------------------------------
// Google Places API (New)
// ---------------------------------------------------------------------------

interface PlacePhoto {
  name: string;
  authorAttributions?: { displayName?: string }[];
}

interface TextSearchPlace {
  id: string;
  photos?: PlacePhoto[];
}

interface TextSearchResponse {
  places?: TextSearchPlace[];
}

/**
 * Search for a place using Google Places Text Search (New).
 * Returns the first place result with its ID and first photo reference.
 */
async function searchPlace(query: string): Promise<{
  placeId: string;
  photoName: string | null;
  attribution: string | null;
} | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: 'en' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text Search failed (${res.status}): ${text}`);
  }

  const data: TextSearchResponse = await res.json();
  const place = data.places?.[0];
  if (!place) return null;

  const firstPhoto = place.photos?.[0] ?? null;
  const photoName = firstPhoto?.name ?? null;
  const attribution = firstPhoto?.authorAttributions?.[0]?.displayName ?? null;

  return {
    placeId: place.id,
    photoName,
    attribution,
  };
}

/**
 * Download photo bytes from Google Places Photo (New) endpoint.
 */
async function fetchPhotoBytes(photoName: string): Promise<Buffer> {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Photo download failed (${res.status}): ${await res.text()}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

/**
 * Resize raw photo bytes to 800x600 JPEG at 80% quality.
 */
async function resizeImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .jpeg({ quality: QUALITY })
    .toBuffer();
}

/**
 * Upload a JPEG buffer to Supabase Storage (upsert).
 */
async function uploadToStorage(storagePath: string, data: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, data, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return publicUrl(storagePath);
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
// Enrichment processors
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

    // Skip if already cached (unless --refresh)
    if (c.image_cached_at && !flags.refresh) {
      console.log(`  ${label} -> SKIP (already cached)`);
      results.push({ name: c.name, status: 'skipped' });
      continue;
    }

    // Build search query: use landmark mapping if available, otherwise fallback
    const query = COUNTRY_LANDMARKS[c.slug] ?? `${c.name} famous landmark`;

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (query: "${query}")`);
      results.push({ name: c.name, status: 'skipped', reason: 'dry-run' });
      continue;
    }

    try {
      // 1. Text Search -> get place_id, photo name, attribution
      const searchResult = await searchPlace(query);
      if (!searchResult) throw new Error('No place found');
      if (!searchResult.photoName) throw new Error('Place has no photos');

      // 2. Fetch photo bytes at 1200px
      const rawBytes = await fetchPhotoBytes(searchResult.photoName);

      // 3. Resize with Sharp
      const resized = await resizeImage(rawBytes);

      // 4. Upload to Supabase Storage
      const storagePath = `countries/${c.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, resized);

      // 5. Update DB row
      const { error: updateError } = await supabase
        .from('countries')
        .update({
          hero_image_url: imageUrl,
          google_place_id: searchResult.placeId,
          image_source: 'google',
          image_attribution: searchResult.attribution,
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

    // Skip if already cached (unless --refresh)
    if (c.image_cached_at && !flags.refresh) {
      console.log(`  ${label} -> SKIP (already cached)`);
      results.push({ name: c.name, status: 'skipped' });
      continue;
    }

    // Build search query: "CityName CountryName"
    const query = `${c.name} ${countryName}`;

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (query: "${query}")`);
      results.push({ name: c.name, status: 'skipped', reason: 'dry-run' });
      continue;
    }

    try {
      // 1. Text Search -> get place_id, photo name, attribution
      const searchResult = await searchPlace(query);
      if (!searchResult) throw new Error('No place found');
      if (!searchResult.photoName) throw new Error('Place has no photos');

      // 2. Fetch photo bytes at 1200px
      const rawBytes = await fetchPhotoBytes(searchResult.photoName);

      // 3. Resize with Sharp
      const resized = await resizeImage(rawBytes);

      // 4. Upload to Supabase Storage
      const storagePath = `cities/${c.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, resized);

      // 5. Update DB row
      const { error: updateError } = await supabase
        .from('cities')
        .update({
          hero_image_url: imageUrl,
          google_place_id: searchResult.placeId,
          image_source: 'google',
          image_attribution: searchResult.attribution,
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

  // Ensure bucket exists (will fail silently if it already exists)
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  let countryResults: EnrichResult[] = [];
  let cityResults: EnrichResult[] = [];

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

  // Summary
  const all = [...countryResults, ...cityResults];
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
