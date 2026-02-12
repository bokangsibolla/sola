/**
 * useCommunityHighlights — Fetch 2 relevant community threads for home dashboard.
 * Priority: trip destinations > user participation > recent + high engagement.
 */

import { useData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommunityHighlight {
  id: string;
  title: string;
  body: string;
  replyCount: number;
  createdAt: string;
  authorName: string;
  authorType: string; // 'user' | 'system'
  cityName: string | null;
  countryName: string | null;
  cityImageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCommunityHighlights(
  destinationCityId?: string | null,
  destinationCountryId?: string | null,
) {
  const { userId } = useAuth();

  const fetcher = async (): Promise<CommunityHighlight[]> => {
    if (!userId) return [];

    // Fetch 6 active threads with author + place names
    const { data, error } = await supabase
      .from('community_threads')
      .select(`
        id,
        title,
        body,
        reply_count,
        created_at,
        author_type,
        pinned,
        vote_score,
        city_id,
        country_id,
        profiles!community_threads_author_profile_fkey(first_name),
        cities(name, hero_image_url),
        countries(name)
      `)
      .eq('status', 'active')
      .eq('visibility', 'public')
      .order('pinned', { ascending: false })
      .order('vote_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    // Map to CommunityHighlight shape
    const threads: (CommunityHighlight & {
      cityId: string | null;
      countryId: string | null;
      pinned: boolean;
      voteScore: number;
    })[] = (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body ?? '',
      replyCount: row.reply_count ?? 0,
      createdAt: row.created_at,
      authorName: row.profiles?.first_name ?? 'Sola Team',
      authorType: row.author_type ?? 'user',
      cityName: row.cities?.name ?? null,
      countryName: row.countries?.name ?? null,
      cityImageUrl: row.cities?.hero_image_url ?? null,
      cityId: row.city_id,
      countryId: row.country_id,
      pinned: row.pinned ?? false,
      voteScore: row.vote_score ?? 0,
    }));

    // Priority scoring (higher = better)
    const scored = threads.map((thread) => {
      let score = 0;

      // 1. Match trip destination (highest priority)
      if (destinationCityId && thread.cityId === destinationCityId) {
        score += 1000;
      } else if (destinationCountryId && thread.countryId === destinationCountryId) {
        score += 500;
      }

      // 2. Engagement signals
      if (thread.pinned) score += 100;
      score += thread.voteScore * 2;
      score += thread.replyCount * 3;

      // 3. Recency (decay over 30 days)
      const ageMs = Date.now() - new Date(thread.createdAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      if (ageDays < 30) {
        score += Math.max(0, 50 - ageDays);
      }

      return { thread, score };
    });

    // Sort by score (desc) and take top 2
    scored.sort((a, b) => b.score - a.score);
    const top2 = scored.slice(0, 2).map((s) => s.thread);

    // Remove extra fields used for scoring
    return top2.map(({ cityId, countryId, pinned, voteScore, ...highlight }) => highlight);
  };

  const { data, loading, refetch } = useData(
    fetcher,
    [userId, destinationCityId, destinationCountryId],
  );

  return {
    highlights: data ?? [],
    loading,
    refetch,
  };
}
