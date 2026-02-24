/**
 * Hooks for Together post detail and My Posts.
 */

import { useCallback } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getTogetherPost,
  getPostRequests,
  getMyTogetherPosts,
  sendJoinRequest,
  cancelJoinRequest,
  respondToRequest,
  closeTogetherPost,
  deleteTogetherPost,
} from './togetherApi';
import { getOrCreateConversation, sendMessage } from '@/data/api';
import type { TogetherPostWithAuthor, TogetherRequestWithProfile } from './types';

// ---------------------------------------------------------------------------
// Single Post Detail
// ---------------------------------------------------------------------------

export function useTogetherPost(postId: string) {
  const { userId } = useAuth();

  const {
    data: post,
    loading,
    error,
    refetch,
  } = useData(
    () => (userId && postId ? getTogetherPost(userId, postId) : Promise.resolve(null)),
    [userId, postId],
  );

  const isOwner = !!(post && userId && post.userId === userId);

  const { data: requests, refetch: refetchRequests } = useData(
    () => (isOwner && postId ? getPostRequests(postId) : Promise.resolve([] as TogetherRequestWithProfile[])),
    [isOwner, postId],
  );

  const requestToJoin = useCallback(
    async (note?: string) => {
      if (!userId) return;
      await sendJoinRequest(postId, userId, note);
      refetch();
    },
    [userId, postId, refetch],
  );

  const cancelRequest = useCallback(
    async (requestId: string) => {
      await cancelJoinRequest(requestId);
      refetch();
    },
    [refetch],
  );

  const acceptRequest = useCallback(
    async (requestId: string, requesterId: string) => {
      if (!userId || !post) return;
      await respondToRequest(requestId, 'accepted');

      // Auto-create DM with activity context
      const convoId = await getOrCreateConversation(userId, requesterId);
      const datePart = post.activityDate ? ` - ${post.activityDate}` : '';
      const timePart = post.startTime ? `, ${post.startTime.slice(0, 5)}` : '';
      const contextMsg = `You're both going to ${post.title}${datePart}${timePart}`;
      await sendMessage(convoId, userId, contextMsg);

      refetchRequests();
      refetch();
    },
    [userId, post, refetch, refetchRequests],
  );

  const declineRequest = useCallback(
    async (requestId: string) => {
      await respondToRequest(requestId, 'declined');
      refetchRequests();
      refetch();
    },
    [refetch, refetchRequests],
  );

  const closePost = useCallback(async () => {
    await closeTogetherPost(postId);
    refetch();
  }, [postId, refetch]);

  const deletePost = useCallback(async () => {
    await deleteTogetherPost(postId);
  }, [postId]);

  return {
    post,
    loading,
    error,
    isOwner,
    requests: requests ?? [],
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
// My Posts
// ---------------------------------------------------------------------------

export function useMyTogetherPosts() {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    () => (userId ? getMyTogetherPosts(userId) : Promise.resolve([] as TogetherPostWithAuthor[])),
    [userId],
  );

  return {
    posts: data ?? [],
    loading,
    error,
    refetch,
  };
}
