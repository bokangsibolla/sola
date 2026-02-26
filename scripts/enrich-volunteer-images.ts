/**
 * Enrich Volunteer Organizations with Images
 *
 * Searches Google Places for each volunteer org and downloads photos.
 * Uses the existing image pipeline.
 *
 * Usage:
 *   npx tsx scripts/enrich-volunteer-images.ts
 *   npx tsx scripts/enrich-volunteer-images.ts --budget 5
 *   npx tsx scripts/enrich-volunteer-images.ts --dry-run
 */

import { randomUUID } from 'crypto';
import {
  supabase,
  BUCKET,
  selectBestPhotos,
  downloadAndResize,
  uploadToStorage,
  sleep,
  slugify,
  type PhotoCandidate,
  type ResizeConfig,
} from './lib/image-utils';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const PRI: ResizeConfig = { width: 800, height: 600, fetchWidth: 1600 };
const COST = { search: 0.040, photo: 0.007 };

let nSearch = 0;
let nPhoto = 0;
const spent = () => nSearch * COST.search + nPhoto * COST.photo;
const canAfford = (t: 'search' | 'photo', budget: number) =>
  spent() + COST[t] <= budget;

interface VolunteerPlace {
  id: string;
  name: string;
  cityName: string;
  countrySlug: string;
  countryName: string;
  imageUrlCached: string | null;
  mediaCount: number;
}

async function textSearch(query: string): Promise<{
  gid: string;
  photos: PhotoCandidate[];
} | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 1,
      languageCode: 'en',
    }),
  });

  nSearch++;

  if (!res.ok) {
    const text = await res.text();
    console.warn(`    ⚠ API ${res.status}: ${text.slice(0, 100)}`);
    return null;
  }

  const data = await res.json();
  const place = data.places?.[0];
  if (!place) return null;

  const photos: PhotoCandidate[] = (place.photos ?? []).map((ph: any) => ({
    photoName: ph.name,
    widthPx: ph.widthPx ?? 0,
    heightPx: ph.heightPx ?? 0,
    attribution: ph.authorAttributions?.[0]?.displayName ?? null,
  }));

  return { gid: place.id, photos };
}

async function main() {
  const args = process.argv.slice(2);
  const budget = args.includes('--budget')
    ? parseFloat(args[args.indexOf('--budget') + 1])
    : 5.0;
  const dryRun = args.includes('--dry-run');

  console.log('📸 VOLUNTEER IMAGE ENRICHMENT');
  console.log('═'.repeat(50));
  console.log(`  Budget: $${budget.toFixed(2)}`);
  console.log(`  Dry run: ${dryRun}`);
  console.log('');

  // Get all volunteer places without images
  const { data: places, error } = await supabase
    .from('places')
    .select(`
      id, name, image_url_cached,
      cities!inner(name, countries!inner(name, slug))
    `)
    .eq('place_type', 'volunteer')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  // Check media counts
  const { data: mediaCounts } = await supabase
    .from('place_media')
    .select('place_id')
    .in('place_id', (places ?? []).map((p: any) => p.id));

  const mediaCountMap = new Map<string, number>();
  for (const m of mediaCounts ?? []) {
    mediaCountMap.set(m.place_id, (mediaCountMap.get(m.place_id) ?? 0) + 1);
  }

  const volunteerPlaces: VolunteerPlace[] = (places ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    cityName: (p.cities as any)?.name ?? '',
    countrySlug: (p.cities as any)?.countries?.slug ?? '',
    countryName: (p.cities as any)?.countries?.name ?? '',
    imageUrlCached: p.image_url_cached,
    mediaCount: mediaCountMap.get(p.id) ?? 0,
  }));

  // Filter to places needing images
  const needsImages = volunteerPlaces.filter(p => p.mediaCount === 0);
  console.log(`📍 ${volunteerPlaces.length} volunteer orgs total`);
  console.log(`📸 ${needsImages.length} need images\n`);

  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  let enriched = 0;
  let failed = 0;

  for (const place of needsImages) {
    if (!canAfford('search', budget)) {
      console.log(`\n💰 Budget reached ($${spent().toFixed(2)})`);
      break;
    }

    const query = `${place.name} ${place.cityName} ${place.countryName}`;
    console.log(`  🔍 ${place.name} (${place.cityName})`);

    const result = await textSearch(query);
    await sleep(350);

    if (!result || result.photos.length === 0) {
      console.log(`    → No photos found`);
      failed++;
      continue;
    }

    const best = selectBestPhotos(result.photos, 2);
    if (best.length === 0) {
      console.log(`    → No suitable photos`);
      failed++;
      continue;
    }

    if (dryRun) {
      console.log(`    → Would download ${best.length} photos`);
      enriched++;
      continue;
    }

    // Update google_place_id if not set
    await supabase
      .from('places')
      .update({ google_place_id: result.gid })
      .eq('id', place.id)
      .is('google_place_id', null);

    let primaryUrl: string | null = null;

    for (let i = 0; i < best.length; i++) {
      if (!canAfford('photo', budget)) break;

      try {
        const suffix = i === 0 ? '' : `-${i + 1}`;
        const path = `places/${place.countrySlug}/${slugify(place.name)}-${place.id.slice(0, 8)}${suffix}.jpg`;

        const img = await downloadAndResize(best[i].photoName, PRI);
        nPhoto++;
        const url = await uploadToStorage(path, img);

        if (i === 0) primaryUrl = url;

        await supabase.from('place_media').insert({
          id: randomUUID(),
          place_id: place.id,
          url,
          media_type: 'image',
          caption: best[i].attribution ? `Photo by ${best[i].attribution}` : null,
          source: 'google',
          order_index: i,
        });
      } catch (e: any) {
        console.log(`    ⚠ Photo ${i + 1}: ${e.message.slice(0, 60)}`);
      }
      await sleep(120);
    }

    if (primaryUrl) {
      await supabase
        .from('places')
        .update({ image_url_cached: primaryUrl })
        .eq('id', place.id);
      console.log(`    ✓ Image saved`);
      enriched++;
    }
  }

  console.log('\n');
  console.log('═'.repeat(50));
  console.log('SUMMARY');
  console.log('═'.repeat(50));
  console.log(`  Enriched: ${enriched}/${needsImages.length}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Cost:     $${spent().toFixed(2)}`);
  console.log('');
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
