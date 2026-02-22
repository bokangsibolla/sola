/**
 * Google Knowledge Graph Search API wrapper for entity disambiguation.
 *
 * Used to:
 * - Confirm the correct entity for a city/neighborhood name
 * - Resolve alternate spellings
 * - Get canonical names
 * - Disambiguate (e.g., "Paris" -> Paris, France vs Paris, Texas)
 *
 * API docs: https://developers.google.com/knowledge-graph/reference/rest/v1
 */

const KG_ENDPOINT = 'https://kgsearch.googleapis.com/v1/entities:search';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KGEntity {
  /** Knowledge Graph entity ID (e.g., "/m/0d0vqn") */
  entityId: string;
  /** Canonical name */
  name: string;
  /** Entity types (e.g., ["Place", "City", "Thing"]) */
  types: string[];
  /** Short description (e.g., "Capital of Thailand") */
  description?: string;
  /** Longer description from Wikipedia */
  detailedDescription?: string;
  /** URL to the entity's Wikipedia/website page */
  url?: string;
  /** Image URL from Knowledge Graph (if available) */
  imageUrl?: string;
  /** Confidence score from KG (0-1000+) */
  resultScore: number;
}

export interface KGSearchOptions {
  apiKey: string;
  /** Entity types to search for (default: ['Place']) */
  types?: string[];
  /** Max results (default: 3) */
  limit?: number;
  /** Language (default: 'en') */
  languages?: string[];
}

interface KGResponse {
  itemListElement?: Array<{
    result: {
      '@id': string;
      name: string;
      '@type': string | string[];
      description?: string;
      detailedDescription?: {
        articleBody: string;
        url: string;
        license: string;
      };
      image?: {
        contentUrl: string;
        url: string;
      };
    };
    resultScore: number;
  }>;
}

// ---------------------------------------------------------------------------
// Search functions
// ---------------------------------------------------------------------------

/**
 * Search the Knowledge Graph for entities matching a query.
 */
export async function searchEntity(
  query: string,
  opts: KGSearchOptions,
): Promise<KGEntity[]> {
  const params = new URLSearchParams({
    key: opts.apiKey,
    query,
    limit: String(opts.limit ?? 3),
  });

  const types = opts.types ?? ['Place'];
  for (const t of types) {
    params.append('types', t);
  }

  const langs = opts.languages ?? ['en'];
  for (const l of langs) {
    params.append('languages', l);
  }

  const url = `${KG_ENDPOINT}?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Knowledge Graph search failed (${res.status}): ${text}`);
  }

  const data: KGResponse = await res.json();

  return (data.itemListElement ?? []).map((item) => {
    const rawTypes = item.result['@type'];
    const types = Array.isArray(rawTypes) ? rawTypes : [rawTypes].filter(Boolean);

    return {
      entityId: (item.result['@id'] ?? '').replace('kg:', ''),
      name: item.result.name,
      types,
      description: item.result.description,
      detailedDescription: item.result.detailedDescription?.articleBody,
      url: item.result.detailedDescription?.url,
      imageUrl: item.result.image?.contentUrl,
      resultScore: item.resultScore,
    };
  });
}

/**
 * Disambiguate a destination name and return the best entity match.
 * Optionally constrains by country/city name to avoid wrong matches.
 */
export async function disambiguateDestination(
  name: string,
  opts: KGSearchOptions & {
    countryName?: string;
    cityName?: string;
  },
): Promise<KGEntity | null> {
  // Build a qualified query for better disambiguation
  const parts = [name];
  if (opts.cityName) parts.push(opts.cityName);
  if (opts.countryName) parts.push(opts.countryName);
  const query = parts.join(' ');

  const entities = await searchEntity(query, opts);
  if (entities.length === 0) return null;

  // If we have a country constraint, prefer entities whose description mentions it
  if (opts.countryName) {
    const countryLower = opts.countryName.toLowerCase();
    const match = entities.find((e) => {
      const desc = (e.description ?? '').toLowerCase();
      const detail = (e.detailedDescription ?? '').toLowerCase();
      return desc.includes(countryLower) || detail.includes(countryLower);
    });
    if (match) return match;
  }

  // Return highest confidence match
  return entities[0];
}

/**
 * Generate a canonical query string from KG entity data.
 */
export function canonicalQueryFromEntity(entity: KGEntity): string {
  if (entity.description) {
    return `${entity.name} ${entity.description}`;
  }
  return entity.name;
}
