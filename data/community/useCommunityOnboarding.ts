/**
 * Hook to manage first-time Community experience state.
 * Reads from AsyncStorage (fast) with Supabase as source of truth.
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';

const KEYS = {
  SEEN_INTRO: '@sola:has_seen_community_intro',
  FIRST_POST: '@sola:has_created_first_post',
};

interface UseCommunityOnboardingReturn {
  showIntroBanner: boolean;
  showGuidedComposer: boolean;
  dismissIntro: () => void;
  markFirstPost: () => void;
  loading: boolean;
}

export function useCommunityOnboarding(): UseCommunityOnboardingReturn {
  const { userId } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [hasCreatedFirstPost, setHasCreatedFirstPost] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadFlags(userId);
  }, [userId]);

  async function loadFlags(uid: string) {
    try {
      // Try AsyncStorage first (fast)
      const [cachedIntro, cachedPost] = await Promise.all([
        AsyncStorage.getItem(KEYS.SEEN_INTRO),
        AsyncStorage.getItem(KEYS.FIRST_POST),
      ]);

      if (cachedIntro !== null && cachedPost !== null) {
        setHasSeenIntro(cachedIntro === 'true');
        setHasCreatedFirstPost(cachedPost === 'true');
        setLoading(false);
        return;
      }

      // Fall back to Supabase
      const { data } = await supabase
        .from('profiles')
        .select('has_seen_community_intro, has_created_first_post')
        .eq('id', uid)
        .single();

      const seenIntro = data?.has_seen_community_intro ?? false;
      const firstPost = data?.has_created_first_post ?? false;

      setHasSeenIntro(seenIntro);
      setHasCreatedFirstPost(firstPost);

      // Cache locally
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_INTRO, String(seenIntro)),
        AsyncStorage.setItem(KEYS.FIRST_POST, String(firstPost)),
      ]);
    } catch {
      // Default to not showing onboarding if we can't determine state
      setHasSeenIntro(true);
      setHasCreatedFirstPost(true);
    } finally {
      setLoading(false);
    }
  }

  const dismissIntro = useCallback(async () => {
    setHasSeenIntro(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_INTRO, 'true'),
        userId
          ? supabase
              .from('profiles')
              .update({ has_seen_community_intro: true })
              .eq('id', userId)
          : Promise.resolve(),
      ]);
    } catch {
      // Best-effort — local state already updated
    }
  }, [userId]);

  const markFirstPost = useCallback(async () => {
    setHasCreatedFirstPost(true);
    setHasSeenIntro(true); // Also dismiss intro on first post
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.FIRST_POST, 'true'),
        AsyncStorage.setItem(KEYS.SEEN_INTRO, 'true'),
        userId
          ? supabase
              .from('profiles')
              .update({
                has_created_first_post: true,
                has_seen_community_intro: true,
              })
              .eq('id', userId)
          : Promise.resolve(),
      ]);
    } catch {
      // Best-effort
    }
  }, [userId]);

  return {
    showIntroBanner: loading ? false : hasSeenIntro === false,
    showGuidedComposer: loading ? false : hasCreatedFirstPost === false,
    dismissIntro,
    markFirstPost,
    loading,
  };
}
