/**
 * Bulk Accommodation Seeding Script
 *
 * Seeds multiple accommodations from the accommodations data file,
 * downloads photos, uploads to Supabase Storage, and optionally runs verification.
 *
 * Usage:
 *   npx tsx scripts/seed-accommodations.ts
 *   npx tsx scripts/seed-accommodations.ts --city bangkok
 *   npx tsx scripts/seed-accommodations.ts --verify
 *   npx tsx scripts/seed-accommodations.ts --dry-run
 *   npx tsx scripts/seed-accommodations.ts --limit 5
 *
 * Required environment variables:
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - GOOGLE_PLACES_API_KEY
 *   - ANTHROPIC_API_KEY (if --verify is used)
 */

import { supabase, did } from './seed-utils';
import { ACCOMMODATIONS, type AccommodationEntry } from './content/accommodations';
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

async function fetchGooglePlace(googlePlaceId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const fields = [
    'place_id', 'name', 'formatted_address', 'formatted_phone_number',
    'website', 'opening_hours', 'geometry', 'photos', 'rating',
    'user_ratings_total', 'price_level', 'types',
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=${fields}&key=${apiKey}`;

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

async function placeExists(googlePlaceId: string): Promise<boolean> {
  const { count } = await supabase
    .from('places')
    .select('id', { count: 'exact', head: true })
    .eq('google_place_id', googlePlaceId);
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
  googlePlace: GooglePlaceResult,
  cityId: string,
): Promise<string> {
  const placeId = did(`place:${googlePlace.place_id}`);
  const slug = googlePlace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const hoursText = googlePlace.opening_hours?.weekday_text?.join(' | ') ?? null;

  await supabase.from('places').upsert({
    id: placeId,
    city_id: cityId,
    slug,
    name: googlePlace.name,
    place_type: entry.type,
    lat: googlePlace.geometry?.location.lat ?? null,
    lng: googlePlace.geometry?.location.lng ?? null,
    address: googlePlace.formatted_address ?? null,
    google_place_id: googlePlace.place_id,
    phone: googlePlace.formatted_phone_number ?? null,
    website: googlePlace.website ?? null,
    price_level: googlePlace.price_level ?? null,
    hours_text: hoursText,
    description: entry.description ?? null,
    is_active: true,
    verification_status: 'unverified',
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
// Verification (imported inline to avoid circular deps)
// ---------------------------------------------------------------------------

async function verifyPlace(placeId: string): Promise<void> {
  // Dynamic import to avoid loading Anthropic SDK if not needed
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const { data: place } = await supabase.from('places').select('*').eq('id', placeId).single();
  if (!place) return;

  let googleData = null;
  if (place.google_place_id) {
    googleData = await fetchGooglePlace(place.google_place_id);
  }

  const anthropic = new Anthropic();
  const reviewsText = googleData?.reviews?.slice(0, 10)?.map((r: any, i: number) =>
    `Review ${i + 1} (${r.rating}★): ${r.text}`
  ).join('\n\n') ?? 'No reviews available';

  const prompt = `You are analyzing an accommodation for Sola, a travel app for solo female travelers.

PLACE: ${place.name} (${place.place_type})
Address: ${place.address ?? 'N/A'}
Rating: ${googleData?.rating ?? 'N/A'} (${googleData?.user_ratings_total ?? 0} reviews)

REVIEWS:
${reviewsText}

Check: room clarity, security signals, surroundings, operations, accuracy, solo traveler experience.

Respond with JSON only:
{
  "status": "baseline_passed" | "baseline_failed" | "insufficient_data",
  "signals": { "key": { "value": "true/false/text", "confidence": 0.0-1.0, "source": "string" } },
  "sola_notes": [{ "type": "highlight|context", "text": "Short note" }],
  "confidence_score": 0.0-1.0,
  "reasoning": "Brief explanation"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return;

  const result = JSON.parse(match[0]);
  const now = new Date().toISOString();

  // Update place
  await supabase.from('places').update({
    verification_status: result.status,
    verified_at: now,
  }).eq('id', placeId);

  // Save verification
  await supabase.from('place_verifications').insert({
    place_id: placeId,
    status: result.status,
    sources_checked: [{ source: 'google_places' }, { source: 'claude_analysis' }],
    raw_findings: result,
    confidence_score: result.confidence_score,
  });

  // Save signals
  for (const [key, signal] of Object.entries(result.signals ?? {})) {
    const s = signal as any;
    await supabase.from('place_signals').upsert({
      place_id: placeId,
      signal_key: key,
      signal_value: s.value,
      signal_type: s.value === 'true' || s.value === 'false' ? 'boolean' : 'text',
      confidence: s.confidence,
      source: s.source,
    }, { onConflict: 'place_id,signal_key' });
  }

  // Save notes
  await supabase.from('place_sola_notes').delete().eq('place_id', placeId);
  for (let i = 0; i < (result.sola_notes ?? []).length; i++) {
    const note = result.sola_notes[i];
    await supabase.from('place_sola_notes').insert({
      place_id: placeId,
      note_type: note.type,
      note_text: note.text,
      display_context: 'always',
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
  runVerification: boolean,
): Promise<'seeded' | 'skipped' | 'error'> {
  try {
    // Check if city exists
    const city = await getCityBySlug(entry.citySlug);
    if (!city) {
      console.log(`   ⚠️  City not found: ${entry.citySlug}`);
      return 'skipped';
    }

    // Check if already exists
    if (await placeExists(entry.googlePlaceId)) {
      console.log(`   ⏭️  Already exists`);
      return 'skipped';
    }

    if (dryRun) {
      console.log(`   🔍 Would seed: ${entry.googlePlaceId}`);
      return 'seeded';
    }

    // Fetch Google data
    const googlePlace = await fetchGooglePlace(entry.googlePlaceId);
    if (!googlePlace) {
      console.log(`   ❌ Failed to fetch Google Place data`);
      return 'error';
    }

    console.log(`   📍 ${googlePlace.name}`);

    // Create place
    const placeId = await createPlace(entry, googlePlace, city.id);

    // Download and upload photos
    const photos = googlePlace.photos?.slice(0, MAX_PHOTOS) ?? [];
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

    // Run verification if requested
    if (runVerification) {
      console.log(`   🔍 Verifying...`);
      await verifyPlace(placeId);
      console.log(`   ✓ Verified`);
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
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : undefined;
  const dryRun = args.includes('--dry-run');
  const runVerification = args.includes('--verify');

  console.log('🌱 Sola Bulk Accommodation Seeding');
  console.log('─'.repeat(50));

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY is required');
    process.exit(1);
  }

  if (runVerification && !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required for --verify');
    process.exit(1);
  }

  // Filter accommodations
  let entries = ACCOMMODATIONS;
  if (cityFilter) {
    entries = entries.filter(e => e.citySlug === cityFilter);
    console.log(`📍 Filtering to city: ${cityFilter}`);
  }
  if (limit) {
    entries = entries.slice(0, limit);
    console.log(`📊 Limiting to ${limit} places`);
  }

  console.log(`📦 ${entries.length} accommodations to process`);
  if (dryRun) console.log('⏭️  Dry run mode');
  if (runVerification) console.log('🔍 Verification enabled');
  console.log('');

  const summary: SeedSummary = { total: entries.length, seeded: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`[${i + 1}/${entries.length}] ${entry.name ?? entry.googlePlaceId} (${entry.citySlug})`);

    const result = await seedAccommodation(entry, dryRun, runVerification);

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
