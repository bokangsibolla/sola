/**
 * Wishlist types — saved cities, countries, and places for future travel.
 */

export type WishlistEntityType = 'city' | 'country' | 'place';

export interface WishlistItem {
  id: string;
  userId: string;
  entityType: WishlistEntityType;
  entityId: string;
  notes: string | null;
  savedAt: string;
}

export interface WishlistItemWithData extends WishlistItem {
  name: string;
  imageUrl: string | null;
  countryIso2: string | null;
  slug: string | null;
}
