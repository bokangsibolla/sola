/**
 * Seed Place from Google Places API
 *
 * Fetches place details from Google Places API, downloads photos,
 * uploads them to Supabase Storage, and creates the place record.
 *
 * Usage:
 *   npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug>
 *   npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --type hostel
 *   npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --verify
 *   npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --dry-run
 *
 * Required environment variables:
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - GOOGLE_PLACES_API_KEY
 */

import { supabase, did } from './seed-utils';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    weekday_text?: string[];
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: {
    photo_reference: string;
    width: number;
    height: number;
  }[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
}

type PlaceType = 'hotel' | 'hostel' | 'homestay' | 'restaurant' | 'cafe' | 'bar' | 'activity' | 'coworking' | 'landmark' | 'wellness';

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

async function fetchGooglePlace(googlePlaceId: string): Promise<GooglePlaceResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is required');

  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'opening_hours',
    'geometry',
    'photos',
    'rating',
    'user_ratings_total',
    'price_level',
    'types',
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=${fields}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message ?? ''}`);
  }

  return data.result;
}

async function downloadGooglePhoto(
  photoReference: string,
  maxWidth: number = 800,
): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is required');

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download photo: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// Supabase Storage
// ---------------------------------------------------------------------------

async function uploadPhotoToStorage(
  placeId: string,
  photoBuffer: Buffer,
  index: number,
): Promise<string> {
  const fileName = `${placeId}/${Date.now()}-${index}.jpg`;

  const { error } = await supabase.storage
    .from('place-images')
    .upload(fileName, photoBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('place-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Database Operations
// ---------------------------------------------------------------------------

async function getCityBySlug(slug: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, country_id')
    .eq('slug', slug)
    .single();
  if (error) throw new Error(`City not found: ${slug}`);
  return data;
}

async function createPlace(
  googlePlace: GooglePlaceResult,
  cityId: string,
  placeType: PlaceType,
): Promise<string> {
  // Generate deterministic ID from Google Place ID
  const placeId = did(`place:${googlePlace.place_id}`);

  // Create slug from name
  const slug = googlePlace.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Format hours
  const hoursText = googlePlace.opening_hours?.weekday_text?.join(' | ') ?? null;

  const { error } = await supabase
    .from('places')
    .upsert(
      {
        id: placeId,
        city_id: cityId,
        slug: slug,
        name: googlePlace.name,
        place_type: placeType,
        lat: googlePlace.geometry?.location.lat ?? null,
        lng: googlePlace.geometry?.location.lng ?? null,
        address: googlePlace.formatted_address ?? null,
        google_place_id: googlePlace.place_id,
        phone: googlePlace.formatted_phone_number ?? null,
        website: googlePlace.website ?? null,
        price_level: googlePlace.price_level ?? null,
        hours_text: hoursText,
        is_active: true,
        verification_status: 'unverified',
      },
      { onConflict: 'id' }
    );

  if (error) throw error;

  return placeId;
}

async function createPlaceMedia(
  placeId: string,
  imageUrls: string[],
) {
  // Clear existing media
  await supabase
    .from('place_media')
    .delete()
    .eq('place_id', placeId);

  // Insert new media
  for (let i = 0; i < imageUrls.length; i++) {
    const { error } = await supabase
      .from('place_media')
      .insert({
        id: did(`media:${placeId}:${i}`),
        place_id: placeId,
        url: imageUrls[i],
        media_type: 'image',
        source: 'google',
        order_index: i,
      });

    if (error) {
      console.warn(`Failed to save media ${i}:`, error.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seedPlace(
  googlePlaceId: string,
  citySlug: string,
  placeType: PlaceType,
  maxPhotos: number,
  dryRun: boolean,
  runVerification: boolean,
) {
  console.log('🌱 Sola Place Seeding');
  console.log('─'.repeat(50));

  // 1. Get city
  const city = await getCityBySlug(citySlug);
  console.log(`📍 City: ${city.name}`);

  // 2. Fetch Google Place data
  console.log('📡 Fetching Google Places data...');
  const googlePlace = await fetchGooglePlace(googlePlaceId);
  console.log(`   Name: ${googlePlace.name}`);
  console.log(`   Rating: ${googlePlace.rating ?? 'N/A'} (${googlePlace.user_ratings_total ?? 0} reviews)`);
  console.log(`   Photos: ${googlePlace.photos?.length ?? 0} available`);

  if (dryRun) {
    console.log('\n⏭️  Dry run - not saving to database');
    console.log('\nPlace data:');
    console.log(JSON.stringify(googlePlace, null, 2));
    return;
  }

  // 3. Create place record
  console.log('\n💾 Creating place record...');
  const placeId = await createPlace(googlePlace, city.id, placeType);
  console.log(`   Place ID: ${placeId}`);

  // 4. Download and upload photos
  const photos = googlePlace.photos?.slice(0, maxPhotos) ?? [];
  if (photos.length > 0) {
    console.log(`\n📸 Processing ${photos.length} photos...`);
    const imageUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      try {
        console.log(`   [${i + 1}/${photos.length}] Downloading...`);
        const photoBuffer = await downloadGooglePhoto(photos[i].photo_reference);

        console.log(`   [${i + 1}/${photos.length}] Uploading to storage...`);
        const url = await uploadPhotoToStorage(placeId, photoBuffer, i);
        imageUrls.push(url);

        console.log(`   [${i + 1}/${photos.length}] ✓ Done`);

        // Small delay between photo downloads
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.warn(`   [${i + 1}/${photos.length}] ✗ Failed:`, error);
      }
    }

    // Save media records
    if (imageUrls.length > 0) {
      console.log('\n💾 Saving media records...');
      await createPlaceMedia(placeId, imageUrls);
      console.log(`   ✓ ${imageUrls.length} images saved`);
    }
  }

  // 5. Run verification if requested
  if (runVerification) {
    console.log('\n🔍 Running verification...');
    console.log('   Run: npx tsx scripts/verify-place.ts ' + placeId);
    // TODO: Import and run verifyPlace directly
  }

  console.log('\n✅ Place seeded successfully!');
  console.log(`   ID: ${placeId}`);
  console.log(`   Name: ${googlePlace.name}`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function inferPlaceType(googleTypes: string[] = []): PlaceType {
  const typeMap: Record<string, PlaceType> = {
    lodging: 'hotel',
    hotel: 'hotel',
    hostel: 'hostel',
    guest_house: 'homestay',
    restaurant: 'restaurant',
    cafe: 'cafe',
    bar: 'bar',
    night_club: 'bar',
    gym: 'wellness',
    spa: 'wellness',
    tourist_attraction: 'landmark',
    museum: 'landmark',
    park: 'activity',
  };

  for (const type of googleTypes) {
    if (typeMap[type]) return typeMap[type];
  }

  return 'hotel'; // Default
}

async function main() {
  const args = process.argv.slice(2);

  const googlePlaceId = args.find(a => !a.startsWith('--'));
  const citySlug = args.includes('--city')
    ? args[args.indexOf('--city') + 1]
    : undefined;
  const typeArg = args.includes('--type')
    ? args[args.indexOf('--type') + 1] as PlaceType
    : undefined;
  const maxPhotos = args.includes('--photos')
    ? parseInt(args[args.indexOf('--photos') + 1], 10)
    : 5;
  const dryRun = args.includes('--dry-run');
  const runVerification = args.includes('--verify');

  if (!googlePlaceId || !citySlug) {
    console.log('Sola Place Seeding from Google Places');
    console.log('─'.repeat(50));
    console.log('Usage:');
    console.log('  npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug>');
    console.log('  npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --type hostel');
    console.log('  npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --photos 3');
    console.log('  npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --verify');
    console.log('  npx tsx scripts/seed-place.ts <google_place_id> --city <city_slug> --dry-run');
    console.log('\nOptions:');
    console.log('  --city <slug>     City slug (required)');
    console.log('  --type <type>     Place type: hotel, hostel, homestay, etc.');
    console.log('  --photos <n>      Max photos to download (default: 5)');
    console.log('  --verify          Run verification after seeding');
    console.log('  --dry-run         Preview without saving');
    console.log('\nHow to find Google Place ID:');
    console.log('  1. Go to Google Maps');
    console.log('  2. Search for the place');
    console.log('  3. Click on the place');
    console.log('  4. The Place ID is in the URL: ...place_id=<PLACE_ID>');
    console.log('  Or use: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder');
    process.exit(1);
  }

  // Check env vars
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY is required');
    process.exit(1);
  }

  try {
    // If no type specified, fetch Google data first to infer type
    let placeType = typeArg;
    if (!placeType) {
      const googlePlace = await fetchGooglePlace(googlePlaceId);
      placeType = inferPlaceType(googlePlace.types);
      console.log(`ℹ️  Inferred place type: ${placeType}`);
    }

    await seedPlace(
      googlePlaceId,
      citySlug,
      placeType,
      maxPhotos,
      dryRun,
      runVerification,
    );
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
