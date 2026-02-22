/**
 * Sola Image Acquisition Pipeline
 *
 * Finds hero-quality images for countries, cities, and neighborhoods
 * using Google Places API, Custom Search API, and Knowledge Graph API.
 *
 * Usage:
 *   npx tsx scripts/image-pipeline/index.ts --type=country --limit=5
 *   npx tsx scripts/image-pipeline/index.ts --type=city --limit=10 --verbose
 *   npx tsx scripts/image-pipeline/index.ts --type=neighborhood --city=bangkok
 *   npx tsx scripts/image-pipeline/index.ts --type=all --dry-run --review-csv
 *   npx tsx scripts/image-pipeline/index.ts --type=country --skip-custom-search
 *   npx tsx scripts/image-pipeline/index.ts --type=city --country=thailand --refresh
 *
 * npm script shortcut:
 *   npm run images:sync -- --type=city --limit=50
 */

import 'dotenv/config';
import sharp from 'sharp';
import {
  supabase,
  BUCKET,
  downloadAndResize,
  uploadToStorage,
  sleep,
  slugify,
  type ResizeConfig,
} from '../lib/image-utils';
import { executeStrategy, type StrategyOptions } from './strategies';
import { getCached, setCache } from './cache';
import { exportReviewCsv } from './csv-export';
import type {
  Destination,
  DestinationType,
  PipelineFlags,
  PipelineResult,
  ImageCandidate,
  UsageRightsStatus,
} from './types';
import type { CustomSearchOptions } from './custom-search';
import type { KGSearchOptions } from './knowledge-graph';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY ?? GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY is required in .env');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Resize configs
// ---------------------------------------------------------------------------

const HERO_RESIZE: ResizeConfig = { width: 1200, height: 800, quality: 85, fetchWidth: 4800 };
const AREA_RESIZE: ResizeConfig = { width: 1000, height: 667, quality: 80, fetchWidth: 2000 };
const GALLERY_RESIZE: ResizeConfig = { width: 800, height: 600, quality: 80, fetchWidth: 1600 };

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseFlags(): PipelineFlags {
  const args = process.argv.slice(2);
  const flags: PipelineFlags = {
    type: 'all',
    limit: 50,
    offset: 0,
    dryRun: false,
    refresh: false,
    reviewCsv: false,
    delay: 500,
    qualityThreshold: 55,
    skipCustomSearch: false,
    verbose: false,
  };

  for (const arg of args) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--refresh') flags.refresh = true;
    else if (arg === '--review-csv') flags.reviewCsv = true;
    else if (arg === '--verbose' || arg === '-v') flags.verbose = true;
    else if (arg === '--skip-custom-search') flags.skipCustomSearch = true;
    else if (arg.startsWith('--type=')) {
      const v = arg.split('=')[1];
      if (['country', 'city', 'neighborhood', 'all'].includes(v)) {
        flags.type = v as DestinationType | 'all';
      } else {
        console.error(`Invalid --type: ${v}. Use country, city, neighborhood, or all.`);
        process.exit(1);
      }
    }
    else if (arg.startsWith('--limit=')) flags.limit = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--offset=')) flags.offset = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--delay=')) flags.delay = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--threshold=')) flags.qualityThreshold = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--country=')) flags.country = arg.split('=')[1];
    else if (arg.startsWith('--city=')) flags.city = arg.split('=')[1];
    else {
      console.error(`Unknown flag: ${arg}`);
      console.error('');
      console.error('Usage: npx tsx scripts/image-pipeline/index.ts [flags]');
      console.error('');
      console.error('Flags:');
      console.error('  --type=country|city|neighborhood|all  Destination type (default: all)');
      console.error('  --limit=N                             Max destinations to process (default: 50)');
      console.error('  --offset=N                            Skip first N destinations (default: 0)');
      console.error('  --country=NAME                        Filter by country name');
      console.error('  --city=NAME                           Filter by city name');
      console.error('  --dry-run                             Show what would be done without doing it');
      console.error('  --refresh                             Re-process even if already cached');
      console.error('  --review-csv                          Export results to CSV for manual review');
      console.error('  --skip-custom-search                  Use only Google Places API');
      console.error('  --threshold=N                         Quality threshold for CSE fallback (default: 55)');
      console.error('  --delay=MS                            Delay between API calls (default: 500)');
      console.error('  --verbose / -v                        Show detailed API logs');
      process.exit(1);
    }
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Fetch destinations from Supabase
// ---------------------------------------------------------------------------

async function fetchDestinations(flags: PipelineFlags): Promise<Destination[]> {
  const destinations: Destination[] = [];

  if (flags.type === 'country' || flags.type === 'all') {
    let query = supabase
      .from('countries')
      .select('id, slug, name, google_place_id, hero_image_url, image_cached_at')
      .eq('is_active', true)
      .order('order_index');

    if (flags.country) {
      query = query.ilike('name', `%${flags.country}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    for (const row of data ?? []) {
      destinations.push({
        id: row.id,
        type: 'country',
        name: row.name,
        slug: row.slug,
        googlePlaceId: row.google_place_id ?? undefined,
        heroImageUrl: row.hero_image_url ?? undefined,
        imageCachedAt: row.image_cached_at ?? undefined,
      });
    }
  }

  if (flags.type === 'city' || flags.type === 'all') {
    let query = supabase
      .from('cities')
      .select('id, slug, name, google_place_id, hero_image_url, image_cached_at, countries(name)')
      .eq('is_active', true)
      .order('order_index');

    if (flags.city) {
      query = query.ilike('name', `%${flags.city}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    for (const row of (data ?? []) as any[]) {
      const countryName = row.countries?.name;
      if (flags.country && countryName && !countryName.toLowerCase().includes(flags.country.toLowerCase())) {
        continue;
      }
      destinations.push({
        id: row.id,
        type: 'city',
        name: row.name,
        slug: row.slug,
        countryName,
        googlePlaceId: row.google_place_id ?? undefined,
        heroImageUrl: row.hero_image_url ?? undefined,
        imageCachedAt: row.image_cached_at ?? undefined,
      });
    }
  }

  if (flags.type === 'neighborhood' || flags.type === 'all') {
    const query = supabase
      .from('city_areas')
      .select('id, slug, name, hero_image_url, cities(name, slug, countries(name))')
      .eq('is_active', true)
      .order('name');

    const { data, error } = await query;
    if (error) throw error;

    for (const row of (data ?? []) as any[]) {
      const cityName = row.cities?.name;
      const citySlug = row.cities?.slug;
      const countryName = row.cities?.countries?.name;
      if (flags.city && cityName && !cityName.toLowerCase().includes(flags.city.toLowerCase())) {
        continue;
      }
      if (flags.country && countryName && !countryName.toLowerCase().includes(flags.country.toLowerCase())) {
        continue;
      }
      destinations.push({
        id: row.id,
        type: 'neighborhood',
        name: row.name,
        slug: row.slug ?? slugify(row.name),
        cityName,
        citySlug,
        countryName,
        heroImageUrl: row.hero_image_url ?? undefined,
      });
    }
  }

  return destinations.slice(flags.offset, flags.offset + flags.limit);
}

// ---------------------------------------------------------------------------
// Storage paths
// ---------------------------------------------------------------------------

function getStoragePath(dest: Destination): string {
  switch (dest.type) {
    case 'country':
      return `countries/${dest.slug}.jpg`;
    case 'city':
      return `cities/${dest.slug}.jpg`;
    case 'neighborhood':
      return `areas/${dest.citySlug ?? 'unknown'}-${dest.slug}.jpg`;
  }
}

function getGalleryStoragePath(dest: Destination, index: number): string {
  switch (dest.type) {
    case 'country':
      return `countries/${dest.slug}-gallery-${index}.jpg`;
    case 'city':
      return `cities/${dest.slug}-gallery-${index}.jpg`;
    case 'neighborhood':
      return `areas/${dest.citySlug ?? 'unknown'}-${dest.slug}-gallery-${index}.jpg`;
  }
}

// ---------------------------------------------------------------------------
// Download external image (for Custom Search URLs)
// ---------------------------------------------------------------------------

async function downloadExternalAndResize(
  imageUrl: string,
  config: ResizeConfig,
): Promise<Buffer> {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Sola-ImagePipeline/1.0' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${imageUrl}`);
  }

  const raw = Buffer.from(await res.arrayBuffer());
  return sharp(raw)
    .resize(config.width, config.height, { fit: 'cover' })
    .jpeg({ quality: config.quality ?? 80 })
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Database update
// ---------------------------------------------------------------------------

interface DbUpdate {
  heroUrl: string;
  galleryUrls: string[];
  imageSource: string;
  attribution: string | null;
  licenseHint: string;
  qualityScore: number;
  usageRights: UsageRightsStatus;
  placeId?: string;
  canonicalQuery?: string;
}

async function updateDatabase(dest: Destination, update: DbUpdate): Promise<void> {
  const table =
    dest.type === 'country' ? 'countries' :
    dest.type === 'city' ? 'cities' :
    'city_areas';

  const baseUpdate: Record<string, any> = {
    hero_image_url: update.heroUrl,
    image_cached_at: new Date().toISOString(),
  };

  if (dest.type !== 'neighborhood') {
    // Countries and cities have the full set of image columns
    Object.assign(baseUpdate, {
      image_source: update.imageSource === 'places_photos' ? 'google' : 'custom_search',
      image_attribution: update.attribution,
      image_gallery_urls: update.galleryUrls,
      image_quality_score: update.qualityScore,
      image_license_hint: update.licenseHint,
      usage_rights_status: update.usageRights,
    });
    if (update.placeId) baseUpdate.google_place_id = update.placeId;
    if (update.canonicalQuery) baseUpdate.canonical_query = update.canonicalQuery;
  } else {
    // Neighborhoods have a lighter schema
    Object.assign(baseUpdate, {
      image_source: update.imageSource === 'places_photos' ? 'google' : 'custom_search',
      image_attribution: update.attribution,
    });
  }

  const { error } = await supabase.from(table).update(baseUpdate).eq('id', dest.id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Process a single destination
// ---------------------------------------------------------------------------

async function processDestination(
  dest: Destination,
  flags: PipelineFlags,
  strategyOpts: StrategyOptions,
): Promise<PipelineResult> {
  // Skip if already cached in DB
  if (!flags.refresh && dest.imageCachedAt) {
    return {
      destinationId: dest.id,
      destinationType: dest.type,
      name: dest.name,
      heroImage: null,
      galleryImages: [],
      imageSource: 'places_photos',
      status: 'skipped',
      reason: 'Already cached in DB (use --refresh to override)',
    };
  }

  // Check file cache
  if (!flags.refresh) {
    const cached = getCached(dest.id);
    if (cached) {
      return {
        destinationId: dest.id,
        destinationType: dest.type,
        name: dest.name,
        heroImage: cached.hero,
        galleryImages: cached.gallery,
        imageSource: cached.hero?.source ?? 'places_photos',
        canonicalQuery: cached.canonicalQuery,
        status: 'skipped',
        reason: 'Cached from previous run',
      };
    }
  }

  // Dry run
  if (flags.dryRun) {
    return {
      destinationId: dest.id,
      destinationType: dest.type,
      name: dest.name,
      heroImage: null,
      galleryImages: [],
      imageSource: 'places_photos',
      status: 'skipped',
      reason: 'Dry run',
    };
  }

  // Execute strategy
  try {
    const result = await executeStrategy(dest, strategyOpts);
    setCache(dest.id, result);

    if (!result.hero) {
      return {
        destinationId: dest.id,
        destinationType: dest.type,
        name: dest.name,
        heroImage: null,
        galleryImages: [],
        imageSource: 'places_photos',
        status: 'failed',
        reason: `No viable images found (${result.allCandidates.length} candidates evaluated)`,
      };
    }

    // Download and upload hero image
    const resizeConfig = dest.type === 'neighborhood' ? AREA_RESIZE : HERO_RESIZE;
    let heroUrl: string;

    if (result.hero.source === 'places_photos') {
      const imageData = await downloadAndResize(result.hero.url, resizeConfig);
      const storagePath = getStoragePath(dest);
      heroUrl = await uploadToStorage(storagePath, imageData);
    } else {
      // Custom Search: download external image, resize, and re-host
      try {
        const imageData = await downloadExternalAndResize(result.hero.url, resizeConfig);
        const storagePath = getStoragePath(dest);
        heroUrl = await uploadToStorage(storagePath, imageData);
      } catch (err: any) {
        if (flags.verbose) console.log(`      Hero download failed (${err.message}), using URL directly`);
        heroUrl = result.hero.url;
      }
    }

    // Download and upload gallery images
    const galleryUrls: string[] = [];
    for (let i = 0; i < result.gallery.length; i++) {
      const g = result.gallery[i];
      try {
        let galData: Buffer;
        if (g.source === 'places_photos') {
          galData = await downloadAndResize(g.url, GALLERY_RESIZE);
        } else {
          galData = await downloadExternalAndResize(g.url, GALLERY_RESIZE);
        }
        const galPath = getGalleryStoragePath(dest, i);
        const galUrl = await uploadToStorage(galPath, galData);
        galleryUrls.push(galUrl);
      } catch (err: any) {
        if (flags.verbose) console.log(`      Gallery[${i}] download failed: ${err.message}`);
        // Fall back to the direct URL for CSE images
        if (g.source === 'custom_search') {
          galleryUrls.push(g.url);
        }
      }
      await sleep(100);
    }

    // Determine usage rights
    const usageRights: UsageRightsStatus =
      result.hero.source === 'places_photos' ? 'ok_internal_testing' : 'needs_review';

    // Update DB
    await updateDatabase(dest, {
      heroUrl,
      galleryUrls,
      imageSource: result.hero.source,
      attribution: result.hero.attribution ?? null,
      licenseHint: result.hero.licenseHint,
      qualityScore: result.hero.qualityScore,
      usageRights,
      placeId: result.placesPlaceId,
      canonicalQuery: result.canonicalQuery,
    });

    return {
      destinationId: dest.id,
      destinationType: dest.type,
      name: dest.name,
      heroImage: { ...result.hero, url: heroUrl },
      galleryImages: result.gallery.map((g, i) => ({
        ...g,
        url: galleryUrls[i] ?? g.url,
      })),
      imageSource: result.hero.source,
      canonicalQuery: result.canonicalQuery,
      status: 'enriched',
    };
  } catch (err: any) {
    return {
      destinationId: dest.id,
      destinationType: dest.type,
      name: dest.name,
      heroImage: null,
      galleryImages: [],
      imageSource: 'places_photos',
      status: 'failed',
      reason: err.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const flags = parseFlags();

  console.log('=== Sola Image Acquisition Pipeline ===');
  console.log(`  type:              ${flags.type}`);
  console.log(`  limit:             ${flags.limit}`);
  console.log(`  offset:            ${flags.offset}`);
  console.log(`  dry-run:           ${flags.dryRun}`);
  console.log(`  refresh:           ${flags.refresh}`);
  console.log(`  quality threshold: ${flags.qualityThreshold}`);
  console.log(`  skip CSE:          ${flags.skipCustomSearch}`);
  console.log(`  CSE available:     ${!!(GOOGLE_CSE_ID && GOOGLE_CSE_API_KEY)}`);
  console.log(`  verbose:           ${flags.verbose}`);
  console.log(`  delay:             ${flags.delay}ms`);
  if (flags.country) console.log(`  filter country:    ${flags.country}`);
  if (flags.city) console.log(`  filter city:       ${flags.city}`);
  console.log('');

  if (!GOOGLE_CSE_ID && !flags.skipCustomSearch) {
    console.log('  NOTE: GOOGLE_CSE_ID not set. Custom Search disabled — using Places API only.');
    console.log('  Set GOOGLE_CSE_ID and GOOGLE_CSE_API_KEY in .env to enable editorial image search.');
    console.log('');
  }

  // Ensure storage bucket
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // Build strategy options
  const cseOpts: CustomSearchOptions | undefined =
    GOOGLE_CSE_ID && GOOGLE_CSE_API_KEY && !flags.skipCustomSearch
      ? { apiKey: GOOGLE_CSE_API_KEY, cseId: GOOGLE_CSE_ID }
      : undefined;

  const kgOpts: KGSearchOptions | undefined = GOOGLE_API_KEY
    ? { apiKey: GOOGLE_API_KEY }
    : undefined;

  const strategyOpts: StrategyOptions = {
    cseOpts,
    kgOpts,
    qualityThreshold: flags.qualityThreshold,
    skipCustomSearch: flags.skipCustomSearch || !cseOpts,
    delayMs: flags.delay,
    verbose: flags.verbose,
  };

  // Fetch destinations
  console.log('Fetching destinations from Supabase...');
  const destinations = await fetchDestinations(flags);
  console.log(`  Found ${destinations.length} destinations to process`);
  console.log('');

  if (destinations.length === 0) {
    console.log('Nothing to process. Check your filters.');
    return;
  }

  // Process each destination
  const results: PipelineResult[] = [];

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];
    const label = `[${i + 1}/${destinations.length}] ${dest.type}: ${dest.name}`;

    console.log(label);

    const result = await processDestination(dest, flags, strategyOpts);
    results.push(result);

    if (result.status === 'enriched') {
      const score = result.heroImage?.qualityScore ?? 0;
      const source = result.heroImage?.source ?? '?';
      const gallery = result.galleryImages.length;
      console.log(`  -> ENRICHED (hero: ${source}, score: ${score}, gallery: ${gallery})`);
    } else if (result.status === 'skipped') {
      console.log(`  -> SKIP: ${result.reason}`);
    } else {
      console.log(`  -> FAIL: ${result.reason}`);
    }

    await sleep(flags.delay);
  }

  // Summary
  console.log('');
  console.log('========================================');
  const enriched = results.filter((r) => r.status === 'enriched');
  const skipped = results.filter((r) => r.status === 'skipped');
  const failed = results.filter((r) => r.status === 'failed');

  console.log(`Total: ${results.length} | Enriched: ${enriched.length} | Skipped: ${skipped.length} | Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    for (const f of failed) {
      console.log(`  - ${f.name}: ${f.reason}`);
    }
  }

  // CSV export
  if (flags.reviewCsv) {
    const csvPath = exportReviewCsv(results);
    console.log(`\nReview CSV exported: ${csvPath}`);
  }

  // Sample JSON output
  if (flags.verbose && enriched.length > 0) {
    console.log('\nSample result (first enriched):');
    console.log(JSON.stringify(enriched[0], null, 2));
  }

  console.log('\nDone!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
