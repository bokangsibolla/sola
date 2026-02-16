import type { TripWithStops } from '@/data/trips/types';

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
