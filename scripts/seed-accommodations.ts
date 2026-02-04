/**
 * Bulk Accommodation Seeding Script
 *
 * Seeds researched accommodations from the accommodations-researched.ts file,
 * downloads photos from Google Places API, uploads to Supabase Storage.
 *
 * Usage:
 *   npx tsx scripts/seed-accommodations.ts
 *   npx tsx scripts/seed-accommodations.ts --city bangkok
 *   npx tsx scripts/seed-accommodations.ts --country Thailand
 *   npx tsx scripts/seed-accommodations.ts --dry-run
 *   npx tsx scripts/seed-accommodations.ts --limit 5
 *
 * Required environment variables:
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - GOOGLE_PLACES_API_KEY
 */

import { supabase, did } from './seed-utils';
import { ACCOMMODATIONS_TO_SEED as ACCOMMODATIONS, type AccommodationEntry } from './content/accommodations-to-seed';
import 'dotenv/config';

// Rate limiting
const RATE_LIMIT_MS = 1500;
const MAX_PHOTOS = 3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { weekday_text?: string[] };
  geometry?: { location: { lat: number; lng: number } };
  photos?: { photo_reference: string; width: number; height: number }[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
}

interface SeedSummary {
  total: number;
  seeded: number;
  skipped: number;
  errors: number;
}

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

async function searchGooglePlace(name: string, city: string, country: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const query = encodeURIComponent(`${name} ${city} ${country}`);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].place_id;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchGooglePlace(googlePlaceId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  // Handle different ID formats
  let placeId = googlePlaceId;
  if (googlePlaceId.startsWith('cid:')) {
    // CID format - need to search instead
    return null;
  }
  if (googlePlaceId.includes(':')) {
    // Hex format like 0x...:0x... - this is not a valid place_id
    return null;
  }

  const fields = [
    'place_id', 'name', 'formatted_address', 'formatted_phone_number',
    'website', 'opening_hours', 'geometry', 'photos', 'rating',
    'user_ratings_total', 'price_level', 'types',
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') return null;
    return data.result;
  } catch {
    return null;
  }
}

async function downloadGooglePhoto(photoReference: string): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Supabase Operations
// ---------------------------------------------------------------------------

async function getCityBySlug(slug: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data;
}

async function placeExistsByName(name: string, cityId: string): Promise<boolean> {
  const { count } = await supabase
    .from('places')
    .select('id', { count: 'exact', head: true })
    .eq('name', name)
    .eq('city_id', cityId);
  return (count ?? 0) > 0;
}

async function uploadPhoto(placeId: string, buffer: Buffer, index: number): Promise<string | null> {
  const fileName = `${placeId}/${Date.now()}-${index}.jpg`;

  const { error } = await supabase.storage
    .from('place-images')
    .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from('place-images').getPublicUrl(fileName);
  return data.publicUrl;
}

async function createPlace(
  entry: AccommodationEntry,
  googlePlace: GooglePlaceResult | null,
  cityId: string,
): Promise<string> {
  const placeId = did(`place:${entry.name}:${entry.citySlug}`);
  const slug = entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const hoursText = googlePlace?.opening_hours?.weekday_text?.join(' | ') ?? null;

  // Use Google data if available, otherwise use entry data
  const rating = googlePlace?.rating ?? entry.googleRating ?? null;
  const reviewCount = googlePlace?.user_ratings_total ?? entry.reviewCount ?? null;

  // Calculate curation score: rating * log10(reviews + 1)
  const curationScore = rating && reviewCount ? rating * Math.log10(reviewCount + 1) : null;

  await supabase.from('places').upsert({
    id: placeId,
    city_id: cityId,
    slug,
    name: entry.name,
    place_type: entry.type,
    lat: googlePlace?.geometry?.location.lat ?? null,
    lng: googlePlace?.geometry?.location.lng ?? null,
    address: googlePlace?.formatted_address ?? null,
    google_place_id: googlePlace?.place_id ?? entry.googlePlaceId ?? null,
    phone: googlePlace?.formatted_phone_number ?? null,
    website: googlePlace?.website ?? null,
    price_level: entry.priceLevel,
    hours_text: hoursText,
    description: entry.whySelected,
    is_active: true,
    // Curation fields
    curation_notes: `Selected for Sola based on research across ${entry.sourcesChecked.join(', ')}`,
    curation_score: curationScore,
    google_rating: rating,
    google_review_count: reviewCount,
    discovered_at: new Date().toISOString(),
    // Rich curation data
    why_selected: entry.whySelected,
    highlights: entry.highlights,
    considerations: entry.considerations,
    solo_female_reviews: entry.soloFemaleReviews,
    google_maps_url: entry.googleMapsUrl,
    original_type: entry.originalType,
    price_per_night: entry.pricePerNight,
    sources_checked: entry.sourcesChecked,
  }, { onConflict: 'id' });

  return placeId;
}

async function createPlaceMedia(placeId: string, imageUrls: string[]) {
  await supabase.from('place_media').delete().eq('place_id', placeId);

  for (let i = 0; i < imageUrls.length; i++) {
    await supabase.from('place_media').insert({
      id: did(`media:${placeId}:${i}`),
      place_id: placeId,
      url: imageUrls[i],
      media_type: 'image',
      source: 'google',
      order_index: i,
    });
  }
}

// ---------------------------------------------------------------------------
// Main Seeding Loop
// ---------------------------------------------------------------------------

async function seedAccommodation(
  entry: AccommodationEntry,
  dryRun: boolean,
): Promise<'seeded' | 'skipped' | 'error'> {
  try {
    // Check if city exists
    const city = await getCityBySlug(entry.citySlug);
    if (!city) {
      console.log(`   ⚠️  City not found: ${entry.citySlug}`);
      return 'skipped';
    }

    // Check if already exists by name
    if (await placeExistsByName(entry.name, city.id)) {
      console.log(`   ⏭️  Already exists`);
      return 'skipped';
    }

    if (dryRun) {
      console.log(`   🔍 Would seed: ${entry.name}`);
      return 'seeded';
    }

    // Try to get Google Place data
    let googlePlace: GooglePlaceResult | null = null;

    // First try using the stored place ID
    if (entry.googlePlaceId && !entry.googlePlaceId.startsWith('cid:') && !entry.googlePlaceId.includes(':')) {
      googlePlace = await fetchGooglePlace(entry.googlePlaceId);
    }

    // If that fails, search by name
    if (!googlePlace) {
      const searchedId = await searchGooglePlace(entry.name, entry.city, entry.country);
      if (searchedId) {
        googlePlace = await fetchGooglePlace(searchedId);
      }
    }

    console.log(`   📍 ${entry.name}${googlePlace ? ' (Google data found)' : ' (using entry data)'}`);

    // Create place
    const placeId = await createPlace(entry, googlePlace, city.id);

    // Download and upload photos if Google data available
    const photos = googlePlace?.photos?.slice(0, MAX_PHOTOS) ?? [];
    const imageUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const buffer = await downloadGooglePhoto(photos[i].photo_reference);
      if (buffer) {
        const url = await uploadPhoto(placeId, buffer, i);
        if (url) imageUrls.push(url);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    if (imageUrls.length > 0) {
      await createPlaceMedia(placeId, imageUrls);
      console.log(`   📸 ${imageUrls.length} photos uploaded`);
    }

    return 'seeded';
  } catch (error) {
    console.log(`   💥 Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return 'error';
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  const cityFilter = args.includes('--city') ? args[args.indexOf('--city') + 1] : undefined;
  const countryFilter = args.includes('--country') ? args[args.indexOf('--country') + 1] : undefined;
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : undefined;
  const dryRun = args.includes('--dry-run');

  console.log('🌱 Sola Accommodation Seeding');
  console.log('─'.repeat(50));

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY is required');
    process.exit(1);
  }

  // Filter accommodations
  let entries = [...ACCOMMODATIONS];
  if (cityFilter) {
    entries = entries.filter(e => e.citySlug === cityFilter);
    console.log(`📍 Filtering to city: ${cityFilter}`);
  }
  if (countryFilter) {
    entries = entries.filter(e => e.country.toLowerCase() === countryFilter.toLowerCase());
    console.log(`🌍 Filtering to country: ${countryFilter}`);
  }
  if (limit) {
    entries = entries.slice(0, limit);
    console.log(`📊 Limiting to ${limit} places`);
  }

  console.log(`📦 ${entries.length} accommodations to process`);
  if (dryRun) console.log('⏭️  Dry run mode');
  console.log('');

  const summary: SeedSummary = { total: entries.length, seeded: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`[${i + 1}/${entries.length}] ${entry.name} (${entry.city}, ${entry.country})`);

    const result = await seedAccommodation(entry, dryRun);

    if (result === 'seeded') summary.seeded++;
    else if (result === 'skipped') summary.skipped++;
    else summary.errors++;

    // Rate limit
    if (i < entries.length - 1 && result !== 'skipped') {
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 SEEDING SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total:   ${summary.total}`);
  console.log(`Seeded:  ${summary.seeded}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Errors:  ${summary.errors}`);
  console.log('═'.repeat(50));
}

main().catch(console.error);
