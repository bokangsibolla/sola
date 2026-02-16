import type { TripWithStops } from '@/data/trips/types';

// ── Saved place preview ─────────────────────────────────────────────────

export interface SavedPlacePreview {
  placeId: string;
  placeName: string;
  imageUrl: string | null;
  cityName: string | null;
}

// ── Personalized city recommendation ────────────────────────────────────

export interface PersonalizedCity {
  cityId: string;
  cityName: string;
  countryName: string;
  heroImageUrl: string | null;
  slug: string;
  affinityScore: number;
  planningCount: number;
  activityCount: number;
  soloLevel: string | null;
  avgDailyBudgetUsd: number | null;
  bestFor: string | null;
}

// ── Trip block state ────────────────────────────────────────────────────

export type TripBlockState =
  | { kind: 'active'; trip: TripWithStops; savedItemCount: number }
  | { kind: 'upcoming'; trip: TripWithStops; savedItemCount: number }
  | { kind: 'none' };

// ── Travel update ───────────────────────────────────────────────────────

export interface TravelUpdate {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'advisory' | 'alert';
}

// ── Community highlight ─────────────────────────────────────────────────

export interface CommunityHighlightThread {
  id: string;
  title: string;
  replyCount: number;
  topicLabel: string | null;
  cityName: string | null;
  author: { firstName: string; avatarUrl: string | null };
}

// ── Community highlight with city image ─────────────────────────────────

export interface CommunityHighlightThreadVisual extends CommunityHighlightThread {
  cityImageUrl: string | null;
}

// ── Featured city (hero fallback) ───────────────────────────────────────

export interface FeaturedCity {
  id: string;
  name: string;
  countryName: string;
  heroImageUrl: string;
  slug: string;
  shortBlurb: string | null;
  timezone: string;
}

// ── Hero state (state-aware hero card) ──────────────────────────────────

export type HeroState =
  | {
      kind: 'active';
      trip: TripWithStops;
      savedItemCount: number;
      cityImageUrl: string | null;
      cityTimezone: string | null;
      nextUpcoming: TripWithStops | null;
    }
  | {
      kind: 'upcoming';
      trip: TripWithStops;
      savedItemCount: number;
      cityImageUrl: string | null;
    }
  | {
      kind: 'featured';
      city: FeaturedCity;
      upcomingTrip: TripWithStops | null;
      upcomingCityImageUrl: string | null;
    };
