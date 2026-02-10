/**
 * Hook to manage first-time Explore mode education state.
 * Reads from AsyncStorage (fast) with Supabase as source of truth.
 *
 * Controls two dismissible touchpoints:
 * - ExploreModesCard (explains Discover / Travelling modes)
 * - TripPromptCard (nudges trip logging when user has no trips)
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';

const KEYS = {
  SEEN_MODES: '@sola:has_seen_explore_modes',
  SEEN_TRIP_PROMPT: '@sola:has_seen_trip_prompt',
};

interface UseExploreOnboardingReturn {
  showModesCard: boolean;
  dismissModesCard: () => void;
  showTripPrompt: boolean;
  dismissTripPrompt: () => void;
  loading: boolean;
}

export function useExploreOnboarding(): UseExploreOnboardingReturn {
  const { userId } = useAuth();
  const [hasSeenModes, setHasSeenModes] = useState<boolean | null>(null);
  const [hasSeenTripPrompt, setHasSeenTripPrompt] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadFlags(userId);
  }, [userId]);

  async function loadFlags(uid: string) {
    try {
      // Try AsyncStorage first (fast)
      const [cachedModes, cachedTrip] = await Promise.all([
        AsyncStorage.getItem(KEYS.SEEN_MODES),
        AsyncStorage.getItem(KEYS.SEEN_TRIP_PROMPT),
      ]);

      if (cachedModes !== null && cachedTrip !== null) {
        setHasSeenModes(cachedModes === 'true');
        setHasSeenTripPrompt(cachedTrip === 'true');
        setLoading(false);
        return;
      }

      // Fall back to Supabase
      const { data } = await supabase
        .from('profiles')
        .select('has_seen_explore_modes, has_seen_trip_prompt')
        .eq('id', uid)
        .single();

      const seenModes = data?.has_seen_explore_modes ?? false;
      const seenTrip = data?.has_seen_trip_prompt ?? false;

      setHasSeenModes(seenModes);
      setHasSeenTripPrompt(seenTrip);

      // Cache locally
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_MODES, String(seenModes)),
        AsyncStorage.setItem(KEYS.SEEN_TRIP_PROMPT, String(seenTrip)),
      ]);
    } catch {
      // Default to not showing onboarding if we can't determine state
      setHasSeenModes(true);
      setHasSeenTripPrompt(true);
    } finally {
      setLoading(false);
    }
  }

  const dismissModesCard = useCallback(async () => {
    setHasSeenModes(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_MODES, 'true'),
        userId
          ? supabase
              .from('profiles')
              .update({ has_seen_explore_modes: true })
              .eq('id', userId)
          : Promise.resolve(),
      ]);
    } catch {
      // Best-effort — local state already updated
    }
  }, [userId]);

  const dismissTripPrompt = useCallback(async () => {
    setHasSeenTripPrompt(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_TRIP_PROMPT, 'true'),
        userId
          ? supabase
              .from('profiles')
              .update({ has_seen_trip_prompt: true })
              .eq('id', userId)
          : Promise.resolve(),
      ]);
    } catch {
      // Best-effort — local state already updated
    }
  }, [userId]);

  return {
    showModesCard: loading ? false : hasSeenModes === false,
    dismissModesCard,
    showTripPrompt: loading ? false : hasSeenTripPrompt === false,
    dismissTripPrompt,
    loading,
  };
}
