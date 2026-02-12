/**
 * Enrich place images using Google Places API (New).
 *
 * For each active place that has NO image in place_media:
 *   1. If the place has a google_place_id → fetch photos via Place Details
 *   2. If no google_place_id → search by "placeName cityName" via Text Search
 *   3. Download the first photo, resize to 600x400 JPEG
 *   4. Upload to Supabase Storage `images/places/` bucket
 *   5. Insert into place_media table
 *
 * Prerequisites:
 *   1. Public `images` bucket in Supabase Storage
 *   2. GOOGLE_PLACES_API_KEY, SUPABASE_SERVICE_ROLE_KEY, EXPO_PUBLIC_SUPABASE_URL in .env
 *
 * Usage:
 *   npx tsx scripts/enrich-place-images.ts
 *   npx tsx scripts/enrich-place-images.ts --dry-run
 *   npx tsx scripts/enrich-place-images.ts --refresh
 *   npx tsx scripts/enrich-place-images.ts --country=thailand
 *   npx tsx scripts/enrich-place-images.ts --limit=50
 */

import 'dotenv/config';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Environment
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
const WIDTH = 600;
const HEIGHT = 400;
const QUALITY = 80;
const DELAY_MS = 400;

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

interface Flags {
  dryRun: boolean;
  refresh: boolean;
  country: string | null;
  limit: number;
}

function parseFlags(): Flags {
  const args = process.argv.slice(2);
  const flags: Flags = { dryRun: false, refresh: false, country: null, limit: 500 };

  for (const arg of args) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--refresh') flags.refresh = true;
    else if (arg.startsWith('--country=')) flags.country = arg.split('=')[1];
    else if (arg.startsWith('--limit=')) flags.limit = parseInt(arg.split('=')[1], 10);
    else { console.error(`Unknown flag: ${arg}`); process.exit(1); }
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

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

interface PhotoRef {
  photoName: string;
  attribution: string | null;
}

/**
 * Get photo references for a place by its Google Place ID.
 * Uses the Place Details (New) endpoint.
 */
async function getPlacePhotos(googlePlaceId: string): Promise<PhotoRef | null> {
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'photos',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Place Details failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const photo = data.photos?.[0];
  if (!photo?.name) return null;

  return {
    photoName: photo.name,
    attribution: photo.authorAttributions?.[0]?.displayName ?? null,
  };
}

/**
 * Search for a place by name and get its first photo.
 * Fallback when google_place_id is not available.
 */
async function searchPlacePhoto(query: string): Promise<PhotoRef | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'places.photos',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: 'en' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text Search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const photo = data.places?.[0]?.photos?.[0];
  if (!photo?.name) return null;

  return {
    photoName: photo.name,
    attribution: photo.authorAttributions?.[0]?.displayName ?? null,
  };
}

/**
 * Download and resize a photo from Google Places.
 */
async function fetchAndResize(photoName: string): Promise<Buffer> {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photo download failed (${res.status})`);

  const raw = Buffer.from(await res.arrayBuffer());
  return sharp(raw)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .jpeg({ quality: QUALITY })
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface PlaceRow {
  id: string;
  name: string;
  slug: string;
  google_place_id: string | null;
  city_name: string;
  country_slug: string;
  has_media: boolean;
}

async function main() {
  const flags = parseFlags();

  console.log('Enriching place images via Google Places API');
  console.log(`  dry-run:  ${flags.dryRun}`);
  console.log(`  refresh:  ${flags.refresh}`);
  console.log(`  country:  ${flags.country ?? 'all'}`);
  console.log(`  limit:    ${flags.limit}`);
  console.log('');

  // Ensure bucket exists
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // Get all places that need images
  let query = supabase
    .from('places')
    .select(`
      id, name, slug, google_place_id,
      cities!inner(name, countries!inner(slug))
    `)
    .eq('is_active', true)
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(flags.limit);

  if (flags.country) {
    query = query.eq('cities.countries.slug', flags.country);
  }

  const { data: rawPlaces, error: placesError } = await query;
  if (placesError) throw placesError;
  if (!rawPlaces?.length) {
    console.log('No places found.');
    return;
  }

  // Get existing media to know which places already have images
  // Batch the .in() query to avoid URL length limits with large ID lists
  const placeIds = rawPlaces.map((p: any) => p.id);
  const BATCH_SIZE = 100;
  const allExistingMedia: { place_id: string }[] = [];
  for (let i = 0; i < placeIds.length; i += BATCH_SIZE) {
    const batch = placeIds.slice(i, i + BATCH_SIZE);
    const { data: batchMedia } = await supabase
      .from('place_media')
      .select('place_id')
      .in('place_id', batch);
    if (batchMedia) allExistingMedia.push(...batchMedia);
  }

  const placesWithMedia = new Set(allExistingMedia.map((m) => m.place_id));

  const places: PlaceRow[] = rawPlaces.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    google_place_id: p.google_place_id,
    city_name: (p.cities as any)?.name ?? '',
    country_slug: (p.cities as any)?.countries?.slug ?? '',
    has_media: placesWithMedia.has(p.id),
  }));

  // Filter to only places that need images (unless --refresh)
  const toProcess = flags.refresh
    ? places
    : places.filter((p) => !p.has_media);

  console.log(`Found ${places.length} places total, ${toProcess.length} need images.\n`);

  let enriched = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const place = toProcess[i];
    const label = `[${i + 1}/${toProcess.length}] ${place.name} (${place.city_name})`;

    if (flags.dryRun) {
      const searchQuery = place.google_place_id
        ? `[by ID: ${place.google_place_id}]`
        : `"${place.name} ${place.city_name}"`;
      console.log(`  ${label} -> DRY RUN ${searchQuery}`);
      skipped++;
      continue;
    }

    try {
      // 1. Get photo reference — prefer google_place_id, fallback to text search
      let photoRef: PhotoRef | null = null;

      if (place.google_place_id) {
        photoRef = await getPlacePhotos(place.google_place_id);
      }

      if (!photoRef) {
        // Fallback: search by name + city
        photoRef = await searchPlacePhoto(`${place.name} ${place.city_name}`);
      }

      if (!photoRef) {
        console.log(`  ${label} -> SKIP (no photos found)`);
        skipped++;
        await sleep(DELAY_MS);
        continue;
      }

      // 2. Download and resize
      const imageData = await fetchAndResize(photoRef.photoName);

      // 3. Upload to Supabase Storage
      const storagePath = `places/${place.country_slug}/${slugify(place.name)}-${place.id.slice(0, 8)}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      // 4. If refreshing, delete existing media first
      if (flags.refresh && place.has_media) {
        await supabase.from('place_media').delete().eq('place_id', place.id);
      }

      // 5. Insert into place_media
      const { error: insertError } = await supabase
        .from('place_media')
        .insert({
          id: randomUUID(),
          place_id: place.id,
          url: imageUrl,
          media_type: 'image',
          caption: photoRef.attribution ? `Photo by ${photoRef.attribution}` : null,
          source: 'google',
          order_index: 0,
        });

      if (insertError) throw insertError;

      console.log(`  ${label} -> OK`);
      enriched++;
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  // Summary
  console.log('\n========================================');
  console.log(`Total: ${toProcess.length} | Enriched: ${enriched} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log('Done!');
}

async function uploadToStorage(storagePath: string, data: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, data, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return publicUrl(storagePath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
