# Notification System Design

**Date**: 2026-02-16
**Status**: Approved
**Branch**: `feature/home-dashboard-redesign`

## Overview

A unified notification system for Sola — surfacing community replies, connection requests, messages, and admin announcements through a minimal header icon and clean notification center screen.

## Decisions

| Decision | Choice |
|----------|--------|
| Icon placement | Left of MenuButton (two-icon right cluster) |
| Icon style | Minimal dot/circle indicator, 6px orange dot for unread, no count |
| Notification triggers | All 4: community replies, connections, messages, admin |
| Real-time | Supabase Realtime subscription |
| Mark-as-read | Bulk on screen open (not per-item) |

## Backend Schema

### `notifications` table

```sql
notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN (
                  'community_reply', 'connection_request', 'connection_accepted',
                  'new_message', 'admin_announcement'
                )),
  title         text NOT NULL,
  body          text,
  target_type   text,       -- 'thread', 'conversation', 'profile'
  target_id     uuid,
  actor_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read       boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
)
```

**Index**: `(user_id, is_read, created_at DESC)`
**RLS**: Users SELECT own rows only. Service-role/triggers INSERT.

### Trigger Functions

1. **community_reply** — `AFTER INSERT ON community_replies` → notify thread author (skip self-reply). Also notify parent reply author for nested replies (skip duplicates).
2. **connection_request** — `AFTER INSERT ON connection_requests` → notify receiver.
3. **connection_accepted** — `AFTER UPDATE ON connection_requests` (status → accepted) → notify sender.
4. **new_message** — `AFTER INSERT ON messages` → notify other participants. Deduplication: if unread notification exists for same conversation + actor, update instead of insert.
5. **admin_announcement** — Manual via Edge Function. Insert one row per user.

## Header Layout

```
[Logo]                    [NotificationButton] [MenuButton]
                              12px gap
```

- NotificationButton: 36×36pt container, 20×20pt outlined circle icon (1.5px stroke)
- Unread dot: 6px orange circle, top-right offset
- No count number
- Routes to `/home/notifications`
- Present on all tabs

## Notification Center Screen

**Route**: `app/(tabs)/home/notifications.tsx`

### Structure
- Header: "Activity" title with back arrow
- FlatList grouped by: Today / This week / Earlier
- Empty state: "You're all caught up" (textMuted, centered)

### NotificationRow
- Left: 36px actor avatar (or orange "S" for admin)
- Center: title (semiBold 14px) + body preview (regular 14px textMuted) + relative timestamp
- Unread: `orangeFill` background. Read: white background.
- Tap → deep-link to target

### Mark-as-read
- Opening screen marks ALL as read (single UPDATE query)
- Orange dot disappears immediately

## Realtime

- Subscribe to `notifications` table filtered by `user_id`
- On INSERT → invalidate React Query cache → dot appears instantly

## New Files

```
supabase/migrations/20260216_notifications_table.sql
supabase/migrations/20260216_notification_triggers.sql
data/notifications/types.ts
data/notifications/notificationsApi.ts
data/notifications/useNotifications.ts
data/notifications/useUnreadIndicator.ts
components/NotificationButton.tsx
components/notifications/NotificationRow.tsx
components/notifications/NotificationSectionHeader.tsx
app/(tabs)/home/notifications.tsx
```

## Modified Files

```
app/(tabs)/discover/index.tsx   — Add NotificationButton to rightComponent
app/(tabs)/connect/index.tsx    — Add NotificationButton to rightComponent
app/(tabs)/home/index.tsx       — Add NotificationButton to rightComponent
app/(tabs)/trips/index.tsx      — Add NotificationButton to rightComponent
```

## Implementation Order

1. Migration: notifications table + RLS + indexes
2. Migration: trigger functions for all 4 event types
3. Data layer: types → API → hooks
4. NotificationButton component with dot
5. Integrate into all tab headers
6. Notification center screen
7. Realtime subscription wiring
8. End-to-end testing

## Testing Checklist

- [ ] Community reply → notification for thread author
- [ ] Self-reply does NOT create notification
- [ ] Connection request → notification for receiver
- [ ] Connection accepted → notification for sender
- [ ] DM → notification for recipient
- [ ] Multiple DMs same conversation → deduplicates
- [ ] Admin announcement → all users receive
- [ ] Orange dot appears when unread exists
- [ ] Opening screen clears unread → dot disappears
- [ ] Tap notification → deep-links correctly
- [ ] RLS: users cannot see others' notifications
- [ ] Realtime: dot appears without refresh
- [ ] Empty state renders correctly
- [ ] TypeScript compiles clean
