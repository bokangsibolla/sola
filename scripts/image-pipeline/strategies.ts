/**
 * Search strategies by destination type.
 *
 * Generates the right set of queries for each destination type,
 * optimizing for the best image quality at lowest API cost.
 */

import type { Destination, ImageCandidate } from './types';
import {
  searchImagesMultiQuery,
  filterStockPhotos,
  type CustomSearchOptions,
} from './custom-search';
import {
  disambiguateDestination,
  canonicalQueryFromEntity,
  type KGEntity,
  type KGSearchOptions,
} from './knowledge-graph';
import { rankCandidates, selectDiverseGallery } from './scoring';
import {
  searchPlaceWithPhotos,
  type PhotoCandidate,
} from '../lib/image-utils';

// ---------------------------------------------------------------------------
// Convert Places PhotoCandidate -> pipeline ImageCandidate
// ---------------------------------------------------------------------------

function placesToCandidate(p: PhotoCandidate): ImageCandidate {
  return {
    url: p.photoName,
    source: 'places_photos',
    width: p.widthPx,
    height: p.heightPx,
    attribution: p.attribution ?? undefined,
    qualityScore: 0,
    licenseHint: 'unknown',
    domainTrust: 0.85,
  };
}

// ---------------------------------------------------------------------------
// Query generators — Countries
// ---------------------------------------------------------------------------

function countryHeroQueries(name: string): string[] {
  return [
    `${name} cinematic landscape`,
    `${name} iconic scenery`,
    `${name} travel photography`,
    `${name} aerial coastline mountains cityscape`,
    `${name} solo travel photography`,
  ];
}

function countryPlacesQueries(name: string): string[] {
  return [
    name,
    `${name} famous landmark`,
    `${name} scenic viewpoint`,
  ];
}

// ---------------------------------------------------------------------------
// Query generators — Cities
// ---------------------------------------------------------------------------

function cityHeroQueries(name: string, countryName?: string): string[] {
  const ctx = countryName ? ` ${countryName}` : '';
  return [
    `${name}${ctx} skyline blue hour`,
    `${name}${ctx} viewpoint panoramic`,
    `${name}${ctx} travel editorial`,
    `${name}${ctx} street photography`,
  ];
}

function cityPlacesQueries(name: string, countryName?: string): string[] {
  const ctx = countryName ? ` ${countryName}` : '';
  return [
    `${name}${ctx} city viewpoint`,
    `${name}${ctx} landmark`,
    `${name}${ctx} old town`,
    `${name}${ctx} skyline`,
  ];
}

// ---------------------------------------------------------------------------
// Query generators — Neighborhoods
// ---------------------------------------------------------------------------

function neighborhoodCSEQueries(name: string, cityName?: string): string[] {
  const ctx = cityName ? ` ${cityName}` : '';
  return [
    `${name}${ctx} streets`,
    `${name}${ctx} cafes`,
    `${name}${ctx} architecture`,
    `${name}${ctx} neighborhood vibe`,
  ];
}

function neighborhoodPlacesQueries(name: string, cityName?: string): string[] {
  const ctx = cityName ? ` ${cityName}` : '';
  return [
    `${name}${ctx} point of interest`,
    `${name}${ctx} park`,
    `${name}${ctx} cafe street`,
    `${name}${ctx}`,
  ];
}

// ---------------------------------------------------------------------------
// Shared: fetch Places API candidates with fallback queries
// ---------------------------------------------------------------------------

async function fetchPlacesCandidates(
  queries: string[],
  verbose: boolean,
): Promise<{ candidates: ImageCandidate[]; placeId?: string }> {
  for (const q of queries) {
    try {
      const result = await searchPlaceWithPhotos(q);
      if (result && result.candidates.length > 0) {
        if (verbose) console.log(`    [Places] Found ${result.candidates.length} photos for "${q}"`);
        return {
          candidates: result.candidates.map(placesToCandidate),
          placeId: result.placeId,
        };
      }
    } catch (err: any) {
      if (verbose) console.log(`    [Places] Query "${q}" failed: ${err.message}`);
    }
  }
  return { candidates: [] };
}

// ---------------------------------------------------------------------------
// Strategy options
// ---------------------------------------------------------------------------

export interface StrategyOptions {
  cseOpts?: CustomSearchOptions;
  kgOpts?: KGSearchOptions;
  qualityThreshold: number;
  skipCustomSearch: boolean;
  delayMs: number;
  verbose: boolean;
}

export interface StrategyResult {
  hero: ImageCandidate | null;
  gallery: ImageCandidate[];
  allCandidates: ImageCandidate[];
  kgEntity?: KGEntity;
  canonicalQuery?: string;
  placesPlaceId?: string;
}

// ---------------------------------------------------------------------------
// Strategy: Country
// ---------------------------------------------------------------------------

async function strategyCountry(
  dest: Destination,
  opts: StrategyOptions,
): Promise<StrategyResult> {
  const result: StrategyResult = { hero: null, gallery: [], allCandidates: [] };

  // 1. Knowledge Graph disambiguation
  if (opts.kgOpts) {
    try {
      const entity = await disambiguateDestination(dest.name, opts.kgOpts);
      if (entity) {
        result.kgEntity = entity;
        result.canonicalQuery = canonicalQueryFromEntity(entity);
        if (opts.verbose) console.log(`    [KG] Entity: "${entity.name}" (${entity.description})`);
      }
    } catch (err: any) {
      if (opts.verbose) console.log(`    [KG] Failed: ${err.message}`);
    }
  }

  // 2. Custom Search for hero (editorial quality)
  if (opts.cseOpts && !opts.skipCustomSearch) {
    const queries = countryHeroQueries(dest.name);
    const cseCandidates = await searchImagesMultiQuery(queries, opts.cseOpts, opts.delayMs);
    const filtered = filterStockPhotos(cseCandidates);
    const ranked = rankCandidates(filtered, dest.name, undefined, 'hero');
    result.allCandidates.push(...ranked);
    if (opts.verbose) console.log(`    [CSE] ${ranked.length} viable candidates from ${cseCandidates.length} results`);
  }

  // 3. Places API for gallery (landmarks, scenic spots)
  const placesQueries = countryPlacesQueries(dest.name);
  const { candidates: placesCandidates, placeId } = await fetchPlacesCandidates(placesQueries, opts.verbose);
  if (placeId) result.placesPlaceId = placeId;
  const rankedPlaces = rankCandidates(placesCandidates, dest.name, undefined, 'gallery');
  result.allCandidates.push(...rankedPlaces);

  // 4. Select hero (best across all sources)
  const allHero = rankCandidates(result.allCandidates, dest.name, undefined, 'hero');
  if (allHero.length > 0) result.hero = allHero[0];

  // 5. Select diverse gallery (excluding hero)
  const galleryPool = allHero.filter((c) => c.url !== result.hero?.url);
  result.gallery = selectDiverseGallery(galleryPool, 4);

  return result;
}

// ---------------------------------------------------------------------------
// Strategy: City
// ---------------------------------------------------------------------------

async function strategyCity(
  dest: Destination,
  opts: StrategyOptions,
): Promise<StrategyResult> {
  const result: StrategyResult = { hero: null, gallery: [], allCandidates: [] };

  // 1. Knowledge Graph
  if (opts.kgOpts) {
    try {
      const entity = await disambiguateDestination(dest.name, {
        ...opts.kgOpts,
        countryName: dest.countryName,
      });
      if (entity) {
        result.kgEntity = entity;
        result.canonicalQuery = canonicalQueryFromEntity(entity);
        if (opts.verbose) console.log(`    [KG] Entity: "${entity.name}" (${entity.description})`);
      }
    } catch (err: any) {
      if (opts.verbose) console.log(`    [KG] Failed: ${err.message}`);
    }
  }

  // 2. Places API first (efficient, good quality for cities)
  const placesQueries = cityPlacesQueries(dest.name, dest.countryName);
  const { candidates: placesCandidates, placeId } = await fetchPlacesCandidates(placesQueries, opts.verbose);
  if (placeId) result.placesPlaceId = placeId;
  const rankedPlaces = rankCandidates(placesCandidates, dest.name, dest.countryName, 'hero');
  result.allCandidates.push(...rankedPlaces);

  // 3. If Places hero doesn't meet threshold, try Custom Search
  const bestPlacesScore = rankedPlaces.length > 0 ? rankedPlaces[0].qualityScore : 0;
  if (opts.cseOpts && !opts.skipCustomSearch && bestPlacesScore < opts.qualityThreshold) {
    if (opts.verbose) console.log(`    [CSE] Places best=${bestPlacesScore} < threshold=${opts.qualityThreshold}, trying CSE`);
    const queries = cityHeroQueries(dest.name, dest.countryName);
    const cseCandidates = await searchImagesMultiQuery(queries, opts.cseOpts, opts.delayMs);
    const filtered = filterStockPhotos(cseCandidates);
    const ranked = rankCandidates(filtered, dest.name, dest.countryName, 'hero');
    result.allCandidates.push(...ranked);
  }

  // 4. Select hero
  const allHero = rankCandidates(result.allCandidates, dest.name, dest.countryName, 'hero');
  if (allHero.length > 0) result.hero = allHero[0];

  // 5. Gallery
  const galleryPool = rankCandidates(
    result.allCandidates.filter((c) => c.url !== result.hero?.url),
    dest.name,
    dest.countryName,
    'gallery',
  );
  result.gallery = selectDiverseGallery(galleryPool, 4);

  return result;
}

// ---------------------------------------------------------------------------
// Strategy: Neighborhood
// ---------------------------------------------------------------------------

async function strategyNeighborhood(
  dest: Destination,
  opts: StrategyOptions,
): Promise<StrategyResult> {
  const result: StrategyResult = { hero: null, gallery: [], allCandidates: [] };

  // 1. Knowledge Graph
  if (opts.kgOpts) {
    try {
      const entity = await disambiguateDestination(dest.name, {
        ...opts.kgOpts,
        countryName: dest.countryName,
        cityName: dest.cityName,
      });
      if (entity) {
        result.kgEntity = entity;
        result.canonicalQuery = canonicalQueryFromEntity(entity);
        if (opts.verbose) console.log(`    [KG] Entity: "${entity.name}" (${entity.description})`);
      }
    } catch (err: any) {
      if (opts.verbose) console.log(`    [KG] Failed: ${err.message}`);
    }
  }

  // 2. Places API first (most reliable for neighborhoods)
  const placesQueries = neighborhoodPlacesQueries(dest.name, dest.cityName);
  const { candidates: placesCandidates, placeId } = await fetchPlacesCandidates(placesQueries, opts.verbose);
  if (placeId) result.placesPlaceId = placeId;
  const rankedPlaces = rankCandidates(placesCandidates, dest.name, dest.countryName, 'hero');
  result.allCandidates.push(...rankedPlaces);

  // 3. Custom Search only if Places didn't produce enough
  if (opts.cseOpts && !opts.skipCustomSearch && rankedPlaces.length < 3) {
    const queries = neighborhoodCSEQueries(dest.name, dest.cityName);
    const cseCandidates = await searchImagesMultiQuery(queries, opts.cseOpts, opts.delayMs);
    const filtered = filterStockPhotos(cseCandidates);
    const ranked = rankCandidates(filtered, dest.name, dest.countryName, 'hero');
    result.allCandidates.push(...ranked);
  }

  // 4. Select hero + gallery
  const allCandidates = rankCandidates(result.allCandidates, dest.name, dest.countryName, 'hero');
  if (allCandidates.length > 0) result.hero = allCandidates[0];

  const galleryPool = allCandidates.filter((c) => c.url !== result.hero?.url);
  result.gallery = selectDiverseGallery(galleryPool, 4);

  return result;
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

/**
 * Execute the appropriate search strategy for a destination.
 */
export async function executeStrategy(
  dest: Destination,
  opts: StrategyOptions,
): Promise<StrategyResult> {
  switch (dest.type) {
    case 'country':
      return strategyCountry(dest, opts);
    case 'city':
      return strategyCity(dest, opts);
    case 'neighborhood':
      return strategyNeighborhood(dest, opts);
    default:
      throw new Error(`Unknown destination type: ${dest.type}`);
  }
}
