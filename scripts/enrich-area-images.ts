/**
 * Area Image Enrichment
 *
 * Finds areas with missing or duplicate hero images, fetches unique
 * photos via Google Places Text Search API, downloads/resizes them,
 * uploads to Supabase Storage, and updates hero_image_url.
 *
 * Usage:
 *   npx tsx scripts/enrich-area-images.ts [--dry-run] [--city <slug>] [--delay <ms>]
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
  fetchPhotoRefs,
  selectBestPhotos,
  downloadAndResize,
  uploadToStorage,
  sleep,
  slugify,
  type PhotoCandidate,
} from './lib/image-utils';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DELAY = parseInt(args[args.indexOf('--delay') + 1] || '1500', 10);
const CITY_FILTER = args.includes('--city') ? args[args.indexOf('--city') + 1] : null;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const RESIZE = { width: 800, height: 500, quality: 82 };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AreaRow {
  id: string;
  name: string;
  slug: string;
  hero_image_url: string | null;
  city_name: string;
  city_slug: string;
  country_name: string;
  area_kind: string;
}

// ---------------------------------------------------------------------------
// Find areas needing images
// ---------------------------------------------------------------------------

async function getAreasNeedingImages(): Promise<AreaRow[]> {
  // 1. Get all active areas with city/country context
  const { data: areas, error } = await db
    .from('city_areas')
    .select(`
      id, name, slug, hero_image_url, area_kind,
      cities!inner(name, slug, countries!inner(name))
    `)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  if (!areas) return [];

  const allAreas: AreaRow[] = areas.map((a: any) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    hero_image_url: a.hero_image_url,
    city_name: a.cities.name,
    city_slug: a.cities.slug,
    country_name: a.cities.countries.name,
    area_kind: a.area_kind,
  }));

  // 2. Filter by city if specified
  const filtered = CITY_FILTER
    ? allAreas.filter((a) => a.city_slug === CITY_FILTER)
    : allAreas;

  // 3. Find duplicate images (URLs used by multiple areas)
  const urlCounts = new Map<string, number>();
  for (const a of allAreas) {
    if (a.hero_image_url) {
      urlCounts.set(a.hero_image_url, (urlCounts.get(a.hero_image_url) ?? 0) + 1);
    }
  }
  const duplicateUrls = new Set(
    Array.from(urlCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([url]) => url),
  );

  // 4. Return areas that need new images:
  //    - no image at all
  //    - duplicate image (shared with another area)
  return filtered.filter(
    (a) => !a.hero_image_url || duplicateUrls.has(a.hero_image_url),
  );
}

// ---------------------------------------------------------------------------
// Search queries for an area
// ---------------------------------------------------------------------------

function buildQueries(area: AreaRow): string[] {
  const { name, city_name, country_name, area_kind } = area;

  // Different query strategies depending on area type
  const queries: string[] = [];

  if (area_kind === 'beach') {
    queries.push(`${name} beach ${city_name} ${country_name}`);
    queries.push(`${name} ${city_name} coastline`);
  } else if (area_kind === 'island') {
    queries.push(`${name} island ${country_name}`);
    queries.push(`${name} ${city_name} aerial`);
  } else {
    // neighborhood / district
    queries.push(`${name} neighborhood ${city_name} ${country_name}`);
    queries.push(`${name} ${city_name} street`);
  }

  return queries;
}

// ---------------------------------------------------------------------------
// Process one area
// ---------------------------------------------------------------------------

async function processArea(area: AreaRow): Promise<boolean> {
  const queries = buildQueries(area);
  let bestPhoto: PhotoCandidate | null = null;

  for (const query of queries) {
    try {
      const candidates = await fetchPhotoRefs(query);
      const best = selectBestPhotos(candidates, 1);
      if (best.length > 0) {
        bestPhoto = best[0];
        break;
      }
    } catch (err: any) {
      console.warn(`    Query "${query}" failed: ${err.message}`);
    }
    await sleep(500);
  }

  if (!bestPhoto) {
    console.log(`    No photo found for ${area.name} (${area.city_name})`);
    return false;
  }

  if (DRY_RUN) {
    console.log(`    [DRY RUN] Would download ${bestPhoto.photoName} (${bestPhoto.widthPx}x${bestPhoto.heightPx})`);
    return true;
  }

  // Download, resize, upload
  const buffer = await downloadAndResize(bestPhoto.photoName, RESIZE);
  const storagePath = `areas/${area.city_slug}-${slugify(area.name)}.jpg`;
  const publicUrl = await uploadToStorage(storagePath, buffer);

  // Update DB
  const { error } = await db
    .from('city_areas')
    .update({ hero_image_url: publicUrl })
    .eq('id', area.id);

  if (error) throw error;

  console.log(`    Uploaded: ${storagePath}`);
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Area Image Enrichment');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (CITY_FILTER) console.log(`City filter: ${CITY_FILTER}`);
  console.log('');

  const areas = await getAreasNeedingImages();
  console.log(`Found ${areas.length} areas needing images\n`);

  if (areas.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    console.log(`[${i + 1}/${areas.length}] ${area.name} (${area.city_name}, ${area.country_name})`);

    try {
      const ok = await processArea(area);
      if (ok) success++;
      else failed++;
    } catch (err: any) {
      console.error(`    ERROR: ${err.message}`);
      failed++;
    }

    if (i < areas.length - 1) {
      await sleep(DELAY);
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
