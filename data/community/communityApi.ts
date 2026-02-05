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
      profiles!community_threads_author_id_fkey(id, first_name, avatar_url),
      countries!community_threads_country_id_fkey(name),
      cities!community_threads_city_id_fkey(name),
      community_topics!community_threads_topic_id_fkey(label)
    `)
    .eq('status', 'active')
    .eq('visibility', 'public');

  // Place filters
  if (countryId) query = query.eq('country_id', countryId);
  if (cityId) query = query.eq('city_id', cityId);
  if (topicId) query = query.eq('topic_id', topicId);

  // Full-text search
  if (searchQuery && searchQuery.trim()) {
    const tsQuery = searchQuery.trim().split(/\s+/).join(' & ');
    query = query.textSearch('search_vector', tsQuery);
  }

  // Exclude blocked users
  if (blockedIds.length > 0) {
    query = query.not('author_id', 'in', `(${blockedIds.join(',')})`);
  }

  // Sort
  if (sort === 'new') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'helpful') {
    query = query.order('helpful_count', { ascending: false });
  } else {
    // 'relevant' — pinned first, then by helpful + recency blend
    query = query
      .order('pinned', { ascending: false })
      .order('helpful_count', { ascending: false })
      .order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;

  // Fetch user's reactions for these threads
  const threadIds = (data ?? []).map((t: any) => t.id);
  const userReactions = await getUserReactionsForEntities(userId, 'thread', threadIds);

  return (data ?? []).map((row: any) => ({
    ...toCamel<CommunityThread>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    countryName: row.countries?.name ?? null,
    cityName: row.cities?.name ?? null,
    topicLabel: row.community_topics?.label ?? null,
    isHelpful: userReactions.has(row.id),
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
      profiles!community_threads_author_id_fkey(id, first_name, avatar_url),
      countries!community_threads_country_id_fkey(name),
      cities!community_threads_city_id_fkey(name),
      community_topics!community_threads_topic_id_fkey(label)
    `)
    .eq('id', threadId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const userReactions = await getUserReactionsForEntities(userId, 'thread', [threadId]);

  return {
    ...toCamel<CommunityThread>(data),
    author: {
      id: data.profiles?.id ?? data.author_id,
      firstName: data.profiles?.first_name ?? '',
      avatarUrl: data.profiles?.avatar_url ?? null,
    },
    countryName: data.countries?.name ?? null,
    cityName: data.cities?.name ?? null,
    topicLabel: data.community_topics?.label ?? null,
    isHelpful: userReactions.has(threadId),
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
      profiles!community_replies_author_id_fkey(id, first_name, avatar_url)
    `)
    .eq('thread_id', threadId)
    .eq('status', 'active')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: true });

  if (blockedIds.length > 0) {
    query = query.not('author_id', 'in', `(${blockedIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const replyIds = (data ?? []).map((r: any) => r.id);
  const userReactions = await getUserReactionsForEntities(userId, 'reply', replyIds);

  return (data ?? []).map((row: any) => ({
    ...toCamel<CommunityReply>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    isHelpful: userReactions.has(row.id),
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
// Reactions (Helpful)
// ---------------------------------------------------------------------------

async function getUserReactionsForEntities(
  userId: string,
  entityType: 'thread' | 'reply',
  entityIds: string[],
): Promise<Set<string>> {
  if (entityIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('community_reactions')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .in('entity_id', entityIds);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.entity_id));
}

export async function toggleHelpful(
  userId: string,
  entityType: 'thread' | 'reply',
  entityId: string,
): Promise<boolean> {
  // Check if already reacted
  const { data: existing } = await supabase
    .from('community_reactions')
    .select('id')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();

  if (existing) {
    // Remove reaction
    await supabase
      .from('community_reactions')
      .delete()
      .eq('id', existing.id);
    return false; // no longer helpful
  } else {
    // Add reaction
    await supabase
      .from('community_reactions')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
      });
    return true; // now helpful
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
