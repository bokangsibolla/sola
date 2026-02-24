/**
 * Together API layer -- Supabase queries for activity companion posts and requests.
 * Uses a two-step query approach: fetch posts first, then batch-fetch profiles.
 */

import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import type {
  TogetherPost,
  TogetherPostWithAuthor,
  TogetherRequest,
  TogetherRequestWithProfile,
  TogetherRequestStatus,
  TogetherFeedParams,
  CreateTogetherPostInput,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  first_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface ProfileTagRow {
  profile_id: string;
  tag_label: string;
}

/**
 * Batch-fetch profiles and their travel_style tags for a set of user IDs.
 */
async function batchFetchAuthors(
  userIds: string[],
): Promise<Map<string, TogetherPostWithAuthor['author']>> {
  const result = new Map<string, TogetherPostWithAuthor['author']>();
  if (userIds.length === 0) return result;

  const uniqueIds = Array.from(new Set(userIds));

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, avatar_url, bio')
    .in('id', uniqueIds);
  if (profilesError) throw profilesError;

  const { data: tags, error: tagsError } = await supabase
    .from('profile_tags')
    .select('profile_id, tag_label')
    .in('profile_id', uniqueIds)
    .eq('tag_group', 'travel_style');
  if (tagsError) throw tagsError;

  const tagsByProfile = new Map<string, string[]>();
  for (const tag of (tags ?? []) as ProfileTagRow[]) {
    const existing = tagsByProfile.get(tag.profile_id) ?? [];
    existing.push(tag.tag_label);
    tagsByProfile.set(tag.profile_id, existing);
  }

  for (const p of (profiles ?? []) as ProfileRow[]) {
    result.set(p.id, {
      id: p.id,
      firstName: p.first_name ?? '',
      avatarUrl: p.avatar_url ?? null,
      bio: p.bio ?? null,
      travelStyleTags: tagsByProfile.get(p.id) ?? [],
    });
  }

  return result;
}

function fallbackAuthor(userId: string): TogetherPostWithAuthor['author'] {
  return {
    id: userId,
    firstName: '',
    avatarUrl: null,
    bio: null,
    travelStyleTags: [],
  };
}

async function batchFetchCountryNames(
  iso2Codes: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = Array.from(new Set(iso2Codes.filter(Boolean)));
  if (unique.length === 0) return result;

  const { data, error } = await supabase
    .from('countries')
    .select('iso2, name')
    .in('iso2', unique);
  if (error) throw error;

  for (const row of data ?? []) {
    result.set(row.iso2, row.name);
  }
  return result;
}

async function batchFetchCityNames(
  cityIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = Array.from(new Set(cityIds.filter(Boolean)));
  if (unique.length === 0) return result;

  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .in('id', unique);
  if (error) throw error;

  for (const row of data ?? []) {
    result.set(row.id, row.name);
  }
  return result;
}

async function batchFetchRequestInfo(
  postIds: string[],
  userId: string,
): Promise<
  Map<
    string,
    {
      requestCount: number;
      acceptedCount: number;
      userRequestStatus: TogetherRequestStatus | null;
      userRequestId: string | null;
    }
  >
> {
  const result = new Map<
    string,
    {
      requestCount: number;
      acceptedCount: number;
      userRequestStatus: TogetherRequestStatus | null;
      userRequestId: string | null;
    }
  >();
  if (postIds.length === 0) return result;

  for (const pid of postIds) {
    result.set(pid, {
      requestCount: 0,
      acceptedCount: 0,
      userRequestStatus: null,
      userRequestId: null,
    });
  }

  const { data: requests, error } = await supabase
    .from('together_requests')
    .select('id, post_id, requester_id, status')
    .in('post_id', postIds);
  if (error) throw error;

  for (const req of requests ?? []) {
    const info = result.get(req.post_id);
    if (!info) continue;

    if (req.status !== 'cancelled') {
      info.requestCount++;
    }
    if (req.status === 'accepted') {
      info.acceptedCount++;
    }
    if (req.requester_id === userId) {
      info.userRequestStatus = req.status as TogetherRequestStatus;
      info.userRequestId = req.id;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

export async function getTogetherFeed(
  userId: string,
  params: TogetherFeedParams,
  blockedIds: string[],
): Promise<TogetherPostWithAuthor[]> {
  const { cityId, countryIso2, category, timeframe, page, pageSize } = params;
  const offset = page * pageSize;

  let query = supabase
    .from('together_posts')
    .select('*')
    .eq('status', 'open')
    .neq('user_id', userId);

  if (blockedIds.length > 0) {
    query = query.not('user_id', 'in', `(${blockedIds})`);
  }

  if (cityId) query = query.eq('city_id', cityId);
  if (countryIso2) query = query.eq('country_iso2', countryIso2);
  if (category) query = query.eq('activity_category', category);

  if (timeframe === 'today') {
    const today = new Date().toISOString().split('T')[0];
    query = query.eq('activity_date', today);
  } else if (timeframe === 'this_week') {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    query = query
      .gte('activity_date', today.toISOString().split('T')[0])
      .lte('activity_date', nextWeek.toISOString().split('T')[0]);
  } else if (timeframe === 'flexible') {
    query = query.eq('is_flexible', true);
  }

  query = query
    .order('activity_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userIds = rows.map((r: any) => r.user_id as string);
  const postIds = rows.map((r: any) => r.id as string);
  const cityIds = rows.map((r: any) => r.city_id as string).filter(Boolean);
  const iso2Codes = rows.map((r: any) => r.country_iso2 as string).filter(Boolean);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [authors, cityNames, countryNames, requestInfo] = await Promise.all([
    batchFetchAuthors(userIds),
    batchFetchCityNames(cityIds),
    batchFetchCountryNames(iso2Codes),
    batchFetchRequestInfo(postIds, userId),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return rows.map((row: any) => {
    const info = requestInfo.get(row.id);
    return {
      ...toCamel<TogetherPost>(row),
      author: authors.get(row.user_id) ?? fallbackAuthor(row.user_id),
      cityName: row.city_id ? (cityNames.get(row.city_id) ?? null) : null,
      countryName: row.country_iso2 ? (countryNames.get(row.country_iso2) ?? null) : null,
      requestCount: info?.requestCount ?? 0,
      acceptedCount: info?.acceptedCount ?? 0,
      userRequestStatus: info?.userRequestStatus ?? null,
      userRequestId: info?.userRequestId ?? null,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// ---------------------------------------------------------------------------
// Single Post
// ---------------------------------------------------------------------------

export async function getTogetherPost(
  userId: string,
  postId: string,
): Promise<TogetherPostWithAuthor | null> {
  const { data, error } = await supabase
    .from('together_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const cityIds = data.city_id ? [data.city_id] : [];
  const iso2Codes = data.country_iso2 ? [data.country_iso2] : [];

  const [authors, cityNames, countryNames, requestInfo] = await Promise.all([
    batchFetchAuthors([data.user_id]),
    batchFetchCityNames(cityIds),
    batchFetchCountryNames(iso2Codes),
    batchFetchRequestInfo([data.id], userId),
  ]);

  const info = requestInfo.get(data.id);

  return {
    ...toCamel<TogetherPost>(data),
    author: authors.get(data.user_id) ?? fallbackAuthor(data.user_id),
    cityName: data.city_id ? (cityNames.get(data.city_id) ?? null) : null,
    countryName: data.country_iso2 ? (countryNames.get(data.country_iso2) ?? null) : null,
    requestCount: info?.requestCount ?? 0,
    acceptedCount: info?.acceptedCount ?? 0,
    userRequestStatus: info?.userRequestStatus ?? null,
    userRequestId: info?.userRequestId ?? null,
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createTogetherPost(
  userId: string,
  input: CreateTogetherPostInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('together_posts')
    .insert({
      user_id: userId,
      post_type: input.postType,
      title: input.title,
      description: input.description ?? null,
      trip_id: input.tripId ?? null,
      itinerary_block_id: input.itineraryBlockId ?? null,
      city_id: input.cityId ?? null,
      country_iso2: input.countryIso2 ?? null,
      activity_date: input.activityDate ?? null,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
      is_flexible: input.isFlexible ?? false,
      activity_category: input.activityCategory,
      max_companions: input.maxCompanions ?? 2,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export async function getPostRequests(
  postId: string,
): Promise<TogetherRequestWithProfile[]> {
  const { data, error } = await supabase
    .from('together_requests')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const requesterIds = rows.map((r: any) => r.requester_id as string);
  const authors = await batchFetchAuthors(requesterIds);

  return rows.map((row: any) => ({
    ...toCamel<TogetherRequest>(row),
    requester: authors.get(row.requester_id) ?? fallbackAuthor(row.requester_id),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function sendJoinRequest(
  postId: string,
  requesterId: string,
  note?: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('together_requests')
    .insert({
      post_id: postId,
      requester_id: requesterId,
      note: note ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function respondToRequest(
  requestId: string,
  decision: 'accepted' | 'declined',
): Promise<void> {
  const { error } = await supabase
    .from('together_requests')
    .update({
      status: decision,
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId);
  if (error) throw error;
}
