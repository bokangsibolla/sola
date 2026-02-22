/**
 * Google Custom Search JSON API wrapper for editorial-quality image search.
 *
 * Used primarily for country hero images where Places API photos
 * may not be cinematic enough. Also used as a fallback for cities.
 *
 * API docs: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
 */

import type { ImageCandidate, LicenseHint } from './types';

const CSE_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';

// ---------------------------------------------------------------------------
// Domain trust database
// ---------------------------------------------------------------------------

/** Trusted domains mapped to trust score and license hint */
const TRUSTED_DOMAINS: Record<string, { trust: number; hint: LicenseHint }> = {
  // Free-use / open license sources
  'wikimedia.org':          { trust: 0.9, hint: 'wikimedia_like' },
  'wikipedia.org':          { trust: 0.9, hint: 'wikimedia_like' },
  'commons.wikimedia.org':  { trust: 0.95, hint: 'wikimedia_like' },
  'unsplash.com':           { trust: 0.85, hint: 'wikimedia_like' },
  'pexels.com':             { trust: 0.85, hint: 'wikimedia_like' },
  'pixabay.com':            { trust: 0.8, hint: 'wikimedia_like' },
  // Government tourism boards
  'visitthailand.com':      { trust: 0.7, hint: 'gov_tourism' },
  'japan.travel':           { trust: 0.7, hint: 'gov_tourism' },
  'southafrica.net':        { trust: 0.7, hint: 'gov_tourism' },
  'visitportugal.com':      { trust: 0.7, hint: 'gov_tourism' },
  'indonesia.travel':       { trust: 0.7, hint: 'gov_tourism' },
  'vietnam.travel':         { trust: 0.7, hint: 'gov_tourism' },
  'tourismcambodia.com':    { trust: 0.7, hint: 'gov_tourism' },
  'tourismmalaysia.gov.my': { trust: 0.7, hint: 'gov_tourism' },
  'visitsingapore.com':     { trust: 0.7, hint: 'gov_tourism' },
  // High-quality editorial (restricted but good for selection)
  'lonelyplanet.com':       { trust: 0.6, hint: 'likely_restricted' },
  'nationalgeographic.com': { trust: 0.6, hint: 'likely_restricted' },
  'cntraveler.com':         { trust: 0.5, hint: 'likely_restricted' },
  'afar.com':               { trust: 0.5, hint: 'likely_restricted' },
  // Stock photo sites (reject)
  'shutterstock.com':       { trust: 0.1, hint: 'likely_restricted' },
  'gettyimages.com':        { trust: 0.1, hint: 'likely_restricted' },
  'istockphoto.com':        { trust: 0.1, hint: 'likely_restricted' },
  'alamy.com':              { trust: 0.1, hint: 'likely_restricted' },
  'dreamstime.com':         { trust: 0.1, hint: 'likely_restricted' },
  '123rf.com':              { trust: 0.1, hint: 'likely_restricted' },
  'depositphotos.com':      { trust: 0.1, hint: 'likely_restricted' },
  'adobe.com':              { trust: 0.1, hint: 'likely_restricted' },
};

/**
 * Analyze a URL's domain and return trust/license info.
 */
export function analyzeDomain(url: string): { trust: number; hint: LicenseHint } {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    // Check exact matches and suffix matches
    for (const [domain, info] of Object.entries(TRUSTED_DOMAINS)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return info;
      }
    }
    // Government domains
    if (hostname.endsWith('.gov') || hostname.endsWith('.gov.za') || hostname.endsWith('.go.jp') || hostname.endsWith('.gov.my')) {
      return { trust: 0.75, hint: 'gov_tourism' };
    }
    // Tourism domains
    if (hostname.includes('tourism') || hostname.includes('visit') || hostname.includes('travel')) {
      return { trust: 0.6, hint: 'gov_tourism' };
    }
    return { trust: 0.4, hint: 'unknown' };
  } catch {
    return { trust: 0.2, hint: 'unknown' };
  }
}

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

export interface CustomSearchOptions {
  apiKey: string;
  cseId: string;
  /** Maximum results per query (1-10, default 10) */
  num?: number;
  /** Image size filter */
  imgSize?: 'huge' | 'xlarge' | 'large' | 'medium';
  /** Image type filter */
  imgType?: 'photo' | 'face' | 'clipart' | 'lineart';
  /** Safe search level */
  safe?: 'active' | 'moderate' | 'off';
  /** Filter duplicate content */
  filter?: '0' | '1';
  /** Exclude results from specific site */
  excludeSite?: string;
}

interface CSEImageInfo {
  height: number;
  width: number;
  byteSize: number;
  thumbnailLink: string;
  thumbnailHeight: number;
  thumbnailWidth: number;
  contextLink: string;
}

interface CSEItem {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  mime: string;
  fileFormat: string;
  image: CSEImageInfo;
}

interface CSEResponse {
  searchInformation: {
    totalResults: string;
    searchTime: number;
  };
  items?: CSEItem[];
}

// ---------------------------------------------------------------------------
// Search functions
// ---------------------------------------------------------------------------

/**
 * Search Google Custom Search for images matching a query.
 * Returns raw ImageCandidates (scores computed later by scoring module).
 */
export async function searchImages(
  query: string,
  opts: CustomSearchOptions,
): Promise<ImageCandidate[]> {
  const params = new URLSearchParams({
    key: opts.apiKey,
    cx: opts.cseId,
    q: query,
    searchType: 'image',
    imgSize: opts.imgSize ?? 'xlarge',
    imgType: opts.imgType ?? 'photo',
    safe: opts.safe ?? 'active',
    filter: opts.filter ?? '1',
    num: String(opts.num ?? 10),
  });

  if (opts.excludeSite) {
    params.set('siteSearch', opts.excludeSite);
    params.set('siteSearchFilter', 'e');
  }

  const url = `${CSE_ENDPOINT}?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Custom Search failed (${res.status}): ${text}`);
  }

  const data: CSEResponse = await res.json();
  const items = data.items ?? [];

  return items.map((item) => {
    const domain = analyzeDomain(item.link);
    return {
      url: item.link,
      source: 'custom_search' as const,
      width: item.image.width,
      height: item.image.height,
      thumbnailUrl: item.image.thumbnailLink,
      title: item.title,
      contextLink: item.image.contextLink,
      attribution: item.displayLink,
      fileSize: item.image.byteSize,
      mimeType: item.mime,
      qualityScore: 0, // scored later by scoring module
      licenseHint: domain.hint,
      domainTrust: domain.trust,
    };
  });
}

/**
 * Run multiple search queries and aggregate unique results.
 * Deduplicates by URL.
 */
export async function searchImagesMultiQuery(
  queries: string[],
  opts: CustomSearchOptions,
  delayMs: number = 200,
): Promise<ImageCandidate[]> {
  const seen = new Set<string>();
  const all: ImageCandidate[] = [];

  for (const query of queries) {
    try {
      const results = await searchImages(query, opts);
      for (const r of results) {
        if (!seen.has(r.url)) {
          seen.add(r.url);
          all.push(r);
        }
      }
    } catch (err: any) {
      console.warn(`  [CSE] Query "${query}" failed: ${err.message}`);
    }
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return all;
}

/**
 * Filter out stock photo sites and low-trust sources.
 */
export function filterStockPhotos(candidates: ImageCandidate[]): ImageCandidate[] {
  return candidates.filter((c) => c.domainTrust > 0.15);
}
