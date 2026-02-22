/**
 * Shared types for the image acquisition pipeline.
 */

/** Source of an image candidate */
export type ImageSourceType = 'places_photos' | 'custom_search';

/** License hint based on source domain analysis */
export type LicenseHint = 'unknown' | 'likely_restricted' | 'gov_tourism' | 'wikimedia_like';

/** Usage rights tracking status */
export type UsageRightsStatus = 'unknown' | 'needs_review' | 'ok_internal_testing';

/** Destination type for search strategy selection */
export type DestinationType = 'country' | 'city' | 'neighborhood';

/**
 * A single image candidate from any source, before final selection.
 */
export interface ImageCandidate {
  /** Source URL (Google Custom Search) or Places photo resource name */
  url: string;
  /** Which API produced this candidate */
  source: ImageSourceType;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Thumbnail URL for preview (Custom Search only) */
  thumbnailUrl?: string;
  /** Page title or image title */
  title?: string;
  /** Page where image was found (Custom Search only) */
  contextLink?: string;
  /** Photographer or publisher attribution */
  attribution?: string;
  /** File size in bytes (Custom Search only) */
  fileSize?: number;
  /** MIME type */
  mimeType?: string;
  /** Computed quality score 0-100 */
  qualityScore: number;
  /** License hint based on domain analysis */
  licenseHint: LicenseHint;
  /** Domain trust score 0.0-1.0 */
  domainTrust: number;
  /** Category tag for diversity: 'landscape', 'street', 'iconic', 'aerial', 'vibe' */
  visualCategory?: string;
}

/**
 * A destination row from Supabase (unified across countries/cities/areas).
 */
export interface Destination {
  id: string;
  type: DestinationType;
  name: string;
  slug: string;
  countryName?: string;
  cityName?: string;
  citySlug?: string;
  lat?: number;
  lng?: number;
  googlePlaceId?: string;
  canonicalQuery?: string;
  heroImageUrl?: string;
  imageCachedAt?: string;
}

/**
 * Final processed result for a destination.
 */
export interface PipelineResult {
  destinationId: string;
  destinationType: DestinationType;
  name: string;
  heroImage: ImageCandidate | null;
  galleryImages: ImageCandidate[];
  imageSource: ImageSourceType | 'mixed';
  canonicalQuery?: string;
  entityId?: string;
  status: 'enriched' | 'skipped' | 'failed';
  reason?: string;
}

/**
 * CLI flags for the pipeline.
 */
export interface PipelineFlags {
  type: DestinationType | 'all';
  limit: number;
  offset: number;
  dryRun: boolean;
  refresh: boolean;
  reviewCsv: boolean;
  delay: number;
  qualityThreshold: number;
  skipCustomSearch: boolean;
  verbose: boolean;
  country?: string;
  city?: string;
}
