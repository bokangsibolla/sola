// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import type { FeedItem, EditorialCollection, CityWithCountry, ActivityWithCity } from './types';

// Mock editorial collections
const MOCK_EDITORIALS: EditorialCollection[] = [
  {
    id: '1',
    slug: 'first-solo-trips',
    title: 'Best destinations for your first solo trip',
    subtitle: 'For first-timers who want ease and charm',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 0,
  },
  {
    id: '2',
    slug: 'calm-beach-towns',
    title: 'Calm beach towns for slow travel',
    subtitle: 'Where the pace is gentle and the views are endless',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 1,
  },
  {
    id: '3',
    slug: 'cultural-capitals',
    title: 'Cultural capitals worth exploring',
    subtitle: 'Art, history, and unforgettable experiences',
    heroImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 2,
  },
];

// Static mock data - no API calls
const MOCK_FEED: FeedItem[] = [
  { type: 'editorial-collection', data: MOCK_EDITORIALS[0] },
  { type: 'editorial-collection', data: MOCK_EDITORIALS[1] },
  { type: 'editorial-collection', data: MOCK_EDITORIALS[2] },
  { type: 'end-card' },
];

interface UseFeedItemsResult {
  feedItems: FeedItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useFeedItems(): UseFeedItemsResult {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Instant load with static data - no API calls
    setFeedItems(MOCK_FEED);
    setIsLoading(false);
  }, []);

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setFeedItems(MOCK_FEED);
      setIsLoading(false);
    }, 300);
  };

  return { feedItems, isLoading, error: null, refresh };
}
