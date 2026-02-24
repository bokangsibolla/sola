/**
 * Enrich city_events hero images using Google Places API (New).
 *
 * Fetches event/festival photos via Google Places Text Search,
 * scores candidates, resizes via Sharp, uploads to Supabase Storage,
 * and updates hero_image_url on the event row.
 *
 * Usage:
 *   npm run enrich:events
 *   npm run enrich:events -- --dry-run
 *   npm run enrich:events -- --refresh
 *   npm run enrich:events -- --country=south-africa
 *   npm run enrich:events -- --city=cape-town
 *   npm run enrich:events -- --limit=10
 *   npm run enrich:events -- --delay=500
 */

import {
  supabase,
  BUCKET,
  searchPlaceWithPhotos,
  selectBestPhotos,
  downloadAndResize,
  uploadToStorage,
  sleep,
  type ResizeConfig,
} from './lib/image-utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_CONFIG: ResizeConfig = { width: 1200, height: 800, fetchWidth: 2400 };

// ---------------------------------------------------------------------------
// CLI flag parsing
// ---------------------------------------------------------------------------

interface CliFlags {
  dryRun: boolean;
  refresh: boolean;
  country: string | null;
  city: string | null;
  limit: number | null;
  delay: number;
}

function parseFlags(): CliFlags {
  const args = process.argv.slice(2);
  const flags: CliFlags = {
    dryRun: false,
    refresh: false,
    country: null,
    city: null,
    limit: null,
    delay: 500,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--refresh') {
      flags.refresh = true;
    } else if (arg.startsWith('--country=')) {
      flags.country = arg.split('=')[1];
    } else if (arg.startsWith('--city=')) {
      flags.city = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (isNaN(val) || val < 1) {
        console.error('Invalid --limit value. Must be a positive integer.');
        process.exit(1);
      }
      flags.limit = val;
    } else if (arg.startsWith('--delay=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (isNaN(val) || val < 0) {
        console.error('Invalid --delay value. Must be a non-negative integer.');
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
  city: string;
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
// Main enrichment
// ---------------------------------------------------------------------------

async function enrichEvents(flags: CliFlags): Promise<EnrichResult[]> {
  // Build query — join cities and countries for search context
  let query = supabase
    .from('city_events')
    .select('id, name, slug, event_type, hero_image_url, cities!inner(name, slug, countries!inner(name, slug))')
    .eq('is_active', true)
    .order('name');

  // Apply filters
  if (flags.city) {
    query = query.eq('cities.slug', flags.city);
  }
  if (flags.country) {
    query = query.eq('cities.countries.slug', flags.country);
  }

  const { data: events, error } = await query;
  if (error) throw error;
  if (!events?.length) {
    console.log('  No events found matching filters.');
    return [];
  }

  // Apply limit
  const toProcess = flags.limit ? events.slice(0, flags.limit) : events;
  const results: EnrichResult[] = [];

  for (let i = 0; i < toProcess.length; i++) {
    const e = toProcess[i] as any;
    const cityName = e.cities?.name ?? '';
    const countryName = e.cities?.countries?.name ?? '';
    const label = `[${i + 1}/${toProcess.length}] ${e.name} (${cityName})`;

    // Skip if already has image (unless --refresh)
    if (e.hero_image_url && !flags.refresh) {
      console.log(`  ${label} -> SKIP (already has image)`);
      results.push({ name: e.name, city: cityName, status: 'skipped' });
      continue;
    }

    // Build search queries with fallbacks
    const queries = [
      `${e.name} ${cityName}`,
      `${e.name} ${countryName}`,
      `${cityName} ${e.event_type}`,
    ];

    if (flags.dryRun) {
      console.log(`  ${label} -> DRY RUN (queries: ${queries.map((q) => `"${q}"`).join(', ')})`);
      results.push({ name: e.name, city: cityName, status: 'skipped', reason: 'dry-run' });
      continue;
    }

    try {
      const searchResult = await searchWithFallbacks(queries);
      if (!searchResult) throw new Error('No place found');

      const best = selectBestPhotos(searchResult.candidates, 1);
      if (best.length === 0) throw new Error('No photos passed quality filter');

      const imageData = await downloadAndResize(best[0].photoName, HERO_CONFIG);
      const storagePath = `events/${e.slug}.jpg`;
      const imageUrl = await uploadToStorage(storagePath, imageData);

      const { error: updateError } = await supabase
        .from('city_events')
        .update({
          hero_image_url: imageUrl,
        })
        .eq('id', e.id);

      if (updateError) throw updateError;

      console.log(`  ${label} -> OK`);
      results.push({ name: e.name, city: cityName, status: 'enriched' });
    } catch (err: any) {
      console.log(`  ${label} -> FAIL: ${err.message}`);
      results.push({ name: e.name, city: cityName, status: 'failed', reason: err.message });
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

  console.log('Enriching event hero images via Google Places API (New)');
  console.log(`  dry-run:  ${flags.dryRun}`);
  console.log(`  refresh:  ${flags.refresh}`);
  console.log(`  country:  ${flags.country ?? 'all'}`);
  console.log(`  city:     ${flags.city ?? 'all'}`);
  console.log(`  limit:    ${flags.limit ?? 'none'}`);
  console.log(`  delay:    ${flags.delay}ms`);
  console.log('');

  // Ensure bucket exists
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  console.log('--- Events ---');
  const results = await enrichEvents(flags);
  console.log('');

  // Summary
  const enriched = results.filter((r) => r.status === 'enriched');
  const skipped = results.filter((r) => r.status === 'skipped');
  const failed = results.filter((r) => r.status === 'failed');

  console.log('========================================');
  console.log(`Total: ${results.length} | Enriched: ${enriched.length} | Skipped: ${skipped.length} | Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed items:');
    for (const f of failed) {
      console.log(`  - ${f.name} (${f.city}): ${f.reason}`);
    }
  }

  console.log('\nDone!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
