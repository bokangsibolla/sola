/**
 * Community API layer — Supabase queries for threads, replies, reactions, reports.
 * Follows the same pattern as data/trips/tripApi.ts.
 */

import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel } from '@/data/api';
import type {
  CommunityTopic,
  CommunityThread,
  ThreadWithAuthor,
  CommunityReply,
  ReplyWithAuthor,
  ThreadFeedParams,
  CreateThreadInput,
  CreateReplyInput,
  VoteDirection,
} from './types';

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export async function getCommunityTopics(): Promise<CommunityTopic[]> {
  const { data, error } = await supabase
    .from('community_topics')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return rowsToCamel<CommunityTopic>(data ?? []);
}

// ---------------------------------------------------------------------------
// Threads — Feed
// ---------------------------------------------------------------------------

export async function getThreadFeed(
  userId: string,
  params: ThreadFeedParams,
  blockedIds: string[] = [],
): Promise<ThreadWithAuthor[]> {
  const { countryId, cityId, topicId, searchQuery, sort, page, pageSize } = params;
  const offset = page * pageSize;

  // Build base query with joined author profile + place names
  let query = supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_profile_fkey(id, first_name, username, avatar_url),
      countries(name),
      cities(name, hero_image_url),
      community_topics(label)
    `)
    .eq('status', 'active')
    .eq('visibility', 'public');

  // Place filters
  if (countryId) query = query.eq('country_id', countryId);
  if (cityId) query = query.eq('city_id', cityId);
  if (topicId) query = query.eq('topic_id', topicId);

  // Full-text search
  if (searchQuery && searchQuery.trim()) {
    const escaped = searchQuery.trim().replace(/[&|!():*"'\\]/g, ' ');
    const tsQuery = escaped.trim().split(/\s+/).filter(Boolean).join(' & ');
    if (tsQuery) query = query.textSearch('search_vector', tsQuery);
  }

  // Exclude blocked users
  if (blockedIds.length > 0) {
    query = query.not('author_id', 'in', `(${blockedIds})`);
  }

  // Sort
  if (sort === 'new') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'top') {
    query = query.order('vote_score', { ascending: false });
  } else {
    // 'relevant' — pinned first, then by vote_score + recency blend
    query = query
      .order('pinned', { ascending: false })
      .order('vote_score', { ascending: false })
      .order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;

  // Fetch user's votes for these threads
  const threadIds = (data ?? []).map((t: any) => t.id);
  const userVotes = await getUserVotesForEntities(userId, 'thread', threadIds);

  return (data ?? []).map((row: any) => ({
    ...toCamel<CommunityThread>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      username: row.profiles?.username ?? null,
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    countryName: row.countries?.name ?? null,
    cityName: row.cities?.name ?? null,
    cityImageUrl: row.cities?.hero_image_url ?? null,
    topicLabel: row.community_topics?.label ?? null,
    userVote: userVotes.get(row.id) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Threads — Single
// ---------------------------------------------------------------------------

export async function getThread(
  userId: string,
  threadId: string,
): Promise<ThreadWithAuthor | null> {
  const { data, error } = await supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_profile_fkey(id, first_name, username, avatar_url),
      countries(name),
      cities(name, hero_image_url),
      community_topics(label)
    `)
    .eq('id', threadId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const userVotes = await getUserVotesForEntities(userId, 'thread', [threadId]);

  return {
    ...toCamel<CommunityThread>(data),
    author: {
      id: data.profiles?.id ?? data.author_id,
      firstName: data.profiles?.first_name ?? '',
      username: data.profiles?.username ?? null,
      avatarUrl: data.profiles?.avatar_url ?? null,
    },
    countryName: data.countries?.name ?? null,
    cityName: data.cities?.name ?? null,
    cityImageUrl: data.cities?.hero_image_url ?? null,
    topicLabel: data.community_topics?.label ?? null,
    userVote: userVotes.get(threadId) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Threads — Create / Update
// ---------------------------------------------------------------------------

export async function createThread(
  userId: string,
  input: CreateThreadInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('community_threads')
    .insert({
      author_id: userId,
      title: input.title,
      body: input.body,
      country_id: input.countryId ?? null,
      city_id: input.cityId ?? null,
      topic_id: input.topicId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateThread(
  threadId: string,
  updates: { title?: string; body?: string },
): Promise<void> {
  const { error } = await supabase
    .from('community_threads')
    .update(updates)
    .eq('id', threadId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Replies
// ---------------------------------------------------------------------------

export async function getThreadReplies(
  userId: string,
  threadId: string,
  blockedIds: string[] = [],
): Promise<ReplyWithAuthor[]> {
  let query = supabase
    .from('community_replies')
    .select(`
      *,
      profiles!community_replies_author_profile_fkey(id, first_name, username, avatar_url)
    `)
    .eq('thread_id', threadId)
    .eq('status', 'active')
    .order('vote_score', { ascending: false })
    .order('created_at', { ascending: true });

  if (blockedIds.length > 0) {
    query = query.not('author_id', 'in', `(${blockedIds})`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const replyIds = (data ?? []).map((r: any) => r.id);
  const userVotes = await getUserVotesForEntities(userId, 'reply', replyIds);

  return (data ?? []).map((row: any) => ({
    ...toCamel<CommunityReply>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      username: row.profiles?.username ?? null,
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    userVote: userVotes.get(row.id) ?? null,
  }));
}

export async function createReply(
  userId: string,
  input: CreateReplyInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('community_replies')
    .insert({
      thread_id: input.threadId,
      author_id: userId,
      body: input.body,
      parent_reply_id: input.parentReplyId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

// ---------------------------------------------------------------------------
// Votes (Up / Down)
// ---------------------------------------------------------------------------

async function getUserVotesForEntities(
  userId: string,
  entityType: 'thread' | 'reply',
  entityIds: string[],
): Promise<Map<string, 'up' | 'down'>> {
  if (entityIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from('community_reactions')
    .select('entity_id, vote')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .in('entity_id', entityIds);
  if (error) throw error;
  return new Map((data ?? []).map((r) => [r.entity_id, r.vote as 'up' | 'down']));
}

/**
 * Cast a vote on a thread or reply.
 * - Same direction as existing vote → remove vote (toggle off)
 * - Different direction → update vote
 * - No existing vote → insert new vote
 * Returns the resulting vote direction (null if removed).
 */
export async function castVote(
  userId: string,
  entityType: 'thread' | 'reply',
  entityId: string,
  direction: 'up' | 'down',
): Promise<VoteDirection> {
  const { data: existing } = await supabase
    .from('community_reactions')
    .select('id, vote')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();

  if (existing) {
    if (existing.vote === direction) {
      // Same direction — toggle off (remove)
      await supabase
        .from('community_reactions')
        .delete()
        .eq('id', existing.id);
      return null;
    } else {
      // Different direction — update
      await supabase
        .from('community_reactions')
        .update({ vote: direction })
        .eq('id', existing.id);
      return direction;
    }
  } else {
    // New vote
    await supabase
      .from('community_reactions')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        vote: direction,
      });
    return direction;
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function reportContent(
  userId: string,
  entityType: 'thread' | 'reply',
  entityId: string,
  reason: string,
  details?: string,
): Promise<void> {
  const { error } = await supabase
    .from('community_reports')
    .insert({
      reporter_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      details: details ?? null,
    });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// City Thread Previews (for city detail page)
// ---------------------------------------------------------------------------

/**
 * Fetch a small number of community threads for a specific city,
 * sorted by most relevant (pinned first, then vote_score + recency).
 * Returns lightweight thread data — no user votes needed.
 */
export async function getCityThreadPreviews(
  cityId: string,
  limit: number = 3,
): Promise<{ threads: ThreadWithAuthor[]; totalCount: number }> {
  // Get total count
  const { count, error: countError } = await supabase
    .from('community_threads')
    .select('id', { count: 'exact', head: true })
    .eq('city_id', cityId)
    .eq('status', 'active')
    .eq('visibility', 'public');
  if (countError) throw countError;

  // Get top threads
  const { data, error } = await supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_profile_fkey(id, first_name, username, avatar_url),
      countries(name),
      cities(name, hero_image_url),
      community_topics(label)
    `)
    .eq('city_id', cityId)
    .eq('status', 'active')
    .eq('visibility', 'public')
    .order('pinned', { ascending: false })
    .order('vote_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  const threads = (data ?? []).map((row: any) => ({
    ...toCamel<CommunityThread>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      username: row.profiles?.username ?? null,
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    countryName: row.countries?.name ?? null,
    cityName: row.cities?.name ?? null,
    cityImageUrl: row.cities?.hero_image_url ?? null,
    topicLabel: row.community_topics?.label ?? null,
    userVote: null,
  }));

  return { threads, totalCount: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Country Thread Previews (for country detail page)
// ---------------------------------------------------------------------------

/**
 * Fetch a small number of community threads for a specific country,
 * sorted by most relevant (pinned first, then vote_score + recency).
 * Returns lightweight thread data — no user votes needed.
 */
export async function getCountryThreadPreviews(
  countryId: string,
  limit: number = 3,
): Promise<{ threads: ThreadWithAuthor[]; totalCount: number }> {
  // Get total count
  const { count, error: countError } = await supabase
    .from('community_threads')
    .select('id', { count: 'exact', head: true })
    .eq('country_id', countryId)
    .eq('status', 'active')
    .eq('visibility', 'public');
  if (countError) throw countError;

  // Get top threads
  const { data, error } = await supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_profile_fkey(id, first_name, username, avatar_url),
      countries(name),
      cities(name, hero_image_url),
      community_topics(label)
    `)
    .eq('country_id', countryId)
    .eq('status', 'active')
    .eq('visibility', 'public')
    .order('pinned', { ascending: false })
    .order('vote_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  const threads = (data ?? []).map((row: any) => ({
    ...toCamel<CommunityThread>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      username: row.profiles?.username ?? null,
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    countryName: row.countries?.name ?? null,
    cityName: row.cities?.name ?? null,
    cityImageUrl: row.cities?.hero_image_url ?? null,
    topicLabel: row.community_topics?.label ?? null,
    userVote: null,
  }));

  return { threads, totalCount: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Place Filter — countries & cities that have active threads
// ---------------------------------------------------------------------------

/**
 * Fetch countries that have at least one active public thread.
 * Returns them ordered by the platform's country order_index.
 */
export async function getCountriesWithThreads(): Promise<
  { id: string; name: string }[]
> {
  // Get distinct country_ids from active threads
  const { data: threadRows, error: threadErr } = await supabase
    .from('community_threads')
    .select('country_id')
    .eq('status', 'active')
    .eq('visibility', 'public')
    .not('country_id', 'is', null);
  if (threadErr) throw threadErr;

  const countryIds = Array.from(
    new Set((threadRows ?? []).map((r: { country_id: string }) => r.country_id)),
  );
  if (countryIds.length === 0) return [];

  const { data, error } = await supabase
    .from('countries')
    .select('id, name')
    .in('id', countryIds)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }));
}

/**
 * Fetch cities within a country that have at least one active public thread.
 */
export async function getCitiesWithThreadsInCountry(
  countryId: string,
): Promise<{ id: string; name: string }[]> {
  const { data: threadRows, error: threadErr } = await supabase
    .from('community_threads')
    .select('city_id')
    .eq('status', 'active')
    .eq('visibility', 'public')
    .eq('country_id', countryId)
    .not('city_id', 'is', null);
  if (threadErr) throw threadErr;

  const cityIds = Array.from(
    new Set((threadRows ?? []).map((r: { city_id: string }) => r.city_id)),
  );
  if (cityIds.length === 0) return [];

  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .in('id', cityIds)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }));
}

// ---------------------------------------------------------------------------
// Place Lookups (for thread creation place selector)
// ---------------------------------------------------------------------------

export async function searchCommunityCountries(
  query: string,
  limit: number = 10,
): Promise<{ id: string; name: string; iso2: string }[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name, iso2')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .order('order_index')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, iso2: r.iso2 }));
}

export async function getCitiesForCountry(
  countryId: string,
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }));
}

// ---------------------------------------------------------------------------
// New Reply Activity — for tab badge + feed zone
// ---------------------------------------------------------------------------

/**
 * Count threads the user participated in that have new replies since a timestamp.
 * "Participated" = authored OR replied to.
 * Returns thread IDs + titles for display, plus total new reply count.
 */
export async function getNewCommunityActivity(
  userId: string,
  sinceTimestamp: string,
): Promise<{ newReplyCount: number; threads: { id: string; title: string }[] }> {
  // 1. Get thread IDs where user is author and have been updated
  const { data: authoredThreads } = await supabase
    .from('community_threads')
    .select('id, title, updated_at')
    .eq('author_id', userId)
    .eq('status', 'active')
    .gt('updated_at', sinceTimestamp)
    .order('updated_at', { ascending: false })
    .limit(10);

  // 2. Get thread IDs where user has replied
  const { data: repliedThreadIds } = await supabase
    .from('community_replies')
    .select('thread_id')
    .eq('author_id', userId)
    .eq('status', 'active');

  const repliedIds = Array.from(
    new Set((repliedThreadIds ?? []).map((r: { thread_id: string }) => r.thread_id))
  );

  // 3. Get threads user replied to that have new activity
  let repliedThreadsWithActivity: { id: string; title: string }[] = [];
  if (repliedIds.length > 0) {
    const { data } = await supabase
      .from('community_threads')
      .select('id, title, updated_at')
      .in('id', repliedIds)
      .eq('status', 'active')
      .gt('updated_at', sinceTimestamp)
      .order('updated_at', { ascending: false })
      .limit(10);
    repliedThreadsWithActivity = (data ?? []).map((t: { id: string; title: string }) => ({
      id: t.id,
      title: t.title,
    }));
  }

  // 4. Merge and deduplicate
  const threadMap = new Map<string, { id: string; title: string }>();
  for (const t of (authoredThreads ?? [])) {
    threadMap.set(t.id, { id: t.id, title: t.title });
  }
  for (const t of repliedThreadsWithActivity) {
    if (!threadMap.has(t.id)) {
      threadMap.set(t.id, t);
    }
  }

  const threads = Array.from(threadMap.values());
  return {
    newReplyCount: threads.length,
    threads: threads.slice(0, 3),
  };
}
