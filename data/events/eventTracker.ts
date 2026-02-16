import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { EventType, EntityType, UserEvent } from './types';

const FLUSH_INTERVAL_MS = 10_000;
const MAX_QUEUE_SIZE = 20;

class EventTracker {
  private queue: UserEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  /** Call once after auth to start tracking */
  init(userId: string) {
    this.userId = userId;
    this.startFlushTimer();
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /** Call on sign-out to stop tracking and flush remaining */
  destroy() {
    this.flush();
    this.userId = null;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /** Track a user event */
  track(
    eventType: EventType,
    entityType?: EntityType | null,
    entityId?: string | null,
    metadata?: Record<string, unknown>,
  ) {
    if (!this.userId) return;

    this.queue.push({
      user_id: this.userId,
      event_type: eventType,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
      created_at: new Date().toISOString(),
    });

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  /** Flush queued events to Supabase */
  flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);

    // Fire and forget — don't block the UI
    supabase
      .from('user_events')
      .insert(batch)
      .then(({ error }) => {
        if (error) {
          // Put events back at front of queue for retry
          this.queue.unshift(...batch);
        }
      });
  }

  private startFlushTimer() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') {
      this.flush();
    }
  };
}

/** Singleton instance — import and use everywhere */
export const eventTracker = new EventTracker();
