# Sola Connect — Design Document

**Date**: 2026-02-22
**Status**: Approved

## Core Positioning

Connect is trip-aware, structured, high-signal, permission-based. Not a social network. Not anonymous. Not influencer-driven.

---

## 1. Discovery Layer

### State Machine

```
User opens Travelers tab
  ├─ Has active/planned trip with matching_opt_in=true AND is_discoverable=true?
  │   └─ YES → Show tiered match sections + username search
  │   └─ NO  → Show empty state + username search only
```

### Empty State (no qualifying trip)

- Search bar at top (always visible)
- Warm illustration + copy: "Plan a trip to discover travelers heading your way"
- CTA button → navigates to Trips tab
- Below: list of existing connections for quick messaging

### Tiered Match Sections

| Tier | Section Title | Logic |
|------|--------------|-------|
| 1 | "Heading to [City] too" | Same city + overlapping dates on any trip stop |
| 2 | "Also traveling in [Country]" | Same country + overlapping dates, different city |
| 3 | "Nearby right now" | Location sharing enabled, within 50km, has active trip |
| 4 | "Similar travel style" | 2+ shared interests AND any date overlap in same region |

Each tier = horizontal scroll of TravelerCards. Only non-empty tiers render. All-empty fallback: "No matches yet — check back as your trip dates approach"

### Username Search

- Exact match only. No partial suggestions, no autocomplete dropdown.
- Submit on enter/search button. Returns single result or "No user found."
- Connection request allowed regardless of trip status.

### Visibility Controls

- **Global**: `is_discoverable` on profiles (master switch)
- **Per-trip**: `matching_opt_in` on trips table (granular control)
- Both must be ON for a trip to surface in matching
- All matching queries filter out blocked users

---

## 2. Connection Layer

### Profile Visibility Tiers

| Visitor Status | Visible Fields |
|---------------|----------------|
| Not connected | First name, avatar, current/upcoming destination, discussion activity, shared context label |
| Pending request | Above + bio |
| Mutually connected | Full profile: all trips, interests, visited countries, social links, travel style |

Non-connected visitors see blurred/locked section with "Connect to see full profile".

### Connection Request Flow

1. Sender taps "Connect" → optional message field (max 200 chars)
2. Request stored with auto-generated `context` (e.g. "You're both heading to Chiang Mai in March") + optional `message`
3. Receiver sees request in connections screen with context + message
4. Accept/Decline. Accepted → full profile access + DM capability.

### DB Change: connection_requests

Add column: `message text` (nullable, max 200 chars)

### Silent Removal

- New `removeConnection(requestId)` function
- Deletes the accepted connection_request row
- No notification to other user
- Other user loses full profile access + messaging ability
- Existing conversation becomes read-only

### Block = Instant Cleanup

New Postgres function `block_user_full(blocker_id, blocked_id)`:
1. Insert into `blocked_users`
2. Delete `connection_request` row (if any)
3. Delete all `messages` in shared conversation
4. Delete `conversation_read_state` rows
5. Delete the `conversation` row
6. No notification to blocked user

---

## 3. Messaging Layer

### Privacy Controls

- No read receipts exposed to other participant
- No typing indicators
- `read_at` column used internally for unread counts only

### User Message Deletion

- Long-press own message → "Delete" option
- Soft-delete: set `is_deleted = true`, display "[Message deleted]" placeholder
- Only sender can delete their own messages (RLS enforced)

### DB Change: messages

Add column: `is_deleted boolean DEFAULT false`

### 12-Month Retention Policy

pg_cron job runs weekly (Sunday 3am UTC):
- Find conversations where `last_message_at < now() - interval '12 months'`
- Delete messages, conversation_read_state, then conversation
- Connections remain intact
- New conversation created if users message again after expiry

### Blocking Cascade

- `block_user_full()` RPC handles immediate conversation + message deletion
- Connection removed atomically
- No trace visible to blocked user

---

## 4. Discussion Posting Rules

### Required Fields (enforced in composer)

- **Destination tag**: Country or city must be selected (required)
- **Topic tag**: At least one topic selected (required)
- **Title**: Minimum 10 characters
- **Post type**: Question, Tip, Experience, or Safety Alert (new field)

### DB Change: community_threads

Add column: `post_type text` (nullable for existing threads)

### Ranking Logic

**If user has active trip (sort = "Relevant")**:
1. Threads tagged with trip destination (city match > country match)
2. Threads with high helpful_count in last 30 days
3. Recent threads (last 7 days)

**If user has no active trip (sort = "Relevant")**:
1. Trending: helpful_count / age_hours (decay formula)
2. Recent threads (last 7 days)
3. Everything else by recency

**Sort options**: Relevant (trip-aware), New (chronological), Top (all-time helpful_count)

### Low-Effort Down-Ranking

Threads with `body.length < 50` AND `helpful_count = 0` after 48 hours pushed to bottom of feed. No automatic removal.

### AI Moderation

Deferred to post-launch. V1 relies on user reporting + admin review.

---

## 5. Implementation Summary

### Database Migrations Needed

1. `connection_requests`: add `message text` column
2. `messages`: add `is_deleted boolean DEFAULT false` column
3. `community_threads`: add `post_type text` column
4. New function: `block_user_full(blocker_uuid, blocked_uuid)` — transactional block + cleanup
5. New function: `remove_connection(request_uuid)` — silent connection removal
6. Enhanced view: `trip_overlap_matches` — include country-level matches
7. pg_cron job: `cleanup-stale-conversations` — 12-month retention

### Client Code Changes

1. **travelers/index.tsx** — Rewrite: trip-gated discovery, tiered sections, empty state
2. **travelers/user/[id].tsx** — Profile visibility gating by connection status
3. **data/travelers/useTravelersFeed.ts** — New tiered matching queries
4. **data/api.ts** — New functions: removeConnection, blockUserFull (RPC), deleteOwnMessage, enhanced matching queries
5. **travelers/dm/[id].tsx** — Message deletion UI (long-press), remove read receipt logic if any
6. **discussions/new.tsx** — Required fields enforcement, post type selector
7. **discussions/index.tsx** — Trip-aware ranking in "Relevant" sort
8. **Connection request UI** — Optional message field on send

### What Already Works (No Changes)

- Connection request accept/decline flow
- DM conversation creation + real-time messaging
- Blocking table structure
- Reporting system
- Notification badges
- Tab layout + navigation

---

## 6. Phased Rollout

### Phase 1: Foundation (DB + Safety)
- All migrations (columns, functions, cron job)
- `block_user_full()` RPC
- `remove_connection()` function
- Message deletion (soft-delete)

### Phase 2: Discovery Rewrite
- Trip-gated travelers tab
- Tiered matching sections
- Exact username search
- Empty state UX

### Phase 3: Profile Gating
- Visibility tiers on traveler profile
- Optional message on connection request

### Phase 4: Discussion Enhancements
- Required fields in composer
- Post type selector + badge
- Trip-aware ranking

### Phase 5: Polish
- Retention cron verification
- Edge cases (removed connections, expired conversations)
- QA across all flows
