/**
 * useHomeDashboard — Orchestrates all data for the home dashboard.
 * Returns trip state, saved collections, inbox preview, and metadata
 * for conditional section rendering.
 */

import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { useTrips } from '@/data/trips/useTrips';
import { useCommunityHighlights } from './useCommunityHighlights';
import { usePersonalizedInspiration } from './usePersonalizedInspiration';
import {
  getConversations,
  getCollections,
  getSavedPlacesWithDetails,
  getPlaceFirstImage,
  getExperiencesByCountry,
  getSocialSpotsByCountry,
  getProfileById,
} from '@/data/api';
import { getTripSavedItems } from '@/data/trips/tripApi';
import type { Collection, Conversation } from '@/data/types';
import type { TripWithStops } from '@/data/trips/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollectionPreview {
  id: string;
  name: string;
  emoji: string;
  placeCount: number;
  imageUrls: string[]; // up to 4 images for the grid
}

export interface InboxPreviewData {
  conversationId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  participantIds: string[];
}

export interface DestinationSuggestion {
  id: string;
  name: string;
  slug: string;
  placeType: string;
  imageUrl: string | null;
  cityName: string | null;
}

export interface SavedItemPreview {
  entityId: string;
  entityType: string;
  name: string;
  imageUrl: string | null;
  category: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHomeDashboard() {
  const { userId } = useAuth();
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useTrips();

  // Determine active trip (current > soonest upcoming)
  const activeTrip: TripWithStops | null = trips.current ?? trips.upcoming[0] ?? null;
  const hasTrip = activeTrip !== null;

  // Destination IDs from active trip
  const destinationCityId = activeTrip?.destinationCityId ?? null;
  const destinationCountryId = activeTrip?.countryIso2 ?? null;

  // Calculate days until trip
  const daysAway = (() => {
    if (!activeTrip?.arriving) return undefined;
    if (activeTrip.status === 'active') return undefined; // currently traveling
    const now = new Date();
    const arriving = new Date(activeTrip.arriving);
    const diffMs = arriving.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  })();

  // ---------------------------------------------------------------------------
  // User profile (for greeting)
  // ---------------------------------------------------------------------------

  const { data: profile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(undefined)),
    ['home-profile', userId ?? ''],
  );

  // ---------------------------------------------------------------------------
  // Saved places & collections
  // ---------------------------------------------------------------------------

  const { data: savedPlaces, loading: savedLoading, refetch: refetchSaved } = useData(
    () => (userId ? getSavedPlacesWithDetails(userId, 50) : Promise.resolve([])),
    ['home-saved-places', userId ?? ''],
  );

  const { data: collections, refetch: refetchCollections } = useData(
    () => (userId ? getCollections(userId) : Promise.resolve([])),
    ['home-collections', userId ?? ''],
  );

  // Build collection previews with image grids
  const { data: collectionPreviews } = useData(
    async (): Promise<CollectionPreview[]> => {
      if (!collections || !savedPlaces) return [];

      // Count places per collection
      const collectionCounts = new Map<string, number>();
      const collectionPlaceIds = new Map<string, string[]>();

      for (const sp of savedPlaces) {
        // We need to know which collection each place belongs to
        // For now, collections show total count from the collection itself
      }

      return collections.map((c: Collection) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        placeCount: 0, // Will be filled by a separate count
        imageUrls: [],
      }));
    },
    ['home-collection-previews', JSON.stringify(collections?.map((c: Collection) => c.id) ?? [])],
  );

  // ---------------------------------------------------------------------------
  // Inbox preview
  // ---------------------------------------------------------------------------

  const { data: conversations, refetch: refetchInbox } = useData<Conversation[]>(
    () => getConversations(),
    ['home-conversations'],
  );

  const inboxPreview: InboxPreviewData | null = (() => {
    if (!conversations || conversations.length === 0) return null;
    const latest = conversations[0];
    return {
      conversationId: latest.id,
      lastMessage: latest.lastMessage,
      lastMessageAt: latest.lastMessageAt,
      unreadCount: latest.unreadCount ?? 0,
      participantIds: latest.participantIds,
    };
  })();

  const totalUnread = conversations?.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0), 0
  ) ?? 0;

  // ---------------------------------------------------------------------------
  // Things to do (trip state only)
  // ---------------------------------------------------------------------------

  const { data: tripSavedItems } = useData(
    async (): Promise<SavedItemPreview[]> => {
      if (!activeTrip) return [];
      const items = await getTripSavedItems(activeTrip.id);
      // Enrich with names and images
      const previews: SavedItemPreview[] = [];
      for (const item of items.slice(0, 6)) {
        let imageUrl: string | null = null;
        let name = '';
        if (item.entityType === 'place') {
          try {
            imageUrl = await getPlaceFirstImage(item.entityId);
          } catch { /* non-critical */ }
          // Get place name
          const { data } = await (await import('@/lib/supabase')).supabase
            .from('places')
            .select('name')
            .eq('id', item.entityId)
            .maybeSingle();
          name = data?.name ?? '';
        }
        previews.push({
          entityId: item.entityId,
          entityType: item.entityType,
          name,
          imageUrl,
          category: item.category,
        });
      }
      return previews;
    },
    ['home-trip-saved-items', activeTrip?.id ?? ''],
  );

  const { data: destinationSuggestions } = useData(
    async (): Promise<DestinationSuggestion[]> => {
      if (!activeTrip) return [];

      // Get country ID from trip stops or country_iso2
      const firstStop = activeTrip.stops[0];
      const cityId = firstStop?.cityId ?? activeTrip.destinationCityId;

      if (!cityId) return [];

      // Get the city's country ID
      const { data: cityData } = await (await import('@/lib/supabase')).supabase
        .from('cities')
        .select('country_id, name')
        .eq('id', cityId)
        .maybeSingle();

      if (!cityData?.country_id) return [];

      // Get experiences + social spots
      const [experiences, socialSpots] = await Promise.all([
        getExperiencesByCountry(cityData.country_id, 4),
        getSocialSpotsByCountry(cityData.country_id, 4),
      ]);

      // Combine and deduplicate against saved items
      const savedIds = new Set((tripSavedItems ?? []).map((s) => s.entityId));
      const allPlaces = [...experiences, ...socialSpots]
        .filter((p) => !savedIds.has(p.id))
        .slice(0, 4);

      // Fetch images
      const suggestions: DestinationSuggestion[] = [];
      for (const place of allPlaces) {
        let imageUrl: string | null = null;
        try {
          imageUrl = await getPlaceFirstImage(place.id);
        } catch { /* non-critical */ }
        suggestions.push({
          id: place.id,
          name: place.name,
          slug: place.slug,
          placeType: place.placeType,
          imageUrl,
          cityName: (place as any).cityName ?? null,
        });
      }
      return suggestions;
    },
    ['home-destination-suggestions', activeTrip?.id ?? '', JSON.stringify(tripSavedItems?.map((s) => s.entityId) ?? [])],
  );

  // ---------------------------------------------------------------------------
  // Community highlights & inspiration (delegate to sub-hooks)
  // ---------------------------------------------------------------------------

  const { highlights: communityHighlights, refetch: refetchCommunity } =
    useCommunityHighlights(destinationCityId, destinationCountryId);

  const { items: inspirationItems, reason: inspirationReason, refetch: refetchInspiration } =
    usePersonalizedInspiration();

  // ---------------------------------------------------------------------------
  // Hero banner data
  // ---------------------------------------------------------------------------

  const { data: heroCityImage } = useData(
    async (): Promise<{ name: string; imageUrl: string | null } | null> => {
      if (activeTrip) {
        // Use trip destination image
        const cityId = activeTrip.destinationCityId ?? activeTrip.stops[0]?.cityId;
        if (!cityId) return { name: activeTrip.destinationName ?? '', imageUrl: null };

        const { data } = await (await import('@/lib/supabase')).supabase
          .from('cities')
          .select('name, hero_image_url')
          .eq('id', cityId)
          .maybeSingle();
        return {
          name: data?.name ?? activeTrip.destinationName ?? '',
          imageUrl: data?.hero_image_url ?? null,
        };
      }

      // No trip — random popular city for CTA
      const popular = await (await import('@/data/api')).getPopularCitiesWithCountry(6);
      if (popular.length === 0) return null;
      const random = popular[Math.floor(Math.random() * popular.length)];
      return {
        name: random.name,
        imageUrl: random.heroImageUrl ?? null,
      };
    },
    ['home-hero-image', activeTrip?.id ?? 'no-trip'],
  );

  // ---------------------------------------------------------------------------
  // Combined refetch
  // ---------------------------------------------------------------------------

  const refetchAll = () => {
    refetchTrips();
    refetchSaved();
    refetchCollections();
    refetchInbox();
    refetchCommunity();
    refetchInspiration();
  };

  const loading = tripsLoading || savedLoading;

  return {
    // User
    firstName: profile?.firstName ?? undefined,

    // State
    hasTrip,
    activeTrip,
    daysAway,

    // Hero
    heroCityImage,

    // Saved
    savedPlaces: savedPlaces ?? [],
    collections: collections ?? [],
    totalSavedCount: savedPlaces?.length ?? 0,

    // Things to do
    tripSavedItems: tripSavedItems ?? [],
    destinationSuggestions: destinationSuggestions ?? [],

    // Inbox
    inboxPreview,
    totalUnread,

    // Community
    communityHighlights,

    // Inspiration
    inspirationItems,
    inspirationReason,

    // Meta
    loading,
    refetchAll,
  };
}
