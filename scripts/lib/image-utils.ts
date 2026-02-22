/**
 * Shared image utilities for enrichment scripts.
 *
 * Consolidates Google Places API calls, photo scoring/selection,
 * download/resize via Sharp, and Supabase Storage upload.
 */

import 'dotenv/config';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY is required in .env');
  process.exit(1);
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
export const BUCKET = 'images';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhotoCandidate {
  photoName: string;
  widthPx: number;
  heightPx: number;
  attribution: string | null;
}

export interface ResizeConfig {
  width: number;
  height: number;
  quality?: number;
  /** Fetch at this width from Google (defaults to 2x target width) */
  fetchWidth?: number;
}

// ---------------------------------------------------------------------------
// Photo scoring
// ---------------------------------------------------------------------------

/**
 * Score a photo candidate 0–100 based on resolution, aspect ratio, and width.
 *
 * - Resolution (0–40): reject < 600x400, max at 4MP
 * - Aspect ratio (0–30): ideal landscape 1.3–1.8 = 30, portrait = 0
 * - Width bonus (0–20): 3000px+ = 20
 * - Attribution (0–10): real photographer name = 10
 */
export function scorePhoto(c: PhotoCandidate): number {
  let score = 0;

  // Resolution: 0–40
  const mp = (c.widthPx * c.heightPx) / 1_000_000;
  if (c.widthPx < 600 || c.heightPx < 400) {
    return 0; // reject tiny images
  }
  score += Math.min(40, Math.round((mp / 4) * 40));

  // Aspect ratio: 0–30
  const ratio = c.widthPx / c.heightPx;
  if (ratio >= 1.3 && ratio <= 1.8) {
    score += 30;
  } else if (ratio >= 1.0 && ratio < 1.3) {
    score += 15;
  } else if (ratio > 1.8 && ratio <= 2.5) {
    score += 20;
  }
  // portrait (ratio < 1.0) adds 0

  // Width bonus: 0–20
  if (c.widthPx >= 3000) {
    score += 20;
  } else if (c.widthPx >= 2000) {
    score += 15;
  } else if (c.widthPx >= 1200) {
    score += 10;
  } else if (c.widthPx >= 800) {
    score += 5;
  }

  // Attribution: 0–10
  if (c.attribution && c.attribution.length > 0) {
    score += 10;
  }

  return score;
}

/**
 * Score all candidates and return the top N sorted by score descending.
 */
export function selectBestPhotos(candidates: PhotoCandidate[], count: number): PhotoCandidate[] {
  return candidates
    .map((c) => ({ candidate: c, score: scorePhoto(c) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.candidate);
}

// ---------------------------------------------------------------------------
// Google Places API (New)
// ---------------------------------------------------------------------------

/**
 * Text Search (New) — returns all photo candidates with dimensions.
 * Field mask requests photos with width/height metadata.
 */
export async function fetchPhotoRefs(query: string): Promise<PhotoCandidate[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: 'en' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text Search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const photos = data.places?.[0]?.photos ?? [];

  return photos.map((p: any) => ({
    photoName: p.name,
    widthPx: p.widthPx ?? 0,
    heightPx: p.heightPx ?? 0,
    attribution: p.authorAttributions?.[0]?.displayName ?? null,
  }));
}

/**
 * Place Details (New) — returns all photo candidates for a known Google Place ID.
 */
export async function getPlacePhotoRefs(googlePlaceId: string): Promise<PhotoCandidate[]> {
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'photos',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Place Details failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const photos = data.photos ?? [];

  return photos.map((p: any) => ({
    photoName: p.name,
    widthPx: p.widthPx ?? 0,
    heightPx: p.heightPx ?? 0,
    attribution: p.authorAttributions?.[0]?.displayName ?? null,
  }));
}

/**
 * Text Search returning place ID + photo candidates (for country/city enrichment).
 */
export async function searchPlaceWithPhotos(query: string): Promise<{
  placeId: string;
  candidates: PhotoCandidate[];
} | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: 'en' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text Search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const place = data.places?.[0];
  if (!place) return null;

  const candidates: PhotoCandidate[] = (place.photos ?? []).map((p: any) => ({
    photoName: p.name,
    widthPx: p.widthPx ?? 0,
    heightPx: p.heightPx ?? 0,
    attribution: p.authorAttributions?.[0]?.displayName ?? null,
  }));

  return { placeId: place.id, candidates };
}

// ---------------------------------------------------------------------------
// Download & resize
// ---------------------------------------------------------------------------

/**
 * Download a photo from Google Places at the given fetch width,
 * then resize to the target dimensions with Sharp.
 */
export async function downloadAndResize(
  photoName: string,
  config: ResizeConfig,
): Promise<Buffer> {
  const fetchWidth = config.fetchWidth ?? config.width * 2;
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${fetchWidth}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Photo download failed (${res.status})`);
  }

  const raw = Buffer.from(await res.arrayBuffer());
  return sharp(raw)
    .resize(config.width, config.height, { fit: 'cover' })
    .jpeg({ quality: config.quality ?? 80 })
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export function publicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Upload JPEG buffer to Supabase Storage (upsert).
 * Returns the public URL.
 */
export async function uploadToStorage(storagePath: string, data: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, data, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return publicUrl(storagePath);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
