# Verification UX, Notifications & Admin Tab

**Date**: 2026-02-24
**Status**: Approved

## Problem

1. Unverified users can't post, connect, or message — but the app only tells them via an alert *after* they tap the button. Confusing.
2. When verification is approved/rejected, the user has no way to know.
3. Admin tools are buried in Settings > Admin. No badge counts, no quick access.

## Design

### 1. Verification Banners (User-Facing)

Reusable `<VerificationBanner />` component. Reads `verificationStatus` from auth context.

**States:**

| Status | Background | Text | Action |
|--------|-----------|------|--------|
| `unverified` | `orangeFill` | "Verify your identity to [post/connect/message]" | "Verify Now" → selfie flow |
| `pending` | `neutralFill` | "Your identity verification is being reviewed. Usually 24–48 hours." | None |
| `rejected` | soft warning | "Your verification wasn't approved. Please try again with a clearer photo." | "Try Again" → selfie flow |
| `verified` | — | — | Banner hidden |

**Placement (3 action points):**

1. **Community composer** (`discussions/new.tsx`) — Banner replaces the compose form entirely. Unverified users see the banner instead of the text input.
2. **Traveler profile** (`travelers/user/[id].tsx`) — Banner above Connect/Message buttons; both buttons disabled (muted).
3. **Message input** — Banner replaces the input area.

**Cleanup:** Remove existing `requireVerification()` alert calls since banners handle messaging proactively.

### 2. Verification Outcome Notifications

**New notification types:**
- `'verification_approved'`
- `'verification_rejected'`

Add to `notifications.type` CHECK constraint.

**Database trigger:** `notify_on_verification_decision()`
- Fires on UPDATE of `profiles` when `verification_status` changes to `'verified'` or `'rejected'`
- Approved: title="Your identity has been verified", body="You can now post, connect, and message other travelers."
- Rejected: title="Verification update", body="Your identity verification wasn't approved. You can try again with a clearer photo.", target_type='profile'

**Push notification:** New edge function `push-on-verification` or extend existing push infra to listen for verification notification inserts and send via Expo Push API.

**In-app:** No code change needed — existing `getNotifications()` already fetches all types.

### 3. Admin Tab

5th tab in TabBar, visible only when `profile.isAdmin === true`.

**Icon:** `shield-outline` (inactive) / `shield` (active) — Ionicons.

**Badge:** Red badge with total count of pending items (verifications + unresolved reports). Uses `useAdminPendingCount()` hook.

**File structure:**
```
app/(tabs)/admin/
  _layout.tsx           — Stack navigator
  index.tsx             — Dashboard with section cards
  verifications.tsx     — Moved from home/admin-verifications
  content-reports.tsx   — List of flagged content
  user-reports.tsx      — List of reported users
```

**Dashboard screen** (`admin/index.tsx`):
- Header: "Admin" (left-aligned tab root style)
- Section cards:

| Section | Badge | Description |
|---------|-------|------------|
| Verification Queue | Pending count | Pending identity reviews |
| Content Reports | Unresolved count | Flagged posts and replies |
| User Reports | Unresolved count | Reported user accounts |

**TabBar change:** Check `profile.isAdmin` in `TabBar.tsx`. If true, render 5 tabs: Home, Discover, Discussions, Trips, Admin.

## Implementation Order

1. `VerificationBanner` component + place at 3 action points + remove old alerts
2. DB migration: add notification types + verification trigger
3. Push notification for verification outcome
4. Admin tab layout + dashboard screen
5. Move verification review to admin tab
6. Content reports screen
7. User reports screen
8. `useAdminPendingCount` hook + tab badge

## Files to Create/Modify

**New files:**
- `components/VerificationBanner.tsx`
- `app/(tabs)/admin/_layout.tsx`
- `app/(tabs)/admin/index.tsx`
- `app/(tabs)/admin/verifications.tsx`
- `app/(tabs)/admin/content-reports.tsx`
- `app/(tabs)/admin/user-reports.tsx`
- `data/admin/useAdminPendingCount.ts`
- `supabase/migrations/20260224_verification_notifications.sql`

**Modified files:**
- `app/(tabs)/discussions/new.tsx` — Add VerificationBanner, remove requireVerification alert
- `app/(tabs)/travelers/user/[id].tsx` — Add VerificationBanner, disable buttons, remove requireVerification alert
- `app/(tabs)/_layout.tsx` — Add admin tab (conditional)
- `components/TabBar.tsx` — Support 5th admin tab with badge
- `data/notifications/types.ts` — Add new notification types
- `app/(tabs)/home/settings.tsx` — Remove admin section (moved to tab)
