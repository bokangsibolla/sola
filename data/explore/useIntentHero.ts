/**
 * Hook that computes the IntentHero state from user data.
 *
 * Determines one of four above-the-fold experiences:
 * - travelling: User has an active trip (from AppModeContext)
 * - upcoming:   User has a planned trip arriving within 30 days
 * - returning:  User has saved places (engaged user, no imminent trip)
 * - discovering: New user with no saves or trips
 *
 * All data is fetched from existing APIs. Nothing is hardcoded.
 */

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAppMode } from '@/state/AppModeContext';
import { useAuth } from '@/state/AuthContext';
import { supabase } from '@/lib/supabase';
import { getSavedPlaces } from '../api';
import type { SavedPlace } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HeroIntent = 'travelling' | 'upcoming' | 'returning' | 'discovering';

export interface UpcomingTripInfo {
  tripId: string;
  destinationName: string;
  destinationCityId: string | null;
  citySlug: string | null;
  countryIso2: string;
  daysUntil: number;
}

export interface SavedSummary {
  totalCount: number;
  cityIds: string[];
}

/** A highlighted destination to show returning users — rotates daily */
export interface HighlightedDestination {
  name: string;
  slug: string;
  /** Data-driven tagline, e.g. "Beginner-friendly · Very safe" */
  tagline: string;
  heroImageUrl: string | null;
  type: 'country' | 'city';
}

export interface IntentHeroData {
  /** Which hero variant to render */
  intent: HeroIntent;

  /** Active trip info — only set when intent === 'travelling' */
  travellingInfo: {
    cityName: string;
    daysLeft: number;
    dayNumber: number;
    countryIso2: string;
    savedInCityCount: number;
  } | null;

  /** Upcoming trip — only set when intent === 'upcoming' */
  upcomingTrip: UpcomingTripInfo | null;

  /** Saved places summary — set when intent === 'returning' */
  savedSummary: SavedSummary | null;

  /** Highlighted destination for returning users — rotates daily */
  highlighted: HighlightedDestination | null;

  /** Content stats — always available */
  contentStats: {
    countryCount: number;
    cityCount: number;
  };

  /** User first name from profile (for personalization) */
  firstName: string | null;

  /** Loading state */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UPCOMING_THRESHOLD_DAYS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function daysSince(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useIntentHero(): IntentHeroData {
  const { mode, activeTripInfo } = useAppMode();
  const { userId } = useAuth();

  const [intent, setIntent] = useState<HeroIntent>('discovering');
  const [upcomingTrip, setUpcomingTrip] = useState<UpcomingTripInfo | null>(null);
  const [savedSummary, setSavedSummary] = useState<SavedSummary | null>(null);
  const [highlighted, setHighlighted] = useState<HighlightedDestination | null>(null);
  const [contentStats, setContentStats] = useState({ countryCount: 0, cityCount: 0 });
  const [firstName, setFirstName] = useState<string | null>(null);
  const [savedInCityCount, setSavedInCityCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function compute() {
      try {
        setIsLoading(true);

        // Fetch content stats with lightweight count queries (not full data)
        const [countryCountResult, cityCountResult] = await Promise.all([
          supabase
            .from('countries')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase
            .from('cities')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
        ]);

        if (cancelled) return;

        const countryCount = countryCountResult.count ?? 0;
        const cityCount = cityCountResult.count ?? 0;
        setContentStats({ countryCount, cityCount });

        // If user is in travelling mode, that takes priority
        if (mode === 'travelling' && activeTripInfo) {
          // Fetch saved places count for the city
          let cityCount = 0;
          if (userId && activeTripInfo.city.id) {
            try {
              const { count } = await supabase
                .from('saved_places')
                .select('id, places!inner(city_id)', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('places.city_id', activeTripInfo.city.id);
              cityCount = count ?? 0;
            } catch {
              // Non-critical
            }
          }

          if (cancelled) return;

          setSavedInCityCount(cityCount);
          setIntent('travelling');
          return;
        }

        // For authenticated users, check for upcoming trips and saved places
        if (userId) {
          const [savedPlaces, profileResult, upcomingResult] = await Promise.all([
            getSavedPlaces(userId).catch(() => [] as SavedPlace[]),
            supabase
              .from('profiles')
              .select('first_name')
              .eq('id', userId)
              .maybeSingle(),
            supabase
              .from('trips')
              .select('id, destination_city_id, destination_name, country_iso2, arriving, leaving')
              .eq('user_id', userId)
              .eq('status', 'planned')
              .order('arriving', { ascending: true })
              .limit(5),
          ]);

          if (cancelled) return;

          // Set first name
          if (profileResult.data?.first_name) {
            setFirstName(profileResult.data.first_name);
          }

          // Check for upcoming trips within threshold
          const upcomingTrips = upcomingResult.data ?? [];
          const soonestTrip = upcomingTrips.find((t) => {
            if (!t.arriving) return false;
            const days = daysUntil(t.arriving);
            return days > 0 && days <= UPCOMING_THRESHOLD_DAYS;
          });

          if (soonestTrip && soonestTrip.arriving) {
            // Look up city slug for navigation
            let citySlug: string | null = null;
            if (soonestTrip.destination_city_id) {
              try {
                const { data: cityData } = await supabase
                  .from('cities')
                  .select('slug')
                  .eq('id', soonestTrip.destination_city_id)
                  .maybeSingle();
                citySlug = cityData?.slug ?? null;
              } catch {
                // Non-critical
              }
            }

            if (cancelled) return;

            setUpcomingTrip({
              tripId: soonestTrip.id,
              destinationName: soonestTrip.destination_name,
              destinationCityId: soonestTrip.destination_city_id,
              citySlug,
              countryIso2: soonestTrip.country_iso2,
              daysUntil: daysUntil(soonestTrip.arriving),
            });
            setIntent('upcoming');
            return;
          }

          // Check saved places
          if (savedPlaces.length > 0) {
            // Get unique city IDs from saved places
            const uniqueCityIds = new Set<string>();
            const placeIds = savedPlaces.map((sp) => sp.placeId);
            try {
              const { data: placesWithCity } = await supabase
                .from('places')
                .select('id, city_id')
                .in('id', placeIds.slice(0, 100));

              if (placesWithCity) {
                for (const p of placesWithCity) {
                  if (p.city_id) uniqueCityIds.add(p.city_id);
                }
              }
            } catch {
              // Non-critical
            }

            if (cancelled) return;

            setSavedSummary({
              totalCount: savedPlaces.length,
              cityIds: Array.from(uniqueCityIds),
            });

            // Build a highlighted destination — rotates daily, data-driven.
            // Only fetch country data here (for returning users) to avoid
            // duplicating the heavy getCountries() call in useFeedItems.
            try {
              const { data: featuredCountries } = await supabase
                .from('countries')
                .select('name, slug, hero_image_url, solo_level, safety_rating, is_featured')
                .eq('is_active', true)
                .not('hero_image_url', 'is', null)
                .order('is_featured', { ascending: false })
                .order('order_index', { ascending: true })
                .limit(20);

              if (cancelled) return;

              const pool = featuredCountries ?? [];
              if (pool.length > 0) {
                const dayIndex = new Date().getDate(); // 1-31
                const picked = pool[dayIndex % pool.length];
                const taglineParts: string[] = [];
                if (picked.solo_level) {
                  const levelLabels: Record<string, string> = {
                    beginner: 'Beginner-friendly',
                    intermediate: 'Intermediate',
                    expert: 'For experienced travelers',
                  };
                  taglineParts.push(levelLabels[picked.solo_level] ?? picked.solo_level);
                }
                if (picked.safety_rating) {
                  const safetyLabels: Record<string, string> = {
                    very_safe: 'Very safe',
                    generally_safe: 'Generally safe',
                    use_caution: 'Use caution',
                    exercise_caution: 'Exercise caution',
                  };
                  taglineParts.push(safetyLabels[picked.safety_rating] ?? '');
                }
                setHighlighted({
                  name: picked.name,
                  slug: picked.slug,
                  tagline: taglineParts.filter(Boolean).join(' \u00B7 ') || 'Solo travel guide',
                  heroImageUrl: picked.hero_image_url,
                  type: 'country',
                });
              }
            } catch {
              // Non-critical — hero will fall back to count-based display
            }

            setIntent('returning');
            return;
          }
        }

        // Default: new/unauthenticated user
        if (!cancelled) {
          setIntent('discovering');
        }
      } catch (err) {
        Sentry.captureException(err);
        // Fall back to discovering on error
        if (!cancelled) {
          setIntent('discovering');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    compute();
    return () => { cancelled = true; };
  }, [mode, activeTripInfo?.city?.id, userId]);

  // Build travelling info from activeTripInfo
  const travellingInfo = (mode === 'travelling' && activeTripInfo)
    ? {
        cityName: activeTripInfo.city.name,
        daysLeft: activeTripInfo.daysLeft,
        dayNumber: daysSince(activeTripInfo.arriving),
        countryIso2: activeTripInfo.city.countryIso2,
        savedInCityCount,
      }
    : null;

  return {
    intent,
    travellingInfo,
    upcomingTrip,
    savedSummary,
    highlighted,
    contentStats,
    firstName,
    isLoading,
  };
}
