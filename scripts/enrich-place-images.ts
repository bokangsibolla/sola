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
 *   restaurant/cafe/bar/hotel/hostel/homestay → 3–5 photos
 *   landmark/activity/wellness                → 3–4 photos
 *   tour/shop/coworking                       → 2 photos
 *
 * Usage:
 *   npm run images:places
 *   npm run images:places -- --dry-run --limit=5 --verbose
 *   npm run images:places -- --type=hostel --limit=3 --verbose
 *   npm run images:places -- --city=bangkok --limit=10
 *   npm run images:places -- --country=south-africa
 *   npm run images:places -- --offset=50 --limit=20
 *   npm run images:places -- --refresh --delay=600
 */

import { randomUUID } from 'crypto';
import {
  supabase,
  BUCKET,
  fetchPhotoRefs,
  getPlacePhotoRefs,
  searchPlaceWithPhotos,
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
const DEFAULT_DELAY_MS = 400;

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
// API cost tracking
// ---------------------------------------------------------------------------

/** Approximate per-request costs (USD) — Google Places API (New) pricing */
const API_COSTS = {
  detailCall: 0.025,     // Place Details (Basic + Photos)
  textSearchCall: 0.032, // Text Search
  photoDownload: 0.007,  // Photo media download
};

interface CostTracker {
  detailCalls: number;
  textSearchCalls: number;
  photoDownloads: number;
}

function formatCost(tracker: CostTracker): string {
  const detailTotal = tracker.detailCalls * API_COSTS.detailCall;
  const searchTotal = tracker.textSearchCalls * API_COSTS.textSearchCall;
  const photoTotal = tracker.photoDownloads * API_COSTS.photoDownload;
  const total = detailTotal + searchTotal + photoTotal;

  return [
    `  Detail calls:      ${tracker.detailCalls.toString().padStart(4)} × $${API_COSTS.detailCall.toFixed(3)}  = $${detailTotal.toFixed(2)}`,
    `  Text search calls: ${tracker.textSearchCalls.toString().padStart(4)} × $${API_COSTS.textSearchCall.toFixed(3)}  = $${searchTotal.toFixed(2)}`,
    `  Photo downloads:   ${tracker.photoDownloads.toString().padStart(4)} × $${API_COSTS.photoDownload.toFixed(3)}  = $${photoTotal.toFixed(2)}`,
    `  ────────────────────────────────────────`,
    `  Estimated total:                          $${total.toFixed(2)}`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

interface Flags {
  dryRun: boolean;
  refresh: boolean;
  country: string | null;
  type: string | null;
  city: string | null;
  offset: number;
  limit: number;
  verbose: boolean;
  delay: number;
}

function parseFlags(): Flags {
  const args = process.argv.slice(2);
  const flags: Flags = {
    dryRun: false,
    refresh: false,
    country: null,
    type: null,
    city: null,
    offset: 0,
    limit: 2000,
    verbose: false,
    delay: DEFAULT_DELAY_MS,
  };

  for (const arg of args) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--refresh') flags.refresh = true;
    else if (arg === '--verbose' || arg === '-v') flags.verbose = true;
    else if (arg.startsWith('--country=')) flags.country = arg.split('=')[1];
    else if (arg.startsWith('--type=')) flags.type = arg.split('=')[1];
    else if (arg.startsWith('--city=')) flags.city = arg.split('=')[1];
    else if (arg.startsWith('--offset=')) flags.offset = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--limit=')) flags.limit = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--delay=')) flags.delay = parseInt(arg.split('=')[1], 10);
    else { console.error(`Unknown flag: ${arg}`); process.exit(1); }
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Verbose logger
// ---------------------------------------------------------------------------

function createLogger(verbose: boolean) {
  return {
    info: (...args: unknown[]) => { if (verbose) console.log('    [v]', ...args); },
  };
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
  has_google_media: boolean;
}

async function main() {
  const flags = parseFlags();
  const log = createLogger(flags.verbose);

  console.log('Enriching place images via Google Places API');
  console.log(`  dry-run:  ${flags.dryRun}`);
  console.log(`  refresh:  ${flags.refresh}`);
  console.log(`  country:  ${flags.country ?? 'all'}`);
  console.log(`  type:     ${flags.type ?? 'all'}`);
  console.log(`  city:     ${flags.city ?? 'all'}`);
  console.log(`  offset:   ${flags.offset}`);
  console.log(`  limit:    ${flags.limit}`);
  console.log(`  delay:    ${flags.delay}ms`);
  console.log(`  verbose:  ${flags.verbose}`);
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
    .order('curation_score', { ascending: false, nullsFirst: false });

  if (flags.country) {
    query = query.eq('cities.countries.slug', flags.country);
  }

  if (flags.type) {
    query = query.eq('place_type', flags.type);
  }

  // Fetch more than needed so we can apply city filter + offset client-side
  // (Supabase doesn't support ilike on joined tables easily)
  query = query.limit(flags.offset + flags.limit + 500);

  const { data: rawPlaces, error: placesError } = await query;
  if (placesError) throw placesError;
  if (!rawPlaces?.length) {
    console.log('No places found.');
    return;
  }

  // Client-side city filter (partial match, case-insensitive)
  let filteredPlaces = rawPlaces;
  if (flags.city) {
    const cityLower = flags.city.toLowerCase();
    filteredPlaces = rawPlaces.filter((p: any) => {
      const cityName: string = (p.cities as any)?.name ?? '';
      return cityName.toLowerCase().includes(cityLower);
    });
  }

  // Apply offset + limit
  filteredPlaces = filteredPlaces.slice(flags.offset, flags.offset + flags.limit);

  if (!filteredPlaces.length) {
    console.log('No places found after filtering.');
    return;
  }

  // Get existing google-sourced media to know which places already have images
  const placeIds = filteredPlaces.map((p: any) => p.id);
  const BATCH_SIZE = 100;
  const allExistingMedia: { place_id: string }[] = [];
  for (let i = 0; i < placeIds.length; i += BATCH_SIZE) {
    const batch = placeIds.slice(i, i + BATCH_SIZE);
    const { data: batchMedia } = await supabase
      .from('place_media')
      .select('place_id')
      .eq('source', 'google')
      .in('place_id', batch);
    if (batchMedia) allExistingMedia.push(...batchMedia);
  }

  const placesWithGoogleMedia = new Set(allExistingMedia.map((m) => m.place_id));

  const places: PlaceRow[] = filteredPlaces.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    place_type: p.place_type ?? 'activity',
    google_place_id: p.google_place_id,
    city_name: (p.cities as any)?.name ?? '',
    country_slug: (p.cities as any)?.countries?.slug ?? '',
    has_google_media: placesWithGoogleMedia.has(p.id),
  }));

  // Filter to only places that need google images (unless --refresh)
  const toProcess = flags.refresh
    ? places
    : places.filter((p) => !p.has_google_media);

  console.log(`Found ${places.length} places total, ${toProcess.length} need images.\n`);

  if (toProcess.length === 0) return;

  let enriched = 0;
  let skipped = 0;
  let failed = 0;
  let backfilledIds = 0;

  const costs: CostTracker = { detailCalls: 0, textSearchCalls: 0, photoDownloads: 0 };

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
      let discoveredPlaceId: string | null = null;

      if (place.google_place_id) {
        log.info(`Fetching by google_place_id: ${place.google_place_id}`);
        try {
          candidates = await getPlacePhotoRefs(place.google_place_id);
          costs.detailCalls++;
          log.info(`Got ${candidates.length} candidates from Place Details`);
        } catch (detailErr: any) {
          log.info(`Place Details failed (stale ID?): ${detailErr.message.slice(0, 120)}`);
          // Fall through to text search below
        }
      }

      if (candidates.length === 0) {
        // Use searchPlaceWithPhotos to get placeId + candidates in one call
        const hint = queryHintForType(place.place_type);
        const searchQuery = `${place.name} ${place.place_type} ${place.city_name} ${hint}`.trim();
        log.info(`Text search: "${searchQuery}"`);

        const result = await searchPlaceWithPhotos(searchQuery);
        costs.textSearchCalls++;

        if (result) {
          candidates = result.candidates;
          discoveredPlaceId = result.placeId;
          log.info(`Got ${candidates.length} candidates, placeId: ${result.placeId}`);
        }
      }

      if (candidates.length === 0) {
        // Fallback without hint
        const fallbackQuery = `${place.name} ${place.place_type} ${place.city_name}`;
        log.info(`Fallback search: "${fallbackQuery}"`);

        const result = await searchPlaceWithPhotos(fallbackQuery);
        costs.textSearchCalls++;

        if (result) {
          candidates = result.candidates;
          discoveredPlaceId = discoveredPlaceId ?? result.placeId;
          log.info(`Fallback got ${candidates.length} candidates`);
        }
      }

      if (candidates.length === 0) {
        // Final fallback: simplest query
        const simpleQuery = `${place.name} ${place.city_name}`;
        log.info(`Simple fallback: "${simpleQuery}"`);

        const result = await searchPlaceWithPhotos(simpleQuery);
        costs.textSearchCalls++;

        if (result) {
          candidates = result.candidates;
          discoveredPlaceId = discoveredPlaceId ?? result.placeId;
          log.info(`Simple fallback got ${candidates.length} candidates`);
        }
      }

      if (candidates.length === 0) {
        console.log(`  ${label} -> SKIP (no photos found)`);
        skipped++;
        await sleep(flags.delay);
        continue;
      }

      // Backfill google_place_id if we discovered one via text search
      if (!place.google_place_id && discoveredPlaceId) {
        log.info(`Backfilling google_place_id: ${discoveredPlaceId}`);
        const { error: updateErr } = await supabase
          .from('places')
          .update({ google_place_id: discoveredPlaceId })
          .eq('id', place.id);
        if (updateErr) {
          log.info(`Failed to backfill google_place_id: ${updateErr.message}`);
        } else {
          backfilledIds++;
        }
      }

      // 2. Score and select top N
      const selected = selectBestPhotos(candidates, wantedCount);
      log.info(`Selected ${selected.length}/${candidates.length} photos after scoring`);

      if (selected.length === 0) {
        console.log(`  ${label} -> SKIP (no photos passed quality filter)`);
        skipped++;
        await sleep(flags.delay);
        continue;
      }

      // 3. If refreshing, delete only google-sourced media
      if (flags.refresh && place.has_google_media) {
        log.info('Deleting existing google-sourced media for refresh');
        await supabase
          .from('place_media')
          .delete()
          .eq('place_id', place.id)
          .eq('source', 'google');
      }

      // 4. Download, resize, upload, and insert each selected photo
      let primaryUrl: string | null = null;

      for (let idx = 0; idx < selected.length; idx++) {
        const photo = selected[idx];
        const config = idx === 0 ? PRIMARY_CONFIG : SECONDARY_CONFIG;
        const suffix = idx === 0 ? '' : `-${idx + 1}`;
        const storagePath = `places/${place.country_slug}/${slugify(place.name)}-${place.id.slice(0, 8)}${suffix}.jpg`;

        log.info(`Downloading photo ${idx + 1}/${selected.length}: ${photo.photoName.slice(0, 60)}...`);
        const imageData = await downloadAndResize(photo.photoName, config);
        costs.photoDownloads++;

        log.info(`Uploading to ${storagePath}`);
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

    await sleep(flags.delay);
  }

  // Summary
  console.log('\n========================================');
  console.log(`Total: ${toProcess.length} | Enriched: ${enriched} | Skipped: ${skipped} | Failed: ${failed}`);
  if (backfilledIds > 0) {
    console.log(`Backfilled google_place_id: ${backfilledIds}`);
  }
  console.log('');
  console.log('Estimated API costs:');
  console.log(formatCost(costs));
  console.log('========================================');
  console.log('Done!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
