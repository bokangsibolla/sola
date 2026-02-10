import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/state/AuthContext';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppMode = 'discover' | 'travelling';

export interface ActiveTripInfo {
  tripId: string;
  city: {
    id: string | null;
    name: string;
    countryIso2: string;
  };
  arriving: string;
  leaving: string;
  daysLeft: number;
}

interface AppModeContextValue {
  mode: AppMode;
  activeTripInfo: ActiveTripInfo | null;
  setMode: (mode: AppMode) => void;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OVERRIDE_KEY = 'app_mode_override';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AppModeContext = createContext<AppModeContextValue>({
  mode: 'discover',
  activeTripInfo: null,
  setMode: () => {},
  loading: true,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeDaysLeft(leavingDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leaving = new Date(leavingDateStr);
  leaving.setHours(0, 0, 0, 0);
  const diffMs = leaving.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppModeProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [mode, setModeState] = useState<AppMode>('discover');
  const [activeTripInfo, setActiveTripInfo] = useState<ActiveTripInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setModeState('discover');
      setActiveTripInfo(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function detect() {
      try {
        const today = todayISO();

        // Query for trips where the user is currently travelling
        const { data: trips, error } = await supabase
          .from('trips')
          .select('id, destination_city_id, destination_name, country_iso2, arriving, leaving')
          .eq('user_id', userId!)
          .lte('arriving', today)
          .gte('leaving', today)
          .order('arriving', { ascending: true })
          .limit(1);

        if (error) throw error;
        if (cancelled) return;

        const activeTrip = trips && trips.length > 0 ? trips[0] : null;

        if (activeTrip) {
          const tripInfo: ActiveTripInfo = {
            tripId: activeTrip.id,
            city: {
              id: activeTrip.destination_city_id,
              name: activeTrip.destination_name ?? '',
              countryIso2: activeTrip.country_iso2 ?? '',
            },
            arriving: activeTrip.arriving,
            leaving: activeTrip.leaving,
            daysLeft: computeDaysLeft(activeTrip.leaving),
          };

          setActiveTripInfo(tripInfo);

          // Check for a stored override
          const override = await AsyncStorage.getItem(OVERRIDE_KEY);
          if (override === 'discover') {
            // User previously chose to stay in discover mode — respect it
            setModeState('discover');
          } else {
            setModeState('travelling');
          }
        } else {
          // No active trip — always discover mode
          setActiveTripInfo(null);
          setModeState('discover');

          // Clear any stale override since there's no active trip
          await AsyncStorage.removeItem(OVERRIDE_KEY);
        }
      } catch (err) {
        Sentry.captureException(err);
        // Fall back to discover mode on error
        if (!cancelled) {
          setModeState('discover');
          setActiveTripInfo(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    detect();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setMode = useCallback(
    (newMode: AppMode) => {
      setModeState(newMode);

      // Only persist override when there's an active trip
      // (i.e. user is overriding the auto-detection)
      if (activeTripInfo) {
        AsyncStorage.setItem(OVERRIDE_KEY, newMode).catch((err) =>
          Sentry.captureException(err),
        );
      }
    },
    [activeTripInfo],
  );

  return (
    <AppModeContext.Provider value={{ mode, activeTripInfo, setMode, loading }}>
      {children}
    </AppModeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppMode(): AppModeContextValue {
  return useContext(AppModeContext);
}
