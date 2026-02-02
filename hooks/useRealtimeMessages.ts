import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import type { Message } from '@/data/types';

/**
 * Subscribes to new messages in a conversation via Supabase Realtime.
 * Calls `onMessage` for each INSERT so the screen can append it to local state.
 */
export function useRealtimeMessages(
  conversationId: string | undefined,
  currentUserId: string | null,
  onMessage: (msg: Message) => void,
) {
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = toCamel<Message>(payload.new);
          // Only append messages from other users — we already add our own optimistically
          if (msg.senderId !== currentUserId) {
            onMessage(msg);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, onMessage]);
}
