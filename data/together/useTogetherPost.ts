/**
 * Hooks for Together post detail and user's own posts.
 *
 * useTogetherPost(postId) — full post detail with request management actions.
 * useMyTogetherPosts()    — current user's own posts list.
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getOrCreateConversation, sendMessage } from '@/data/api';
import {
  getTogetherPost,
  getMyTogetherPosts,
  getPostRequests,
  sendJoinRequest,
  cancelJoinRequest,
  respondToRequest,
  closeTogetherPost,
  deleteTogetherPost,
} from './togetherApi';
import type { TogetherPostWithAuthor, TogetherRequestWithProfile } from './types';

// ---------------------------------------------------------------------------
// useTogetherPost
// ---------------------------------------------------------------------------

interface UseTogetherPostReturn {
  post: TogetherPostWithAuthor | null;
  loading: boolean;
  error: Error | null;
  isOwner: boolean;
  requests: TogetherRequestWithProfile[];
  refetch: () => void;
  requestToJoin: (note?: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  acceptRequest: (requestId: string, requesterId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  closePost: () => Promise<void>;
  deletePost: () => Promise<void>;
}

export function useTogetherPost(postId: string): UseTogetherPostReturn {
  const { userId } = useAuth();

  // Fetch post detail
  const {
    data: post,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useData(
    () => (userId && postId ? getTogetherPost(userId, postId) : null),
    [userId, postId],
  );

  const isOwner = Boolean(post && userId && post.userId === userId);

  // Fetch requests only if user is the post owner
  const {
    data: requestsData,
    loading: requestsLoading,
    refetch: refetchRequests,
  } = useData(
    () => (isOwner && postId ? getPostRequests(postId) : null),
    [isOwner, postId],
  );

  const requests = useMemo(
    () => requestsData ?? [],
    [requestsData],
  );

  const refetch = useCallback(() => {
    refetchPost();
    if (isOwner) refetchRequests();
  }, [refetchPost, refetchRequests, isOwner]);

  // Actions

  const requestToJoin = useCallback(
    async (note?: string) => {
      if (!userId || !postId) return;
      await sendJoinRequest(postId, userId, note);
      refetchPost();
    },
    [userId, postId, refetchPost],
  );

  const cancelRequest = useCallback(
    async (requestId: string) => {
      await cancelJoinRequest(requestId);
      refetchPost();
    },
    [refetchPost],
  );

  const acceptRequest = useCallback(
    async (requestId: string, requesterId: string) => {
      if (!userId || !post) return;

      // Accept the request
      await respondToRequest(requestId, 'accepted');

      // Auto-create DM with activity context
      const convoId = await getOrCreateConversation(userId, requesterId);

      // Build context message
      const parts: string[] = [];
      if (post.title) parts.push(post.title);
      if (post.activityDate) parts.push(post.activityDate);
      if (post.startTime) parts.push(post.startTime.slice(0, 5)); // "HH:MM"

      const contextMessage =
        parts.length > 1
          ? `You're both going to ${parts[0]} \u2014 ${parts.slice(1).join(', ')}`
          : `You're both going to ${parts[0] ?? 'an activity'}`;

      await sendMessage(convoId, userId, contextMessage);

      refetch();
    },
    [userId, post, refetch],
  );

  const declineRequest = useCallback(
    async (requestId: string) => {
      await respondToRequest(requestId, 'declined');
      refetch();
    },
    [refetch],
  );

  const closePost = useCallback(async () => {
    if (!postId) return;
    await closeTogetherPost(postId);
    refetchPost();
  }, [postId, refetchPost]);

  const deletePost = useCallback(async () => {
    if (!postId) return;
    await deleteTogetherPost(postId);
    // No refetch — screen will navigate away after deletion
  }, [postId]);

  return {
    post,
    loading: postLoading || requestsLoading,
    error: postError,
    isOwner,
    requests,
    refetch,
    requestToJoin,
    cancelRequest,
    acceptRequest,
    declineRequest,
    closePost,
    deletePost,
  };
}

// ---------------------------------------------------------------------------
// useMyTogetherPosts
// ---------------------------------------------------------------------------

interface UseMyTogetherPostsReturn {
  posts: TogetherPostWithAuthor[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMyTogetherPosts(): UseMyTogetherPostsReturn {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    () => (userId ? getMyTogetherPosts(userId) : []),
    [userId],
  );

  return {
    posts: data ?? [],
    loading,
    error,
    refetch,
  };
}
