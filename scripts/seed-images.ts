/**
 * Seed images for countries, cities, and places.
 *
 * Fetches landscape photos from Pexels (primary) or Unsplash (fallback),
 * resizes to 800×600 JPEG via sharp, uploads to Supabase Storage `images/` bucket,
 * and updates the corresponding DB rows.
 *
 * Prerequisites:
 *   1. Create a public `images` bucket in Supabase Dashboard
 *   2. Add PEXELS_API_KEY and UNSPLASH_ACCESS_KEY to .env
 *
 * Run: npm run seed:images
 */

import 'dotenv/config';
import sharp from 'sharp';
import { supabase } from './seed-utils';

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!PEXELS_KEY && !UNSPLASH_KEY) {
  console.error('At least one of PEXELS_API_KEY or UNSPLASH_ACCESS_KEY is required in .env');
  process.exit(1);
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const BUCKET = 'images';
const DELAY_MS = 400;
const WIDTH = 800;
const HEIGHT = 600;
const QUALITY = 80;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

function isSupabaseUrl(url: string | null | undefined): boolean {
  return !!url && url.includes(SUPABASE_URL) && url.includes(`/${BUCKET}/`);
}

// ---------------------------------------------------------------------------
// Image fetching
// ---------------------------------------------------------------------------

async function searchPexels(query: string): Promise<string | null> {
  if (!PEXELS_KEY) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: PEXELS_KEY } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.photos?.[0]?.src?.large2x ?? json.photos?.[0]?.src?.large ?? null;
  } catch {
    return null;
  }
}

async function searchUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

async function fetchImageUrl(query: string): Promise<string | null> {
  return (await searchPexels(query)) ?? (await searchUnsplash(query));
}

async function downloadAndResize(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return sharp(buf).resize(WIDTH, HEIGHT, { fit: 'cover' }).jpeg({ quality: QUALITY }).toBuffer();
}

async function uploadToStorage(path: string, data: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return publicUrl(path);
}

// ---------------------------------------------------------------------------
// Entity processors
// ---------------------------------------------------------------------------

interface SeedResult {
  name: string;
  ok: boolean;
  reason?: string;
}

async function seedCountries(): Promise<SeedResult[]> {
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, slug, name, hero_image_url')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  if (!countries?.length) return [];

  const results: SeedResult[] = [];
  for (let i = 0; i < countries.length; i++) {
    const c = countries[i];
    const label = `[${i + 1}/${countries.length}] country: ${c.name}`;

    if (isSupabaseUrl(c.hero_image_url)) {
      console.log(`${label} -> SKIP (already seeded)`);
      results.push({ name: c.name, ok: true });
      continue;
    }

    try {
      const query = `${c.name} travel landscape`;
      const srcUrl = await fetchImageUrl(query);
      if (!srcUrl) throw new Error('No image found');

      const buf = await downloadAndResize(srcUrl);
      const storagePath = `countries/${c.slug}.jpg`;
      const url = await uploadToStorage(storagePath, buf);

      await supabase.from('countries').update({ hero_image_url: url }).eq('id', c.id);

      // Also update geo_content if it exists
      await supabase
        .from('geo_content')
        .update({ hero_image_url: url })
        .eq('scope', 'country')
        .eq('country_id', c.id);

      console.log(`${label} -> OK`);
      results.push({ name: c.name, ok: true });
    } catch (err: any) {
      console.log(`${label} -> FAIL: ${err.message}`);
      results.push({ name: c.name, ok: false, reason: err.message });
    }

    await sleep(DELAY_MS);
  }
  return results;
}

async function seedCities(): Promise<SeedResult[]> {
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, slug, name, country_id, hero_image_url, countries(name)')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  if (!cities?.length) return [];

  const results: SeedResult[] = [];
  for (let i = 0; i < cities.length; i++) {
    const c = cities[i] as any;
    const countryName = c.countries?.name ?? '';
    const label = `[${i + 1}/${cities.length}] city: ${c.name}`;

    if (isSupabaseUrl(c.hero_image_url)) {
      console.log(`${label} -> SKIP (already seeded)`);
      results.push({ name: c.name, ok: true });
      continue;
    }

    try {
      const query = `${c.name} ${countryName}`;
      const srcUrl = await fetchImageUrl(query);
      if (!srcUrl) throw new Error('No image found');

      const buf = await downloadAndResize(srcUrl);
      const storagePath = `cities/${c.slug}.jpg`;
      const url = await uploadToStorage(storagePath, buf);

      await supabase.from('cities').update({ hero_image_url: url }).eq('id', c.id);

      await supabase
        .from('geo_content')
        .update({ hero_image_url: url })
        .eq('scope', 'city')
        .eq('city_id', c.id);

      console.log(`${label} -> OK`);
      results.push({ name: c.name, ok: true });
    } catch (err: any) {
      console.log(`${label} -> FAIL: ${err.message}`);
      results.push({ name: c.name, ok: false, reason: err.message });
    }

    await sleep(DELAY_MS);
  }
  return results;
}

async function seedPlaces(): Promise<SeedResult[]> {
  const { data: places, error } = await supabase
    .from('places')
    .select('id, slug, name, city_id, cities(name)')
    .eq('is_active', true);
  if (error) throw error;
  if (!places?.length) return [];

  // Check which places already have a seeded image in place_media
  const { data: existingMedia } = await supabase
    .from('place_media')
    .select('place_id, url')
    .eq('media_type', 'image')
    .eq('source', 'editorial');

  const seededPlaceIds = new Set(
    (existingMedia ?? [])
      .filter((m: any) => isSupabaseUrl(m.url))
      .map((m: any) => m.place_id),
  );

  const results: SeedResult[] = [];
  for (let i = 0; i < places.length; i++) {
    const p = places[i] as any;
    const cityName = p.cities?.name ?? '';
    const label = `[${i + 1}/${places.length}] place: ${p.name}`;

    if (seededPlaceIds.has(p.id)) {
      console.log(`${label} -> SKIP (already seeded)`);
      results.push({ name: p.name, ok: true });
      continue;
    }

    try {
      const query = `${p.name} ${cityName}`;
      const srcUrl = await fetchImageUrl(query);
      if (!srcUrl) throw new Error('No image found');

      const buf = await downloadAndResize(srcUrl);
      const storagePath = `places/${p.slug}.jpg`;
      const url = await uploadToStorage(storagePath, buf);

      // Upsert into place_media — use order_index 0 for the editorial hero
      const { data: existing } = await supabase
        .from('place_media')
        .select('id')
        .eq('place_id', p.id)
        .eq('source', 'editorial')
        .eq('order_index', 0)
        .maybeSingle();

      if (existing) {
        await supabase.from('place_media').update({ url }).eq('id', existing.id);
      } else {
        await supabase.from('place_media').insert({
          place_id: p.id,
          url,
          media_type: 'image',
          source: 'editorial',
          order_index: 0,
        });
      }

      console.log(`${label} -> OK`);
      results.push({ name: p.name, ok: true });
    } catch (err: any) {
      console.log(`${label} -> FAIL: ${err.message}`);
      results.push({ name: p.name, ok: false, reason: err.message });
    }

    await sleep(DELAY_MS);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding images...\n');

  // Ensure bucket exists (will fail silently if it already exists)
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  console.log('--- Countries ---');
  const countryResults = await seedCountries();

  console.log('\n--- Cities ---');
  const cityResults = await seedCities();

  console.log('\n--- Places ---');
  const placeResults = await seedPlaces();

  // Summary
  const all = [...countryResults, ...cityResults, ...placeResults];
  const failed = all.filter((r) => !r.ok);

  console.log(`\n========================================`);
  console.log(`Total: ${all.length} | OK: ${all.length - failed.length} | Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed entities:');
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
