/**
 * Wishlist hooks — main list + per-entity toggle.
 * Follows the same pattern as data/community/useCommunityFeed.ts.
 */

import { useCallback } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
} from './wishlistApi';
import type { WishlistEntityType, WishlistItemWithData } from './types';

// ---------------------------------------------------------------------------
// Main hook — full wishlist
// ---------------------------------------------------------------------------

interface UseWishlistReturn {
  items: WishlistItemWithData[];
  cities: WishlistItemWithData[];
  countries: WishlistItemWithData[];
  places: WishlistItemWithData[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  add: (entityType: WishlistEntityType, entityId: string) => Promise<void>;
  remove: (entityType: WishlistEntityType, entityId: string) => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    () => (userId ? getWishlistItems(userId) : Promise.resolve([])),
    ['wishlist', userId],
  );

  const items: WishlistItemWithData[] = data ?? [];

  // Derived filtered lists
  const cities = items.filter((i) => i.entityType === 'city');
  const countries = items.filter((i) => i.entityType === 'country');
  const places = items.filter((i) => i.entityType === 'place');

  const add = useCallback(
    async (entityType: WishlistEntityType, entityId: string) => {
      if (!userId) return;
      await addToWishlist(userId, entityType, entityId);
      refetch();
    },
    [userId, refetch],
  );

  const remove = useCallback(
    async (entityType: WishlistEntityType, entityId: string) => {
      if (!userId) return;
      await removeFromWishlist(userId, entityType, entityId);
      refetch();
    },
    [userId, refetch],
  );

  return { items, cities, countries, places, loading, error, refetch, add, remove };
}

// ---------------------------------------------------------------------------
// Per-entity hook — check + toggle
// ---------------------------------------------------------------------------

interface UseIsWishlistedReturn {
  wishlisted: boolean;
  toggle: () => Promise<void>;
  loading: boolean;
}

export function useIsWishlisted(
  entityType: WishlistEntityType,
  entityId: string,
): UseIsWishlistedReturn {
  const { items, add, remove, loading } = useWishlist();

  const wishlisted = items.some(
    (i) => i.entityType === entityType && i.entityId === entityId,
  );

  const toggle = useCallback(async () => {
    if (wishlisted) {
      await remove(entityType, entityId);
    } else {
      await add(entityType, entityId);
    }
  }, [wishlisted, entityType, entityId, add, remove]);

  return { wishlisted, toggle, loading };
}
