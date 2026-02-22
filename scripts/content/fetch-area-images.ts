/**
 * @deprecated Use `npx tsx scripts/enrich-images.ts --only=areas` instead.
 *
 * This script uses the legacy Maps API and stores expiring Google photo URLs
 * directly in the DB. The new enrich-images.ts downloads, resizes with Sharp,
 * and uploads to Supabase Storage for permanent URLs.
 *
 * Fetch hero images for city_areas using Google Places API.
 *
 * Usage (old):
 *   npx tsx scripts/content/fetch-area-images.ts
 *
 * Usage (new):
 *   npx tsx scripts/enrich-images.ts --only=areas
 *   npx tsx scripts/enrich-images.ts --only=areas --refresh
 *
 * Requires:
 *   GOOGLE_PLACES_API_KEY in .env
 *   EXPO_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars. Need GOOGLE_PLACES_API_KEY, EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AreaRow {
  id: string;
  name: string;
  hero_image_url: string | null;
  city_name: string;
}

async function fetchAreas(): Promise<AreaRow[]> {
  const { data, error } = await supabase
    .from('city_areas')
    .select('id, name, hero_image_url, cities(name)')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    hero_image_url: row.hero_image_url,
    city_name: row.cities?.name ?? '',
  }));
}

async function searchPlace(query: string): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK' || !json.results?.length) {
    return null;
  }

  const result = json.results[0];
  if (!result.photos?.length) return null;

  return result.photos[0].photo_reference;
}

function photoUrl(photoRef: string): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_KEY}`;
}

async function updateArea(id: string, imageUrl: string) {
  const { error } = await supabase
    .from('city_areas')
    .update({ hero_image_url: imageUrl })
    .eq('id', id);

  if (error) throw error;
}

async function main() {
  console.log('Fetching city areas...');
  const areas = await fetchAreas();

  const needImages = areas.filter((a) => !a.hero_image_url);
  console.log(`Found ${areas.length} areas total, ${needImages.length} need images.\n`);

  let success = 0;
  let failed = 0;

  for (const area of needImages) {
    const query = `${area.name} neighborhood, ${area.city_name}`;
    process.stdout.write(`  ${area.name} (${area.city_name})... `);

    try {
      const photoRef = await searchPlace(query);
      if (!photoRef) {
        console.log('NO PHOTO FOUND');
        failed++;
        continue;
      }

      const url = photoUrl(photoRef);
      await updateArea(area.id, url);
      console.log('OK');
      success++;
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }

    // Rate limiting: 100ms between requests
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.`);
}

main().catch(console.error);
