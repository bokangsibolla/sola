// data/discover/useExploreData.ts
import { useState, useEffect, useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import { getCountries } from '../api';
import type { Country } from '../types';
import type { ContinentKey } from './types';
import { CONTINENT_LABELS, CONTINENT_ORDER } from './types';

interface ExploreData {
  featuredCountry: Country | null;
  countries: Country[];
  continents: { key: ContinentKey; label: string }[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Pick a featured country using date-seeded rotation.
 * If multiple countries have is_featured=true, rotates daily.
 * Returns null if none are featured.
 */
function pickFeaturedCountry(countries: Country[]): Country | null {
  const featured = countries.filter((c) => c.isFeatured);
  if (featured.length === 0) return null;
  if (featured.length === 1) return featured[0];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return featured[dayOfYear % featured.length];
}

/**
 * Extract unique continents from country list, in canonical order.
 * Only includes continents that have at least one country.
 */
function extractContinents(
  countries: Country[],
): { key: ContinentKey; label: string }[] {
  const present = new Set(
    countries
      .map((c) => c.continent)
      .filter((c): c is ContinentKey => c != null),
  );
  return CONTINENT_ORDER.filter((k) => present.has(k)).map((k) => ({
    key: k,
    label: CONTINENT_LABELS[k],
  }));
}

export function useExploreData(): ExploreData {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const countries = await getCountries();
        if (!cancelled) setAllCountries(countries);
      } catch (e) {
        if (!cancelled) {
          const err = e instanceof Error ? e : new Error('Failed to load countries');
          setError(err);
          Sentry.captureException(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const featuredCountry = useMemo(
    () => pickFeaturedCountry(allCountries),
    [allCountries],
  );

  const countries = useMemo(
    () =>
      featuredCountry
        ? allCountries.filter((c) => c.id !== featuredCountry.id)
        : allCountries,
    [allCountries, featuredCountry],
  );

  const continents = useMemo(() => extractContinents(countries), [countries]);

  return {
    featuredCountry,
    countries,
    continents,
    isLoading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
