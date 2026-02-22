/**
 * Enrich place images using Google Places API (New).
 *
 * For each active place:
 *   1. Fetch photo candidates (via google_place_id or text search)
 *   2. Score candidates by resolution, aspect ratio, width
 *   3. Select top N photos based on place type
 *   4. Download at 2x, resize with Sharp
 *   5. Upload to Supabase Storage `images/places/`
 *   6. Insert into place_media table
 *   7. Auto-update image_url_cached on places table
 *
 * Photo counts by place type:
 *   restaurant/cafe/bar/hotel/hostel/homestay → 3 photos
 *   landmark/activity/wellness                → 2 photos
 *   tour/shop/coworking                       → 1 photo
 *
 * Usage:
 *   npx tsx scripts/enrich-place-images.ts
 *   npx tsx scripts/enrich-place-images.ts --dry-run
 *   npx tsx scripts/enrich-place-images.ts --dry-run --limit=5
 *   npx tsx scripts/enrich-place-images.ts --refresh
 *   npx tsx scripts/enrich-place-images.ts --country=south-africa
 *   npx tsx scripts/enrich-place-images.ts --limit=50
 */

import { randomUUID } from 'crypto';
import {
  supabase,
  BUCKET,
  fetchPhotoRefs,
  getPlacePhotoRefs,
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

const PRIMARY_CONFIG: ResizeConfig = { width: 800, height: 600, fetchWidth: 1600 };
const SECONDARY_CONFIG: ResizeConfig = { width: 600, height: 400, fetchWidth: 1200 };
const DELAY_MS = 400;

/** Number of photos to fetch per place type */
const PHOTO_COUNT: Record<string, number> = {
  hotel: 5,
  hostel: 5,
  homestay: 5,
  activity: 4,
  landmark: 3,
  restaurant: 3,
  cafe: 3,
  bar: 3,
  wellness: 3,
  tour: 2,
  shop: 2,
  coworking: 2,
};

function photoCountForType(placeType: string): number {
  return PHOTO_COUNT[placeType] ?? 2;
}

/** Query suffix per place type to bias toward exterior/architecture shots (no people) */
const QUERY_HINT: Record<string, string> = {
  hotel: 'exterior building',
  hostel: 'exterior building',
  homestay: 'exterior building',
  restaurant: 'interior food',
  cafe: 'interior',
  bar: 'interior atmosphere',
  landmark: 'landscape view',
  activity: 'scenic landscape',
  wellness: 'interior spa',
  tour: 'scenic landscape',
  shop: 'storefront exterior',
  coworking: 'interior workspace',
};

function queryHintForType(placeType: string): string {
  return QUERY_HINT[placeType] ?? '';
}

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
  const flags: Flags = { dryRun: false, refresh: false, country: null, limit: 2000 };

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
// Main
// ---------------------------------------------------------------------------

interface PlaceRow {
  id: string;
  name: string;
  slug: string;
  place_type: string;
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
      id, name, slug, place_type, google_place_id,
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
    place_type: p.place_type ?? 'activity',
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
    const wantedCount = photoCountForType(place.place_type);
    const label = `[${i + 1}/${toProcess.length}] ${place.name} (${place.city_name}) [${place.place_type}, ${wantedCount} photos]`;

    if (flags.dryRun) {
      const searchQuery = place.google_place_id
        ? `[by ID: ${place.google_place_id}]`
        : `"${place.name} ${place.place_type} ${place.city_name}"`;
      console.log(`  ${label} -> DRY RUN ${searchQuery}`);
      skipped++;
      continue;
    }

    try {
      // 1. Get all photo candidates — prefer google_place_id, fallback to text search
      let candidates: PhotoCandidate[] = [];

      if (place.google_place_id) {
        candidates = await getPlacePhotoRefs(place.google_place_id);
      }

      if (candidates.length === 0) {
        // Better search: include place_type + hint for exterior/landscape bias
        const hint = queryHintForType(place.place_type);
        const searchQuery = `${place.name} ${place.place_type} ${place.city_name} ${hint}`.trim();
        candidates = await fetchPhotoRefs(searchQuery);
      }

      if (candidates.length === 0) {
        // Fallback without hint
        candidates = await fetchPhotoRefs(`${place.name} ${place.place_type} ${place.city_name}`);
      }

      if (candidates.length === 0) {
        // Final fallback: simplest query
        candidates = await fetchPhotoRefs(`${place.name} ${place.city_name}`);
      }

      if (candidates.length === 0) {
        console.log(`  ${label} -> SKIP (no photos found)`);
        skipped++;
        await sleep(DELAY_MS);
        continue;
      }

      // 2. Score and select top N
      const selected = selectBestPhotos(candidates, wantedCount);
      if (selected.length === 0) {
        console.log(`  ${label} -> SKIP (no photos passed quality filter)`);
        skipped++;
        await sleep(DELAY_MS);
        continue;
      }

      // 3. If refreshing, delete existing media first
      if (flags.refresh && place.has_media) {
        await supabase.from('place_media').delete().eq('place_id', place.id);
      }

      // 4. Download, resize, upload, and insert each selected photo
      let primaryUrl: string | null = null;

      for (let idx = 0; idx < selected.length; idx++) {
        const photo = selected[idx];
        const config = idx === 0 ? PRIMARY_CONFIG : SECONDARY_CONFIG;
        const suffix = idx === 0 ? '' : `-${idx + 1}`;
        const storagePath = `places/${place.country_slug}/${slugify(place.name)}-${place.id.slice(0, 8)}${suffix}.jpg`;

        const imageData = await downloadAndResize(photo.photoName, config);
        const imageUrl = await uploadToStorage(storagePath, imageData);

        if (idx === 0) primaryUrl = imageUrl;

        const { error: insertError } = await supabase
          .from('place_media')
          .insert({
            id: randomUUID(),
            place_id: place.id,
            url: imageUrl,
            media_type: 'image',
            caption: photo.attribution ? `Photo by ${photo.attribution}` : null,
            source: 'google',
            order_index: idx,
          });

        if (insertError) throw insertError;
      }

      // 5. Auto-update image_url_cached on places table
      if (primaryUrl) {
        await supabase
          .from('places')
          .update({ image_url_cached: primaryUrl })
          .eq('id', place.id);
      }

      console.log(`  ${label} -> OK (${selected.length} photos)`);
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
