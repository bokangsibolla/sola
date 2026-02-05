/**
 * Hook for a single thread with its replies.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/state/AuthContext';
import { getThread, getThreadReplies } from './communityApi';
import { getBlockedUserIds } from '@/data/api';
import type { ThreadWithAuthor, ReplyWithAuthor } from './types';

interface UseThreadReturn {
  thread: ThreadWithAuthor | null;
  replies: ReplyWithAuthor[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useThread(threadId: string): UseThreadReturn {
  const { userId } = useAuth();
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId || !threadId) return;
    try {
      setLoading(true);
      const blockedIds = await getBlockedUserIds(userId);
      const [threadData, repliesData] = await Promise.all([
        getThread(userId, threadId),
        getThreadReplies(userId, threadId, blockedIds),
      ]);
      setThread(threadData);
      setReplies(repliesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load thread'));
    } finally {
      setLoading(false);
    }
  }, [userId, threadId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { thread, replies, loading, error, refresh: fetchData };
}
