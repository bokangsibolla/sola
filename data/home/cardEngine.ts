import type { Profile, ProfileTag } from '@/data/types';
import type { TripWithStops, GroupedTrips } from '@/data/trips/types';

// ── User State ──────────────────────────────────────────────────────────

export type UserState = 'new' | 'planning' | 'traveling' | 'returned' | 'idle';

// ── Card Types ──────────────────────────────────────────────────────────

export type CardType =
  | 'active_trip'
  | 'upcoming_trip'
  | 'trip_recap'
  | 'travel_map'
  | 'profile_progress'
  | 'stats_snapshot'
  | 'recommended_city'
  | 'collection'
  | 'trending_thread'
  | 'avatar_nudge'
  | 'interests_nudge'
  | 'first_trip_nudge'
  | 'verification_nudge'
  | 'community_banner';

export interface FeedCard {
  type: CardType;
  key: string;
  data?: Record<string, unknown>;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// ── State Detection ─────────────────────────────────────────────────────

export function getUserState(
  profile: Profile,
  trips: TripWithStops[],
): UserState {
  const now = new Date();
  const signupDate = new Date(profile.createdAt);
  const daysSinceSignup = diffDays(now, signupDate);

  const activeTrip = trips.find((t) => t.status === 'active');
  if (activeTrip) return 'traveling';

  const recentCompleted = trips.find(
    (t) =>
      t.status === 'completed' &&
      t.leaving &&
      diffDays(now, new Date(t.leaving)) <= 14,
  );
  if (recentCompleted) return 'returned';

  const plannedTrip = trips.find((t) => t.status === 'planned');
  if (plannedTrip) return 'planning';

  if (daysSinceSignup <= 7 && trips.length === 0) return 'new';

  return 'idle';
}

// ── Feed Assembly ───────────────────────────────────────────────────────

interface AssembleInput {
  state: UserState;
  profile: Profile;
  allTrips: TripWithStops[];
  grouped: GroupedTrips;
  profileTags: ProfileTag[];
}

export function assembleCards({
  state,
  profile,
  allTrips,
  grouped,
  profileTags,
}: AssembleInput): FeedCard[] {
  const cards: FeedCard[] = [];

  const hasAvatar = !!profile.avatarUrl;
  const hasInterests = profileTags.length > 0;
  const hasBio = !!profile.bio;

  switch (state) {
    case 'new':
      if (!hasAvatar || !hasInterests || !hasBio) {
        cards.push({
          type: 'profile_progress',
          key: 'profile_progress',
          data: { hasAvatar, hasInterests, hasBio },
        });
      }
      if (!hasAvatar) cards.push({ type: 'avatar_nudge', key: 'avatar_nudge' });
      if (!hasInterests) cards.push({ type: 'interests_nudge', key: 'interests_nudge' });
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      cards.push({ type: 'collection', key: 'collection_1' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      if (allTrips.length === 0) {
        cards.push({ type: 'first_trip_nudge', key: 'first_trip_nudge' });
      }
      break;

    case 'planning': {
      const upcoming = grouped.upcoming[0] ?? grouped.current;
      if (upcoming) {
        cards.push({
          type: 'upcoming_trip',
          key: 'upcoming_trip',
          data: { tripId: upcoming.id } as Record<string, unknown>,
        });
      }
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'collection', key: 'collection_1' });
      cards.push({ type: 'community_banner', key: 'community_banner' });
      break;
    }

    case 'traveling': {
      if (grouped.current) {
        cards.push({
          type: 'active_trip',
          key: 'active_trip',
          data: { tripId: grouped.current.id } as Record<string, unknown>,
        });
      }
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'community_banner', key: 'community_banner' });
      break;
    }

    case 'returned': {
      const recent = allTrips.find((t) => t.status === 'completed');
      if (recent) {
        cards.push({
          type: 'trip_recap',
          key: 'trip_recap',
          data: { tripId: recent.id } as Record<string, unknown>,
        });
      }
      if (allTrips.length > 0) {
        cards.push({
          type: 'stats_snapshot',
          key: 'stats',
          data: { tripCount: allTrips.length },
        });
      }
      cards.push({ type: 'travel_map', key: 'travel_map' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      break;
    }

    case 'idle':
    default:
      if (allTrips.length > 0) {
        cards.push({ type: 'travel_map', key: 'travel_map' });
        cards.push({
          type: 'stats_snapshot',
          key: 'stats',
          data: { tripCount: allTrips.length },
        });
      }
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      cards.push({ type: 'recommended_city', key: 'rec_city_2' });
      cards.push({ type: 'collection', key: 'collection_1' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'community_banner', key: 'community_banner' });
      // Rotate nudges for incomplete profiles
      if (!hasAvatar) {
        cards.push({ type: 'avatar_nudge', key: 'avatar_nudge' });
      } else if (!hasInterests) {
        cards.push({ type: 'interests_nudge', key: 'interests_nudge' });
      }
      break;
  }

  // Enforce max 8 cards per feed
  return cards.slice(0, 8);
}
