/**
 * Enhanced image scoring system for the pipeline.
 *
 * Weighted scoring across multiple dimensions:
 * - Resolution & aspect ratio suitability (0-30)
 * - Sharpness proxy via file size + dimensions (0-15)
 * - Source trust / domain reputation (0-20)
 * - Relevance to location (0-15)
 * - "Sola vibe" alignment (0-20)
 */

import type { ImageCandidate } from './types';

// ---------------------------------------------------------------------------
// Weight profiles by use case
// ---------------------------------------------------------------------------

interface ScoreWeights {
  resolution: number;
  sharpness: number;
  sourceTrust: number;
  relevance: number;
  vibeAlignment: number;
}

const HERO_WEIGHTS: ScoreWeights = {
  resolution: 30,
  sharpness: 15,
  sourceTrust: 15,
  relevance: 15,
  vibeAlignment: 25,
};

const GALLERY_WEIGHTS: ScoreWeights = {
  resolution: 25,
  sharpness: 10,
  sourceTrust: 20,
  relevance: 25,
  vibeAlignment: 20,
};

// ---------------------------------------------------------------------------
// Blacklists
// ---------------------------------------------------------------------------

const TITLE_BLACKLIST = [
  /stock\s*(photo|image|picture)/i,
  /royalty[\s-]free/i,
  /watermark/i,
  /\d+\s*x\s*\d+\s*(px|pixel)/i,
  /download\s*free/i,
  /clipart/i,
  /vector/i,
  /illustration/i,
  /cartoon/i,
  /\blogo\b/i,
  /\bicon\b/i,
  /\bmap\b/i,
  /\bflag\b/i,
];

const URL_BLACKLIST = [
  /\.svg$/i,
  /\.gif$/i,
  /favicon/i,
  /logo/i,
  /icon/i,
  /thumb(nail)?s?\//i,
];

// ---------------------------------------------------------------------------
// Vibe signals
// ---------------------------------------------------------------------------

const POSITIVE_VIBE = [
  /travel\s*(photography|editorial)/i,
  /cinematic/i,
  /panoram(a|ic)/i,
  /aerial/i,
  /drone/i,
  /golden\s*hour/i,
  /blue\s*hour/i,
  /sunset/i,
  /sunrise/i,
  /landscape/i,
  /scenic/i,
  /viewpoint/i,
  /skyline/i,
  /national\s*geographic/i,
  /lonely\s*planet/i,
  /cond[eé]\s*nast/i,
  /tourism\s*(board|authority)/i,
];

const NEGATIVE_VIBE = [
  /best\s*\d+\s*things/i,
  /top\s*\d+/i,
  /cheap\s*(flight|hotel)/i,
  /booking\.com/i,
  /tripadvisor/i,
  /agoda/i,
  /expedia/i,
  /hostelworld/i,
  /(happy|smiling)\s*(woman|man|people|tourist)/i,
  /stock/i,
  /selfie/i,
  /instagram\s*spot/i,
  /tiktok/i,
];

// ---------------------------------------------------------------------------
// Rejection check
// ---------------------------------------------------------------------------

/**
 * Check if a candidate should be immediately rejected.
 */
export function shouldReject(c: ImageCandidate): boolean {
  if (c.width < 600 || c.height < 400) return true;
  if (c.source === 'custom_search' && c.height > c.width * 1.2) return true;

  const title = c.title ?? '';
  for (const pat of TITLE_BLACKLIST) {
    if (pat.test(title)) return true;
  }

  for (const pat of URL_BLACKLIST) {
    if (pat.test(c.url)) return true;
  }

  if (c.domainTrust <= 0.15) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Individual scoring dimensions
// ---------------------------------------------------------------------------

function scoreResolution(c: ImageCandidate, maxPts: number): number {
  let score = 0;
  const ratio = c.width / c.height;

  // Aspect ratio: ideal landscape 1.3-1.8
  if (ratio >= 1.3 && ratio <= 1.8) {
    score += maxPts * 0.4;
  } else if (ratio >= 1.0 && ratio < 1.3) {
    score += maxPts * 0.2;
  } else if (ratio > 1.8 && ratio <= 2.5) {
    score += maxPts * 0.3;
  }

  // Megapixels
  const mp = (c.width * c.height) / 1_000_000;
  const resPortion = maxPts * 0.6;
  if (mp >= 4) score += resPortion;
  else if (mp >= 2) score += resPortion * 0.8;
  else if (mp >= 1) score += resPortion * 0.5;
  else if (mp >= 0.5) score += resPortion * 0.3;

  return Math.round(score);
}

function scoreSharpness(c: ImageCandidate, maxPts: number): number {
  if (!c.fileSize || c.width === 0 || c.height === 0) {
    // Places Photos: assume decent quality from Google curation
    return c.source === 'places_photos' ? Math.round(maxPts * 0.6) : 0;
  }

  const mp = (c.width * c.height) / 1_000_000;
  const bytesPerMp = c.fileSize / mp;

  if (bytesPerMp >= 1_500_000) return maxPts;
  if (bytesPerMp >= 800_000) return Math.round(maxPts * 0.8);
  if (bytesPerMp >= 400_000) return Math.round(maxPts * 0.5);
  if (bytesPerMp >= 200_000) return Math.round(maxPts * 0.3);
  return Math.round(maxPts * 0.1);
}

function scoreSourceTrust(c: ImageCandidate, maxPts: number): number {
  if (c.source === 'places_photos') {
    return Math.round(maxPts * 0.85);
  }
  return Math.round(c.domainTrust * maxPts);
}

function scoreRelevance(
  c: ImageCandidate,
  destName: string,
  destCountry: string | undefined,
  maxPts: number,
): number {
  if (c.source === 'places_photos') {
    return Math.round(maxPts * 0.7);
  }

  let score = 0;
  const title = (c.title ?? '').toLowerCase();
  const context = (c.contextLink ?? '').toLowerCase();
  const combined = `${title} ${context}`;
  const nameLower = destName.toLowerCase();

  if (title.includes(nameLower)) score += maxPts * 0.5;
  if (destCountry && combined.includes(destCountry.toLowerCase())) score += maxPts * 0.3;
  if (/travel|tourism|visit|explore|guide/i.test(combined)) score += maxPts * 0.2;

  return Math.min(maxPts, Math.round(score));
}

function scoreVibeAlignment(c: ImageCandidate, maxPts: number): number {
  let score = maxPts * 0.4;
  const combined = `${c.title ?? ''} ${c.contextLink ?? ''}`.toLowerCase();

  for (const pat of POSITIVE_VIBE) {
    if (pat.test(combined)) score += maxPts * 0.1;
  }
  for (const pat of NEGATIVE_VIBE) {
    if (pat.test(combined)) score -= maxPts * 0.15;
  }

  if (c.source === 'places_photos') score += maxPts * 0.15;
  if (c.domainTrust >= 0.7) score += maxPts * 0.1;

  return Math.min(maxPts, Math.max(0, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Main scoring
// ---------------------------------------------------------------------------

/**
 * Score a single image candidate 0-100.
 */
export function scoreCandidate(
  candidate: ImageCandidate,
  destName: string,
  destCountry?: string,
  role: 'hero' | 'gallery' = 'hero',
): number {
  if (shouldReject(candidate)) return 0;

  const w = role === 'hero' ? HERO_WEIGHTS : GALLERY_WEIGHTS;

  return Math.min(
    100,
    scoreResolution(candidate, w.resolution) +
      scoreSharpness(candidate, w.sharpness) +
      scoreSourceTrust(candidate, w.sourceTrust) +
      scoreRelevance(candidate, destName, destCountry, w.relevance) +
      scoreVibeAlignment(candidate, w.vibeAlignment),
  );
}

/**
 * Score all candidates and return them sorted by score descending.
 */
export function rankCandidates(
  candidates: ImageCandidate[],
  destName: string,
  destCountry?: string,
  role: 'hero' | 'gallery' = 'hero',
): ImageCandidate[] {
  return candidates
    .map((c) => ({ ...c, qualityScore: scoreCandidate(c, destName, destCountry, role) }))
    .filter((c) => c.qualityScore > 0)
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

// ---------------------------------------------------------------------------
// Gallery diversity selection
// ---------------------------------------------------------------------------

function categorize(c: ImageCandidate): string {
  const text = `${c.title ?? ''} ${c.contextLink ?? ''}`.toLowerCase();
  if (/aerial|drone|bird.s?.eye/i.test(text)) return 'aerial';
  if (/skyline|panoram|cityscape|viewpoint/i.test(text)) return 'landscape';
  if (/street|market|bazaar|alley|neighborhood/i.test(text)) return 'street';
  if (/temple|mosque|church|castle|monument|landmark|palace/i.test(text)) return 'iconic';
  if (/beach|coast|ocean|sea|cliff/i.test(text)) return 'coastal';
  if (/mountain|valley|forest|nature|park/i.test(text)) return 'nature';
  if (/cafe|restaurant|food|bar|nightlife/i.test(text)) return 'vibe';
  return 'general';
}

/**
 * Select diverse gallery images from different visual categories.
 */
export function selectDiverseGallery(
  rankedCandidates: ImageCandidate[],
  count: number = 4,
): ImageCandidate[] {
  if (rankedCandidates.length <= count) return rankedCandidates;

  const categorized = rankedCandidates.map((c) => ({
    ...c,
    visualCategory: categorize(c),
  }));

  const selected: ImageCandidate[] = [];
  const usedCategories = new Set<string>();

  // First pass: one from each category (highest scored)
  for (const c of categorized) {
    if (selected.length >= count) break;
    if (!usedCategories.has(c.visualCategory!)) {
      usedCategories.add(c.visualCategory!);
      selected.push(c);
    }
  }

  // Second pass: fill remaining with best remaining
  if (selected.length < count) {
    const selectedUrls = new Set(selected.map((s) => s.url));
    for (const c of categorized) {
      if (selected.length >= count) break;
      if (!selectedUrls.has(c.url)) {
        selected.push(c);
        selectedUrls.add(c.url);
      }
    }
  }

  return selected;
}
