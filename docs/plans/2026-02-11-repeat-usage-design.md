# Sola Repeat Usage & Habit-Building Design

**Date:** 2026-02-11
**Status:** Draft — awaiting review
**Scope:** Redesign for repeat usage using existing features and data only

---

## 1. Diagnosis: Where Repeat Usage Breaks Down

### 1a. First-Time User Journey

A new user opens Sola and sees:

1. **IntentHero** — adaptive entry point based on mode (discover vs travelling)
2. **Countries grid** — 6 countries in a masonry layout
3. **Popular cities** — horizontal scroll, shuffled daily
4. **Collections section** — editorial groupings
5. **Community signal** — a single prompt to visit Community tab

**What works:** The explore feed is visually rich and immediately communicates "this is a travel discovery app." The IntentHero adapts to mode.

**What breaks:** After the user scrolls through ~4 zones, the feed *ends*. There is no continuation, no personalization, and no reason to scroll again tomorrow. The feed is the same for every user on every visit (except a daily city shuffle that's identical for everyone). A first-time user who doesn't tap into a city or collection gets a complete, closed experience in about 30 seconds of scrolling.

### 1b. Casual User (Opened 3-5 Times)

This user has:
- Browsed a few cities
- Maybe saved a place or two
- Maybe glanced at Community
- No trip planned

**What they see on return:** Exactly the same feed they saw last time, minus the daily city shuffle. No acknowledgment of their previous browsing. No saved places surfaced. No "continue where you left off." The app has no memory of them.

**Critical gap:** The app treats a return visitor identically to a brand-new user. There is no "welcome back" in the data layer — no recently viewed cities, no "you saved 3 places in Lisbon" nudge, no community activity update.

### 1c. Periodic Traveler (Travels 2-4x/Year)

Between trips, this user has:
- Past trips in the Trips tab
- Saved places scattered across collections
- Maybe community posts or connections
- Profile with interests and visited countries

**What they see:** The Explore feed is still generic. Their Trips tab shows past trips but offers no forward momentum ("where next?"). Their saved places live in Profile > Collections — buried. Community threads they participated in may have new replies, but nothing tells them.

**The experience "ends" here:** Between trips, there is literally nothing pulling this user back. The app becomes a static brochure they've already read.

---

### 1d. Specific Dead Ends (Screen by Screen)

| Screen | Dead End | Why It Kills Return |
|--------|----------|-------------------|
| **Explore feed** | Feed has 4 zones then stops | No reason to scroll again tomorrow |
| **City detail** | Rich content, but no "save and come back" flow | User reads, leaves, forgets |
| **Place detail** | Can save, but save goes to buried collections | No feedback loop to revisit saves |
| **Community index** | Thread list with no "new since last visit" | Feels the same every time |
| **Community thread** | Can read/reply, no notification of responses | Conversation dies silently |
| **Travelers tab** | Only useful with location sharing on + active travel | Empty/irrelevant 90% of the time |
| **Trips tab** | Empty state if no trips, past trips are archival | No forward-looking energy |
| **Profile** | Settings + collections list | No reason to visit proactively |
| **Search** | Shows recent + popular + suggestions | Recent searches are the only "memory" in the entire app |

---

## 2. What "Daily Value" Looks Like for Sola

The question: **Why would someone open Sola today, even if they're not traveling?**

### Three Honest Answers

**1. "Something changed that's relevant to me."**
- A community thread I participated in has new replies
- A city I saved/browsed has new content or a new community discussion
- A traveler I connected with is going somewhere interesting

**2. "I want to continue a thought I started."**
- I was browsing Oaxaca last week — show me where I left off
- I saved 4 restaurants in Lisbon — remind me they exist
- I started a trip draft — nudge me to finish it

**3. "Something I didn't know was relevant just became relevant."**
- It's the best month to visit a city I've shown interest in
- A community thread about a place I saved surfaced a safety tip
- A new collection was published that matches my interests

### The Core Insight

Sola's daily value is **not** about new content every day. It's about making the user's *own* accumulated context — saves, browsing history, trip plans, community participation — feel alive and worth revisiting.

The app already stores rich user-specific data (saved places, collections, trips, community votes, place signals, profile interests). The problem is that **none of this data flows back to the surfaces the user sees first** (Explore feed, tab badges, headers).

---

## 3. Natural Habit Loops

### Loop 1: Discover → Save → Resurface → Return

**How it exists today:**
User browses city → taps place → saves it → place goes to collections → collections live in Profile → user forgets.

**How to strengthen it:**
Close the loop by resurfacing saved content on the Explore feed itself. When a user returns, show "Your saves" as a feed zone — not a new feature, just existing data pulled to the surface they see first. Saved places become the *reason* to reopen the app ("I saved those restaurants in Porto — let me look at them again").

**Mechanics:**
- Feed zone: "Places you saved" (horizontal scroll of saved places, pulled from existing `getSavedPlaces()`)
- Only shown when user has ≥1 save
- Tapping a place goes to place detail (existing screen)
- Position: near the top of the feed, after IntentHero, before generic browse content

### Loop 2: Read → Participate → Get Response → Return

**How it exists today:**
User reads community thread → maybe replies → leaves → never knows if someone responded.

**How to strengthen it:**
Surface "new activity" indicators on the Community tab and in the feed. Use existing data: compare `thread.replyCount` or latest reply timestamp against the user's last visit timestamp.

**Mechanics:**
- Tab badge: small dot on Community tab icon when threads the user participated in have new replies (query: threads where user is author or has replied, with replies newer than user's last Community tab visit — store last visit in AsyncStorage)
- Community signal in Explore feed: instead of generic "Join the conversation", show "3 new replies in threads you follow" (using existing thread/reply data)
- Thread list: subtle "new replies" indicator on threads user has participated in

### Loop 3: Plan → Research → Save to Trip → Anticipate → Return

**How it exists today:**
User creates trip → can add saved items → trip lives in Trips tab → no connection back to Explore.

**How to strengthen it:**
When a user has an upcoming trip, the Explore feed should acknowledge it. Not by changing the feed structure (that's travelling mode), but by adding a contextual zone: "Your trip to Bangkok is in 23 days" with a link to the trip + a few relevant places/threads for that destination.

**Mechanics:**
- Feed zone: "Upcoming trip" card (only when `trips.upcoming.length > 0`)
- Shows destination name, countdown (computed from `trip.arriving`), and 2-3 quick links: trip plan, city guide, community threads about destination
- Position: after IntentHero, before generic content (alongside or instead of the saved places zone depending on what's more relevant)

---

## 4. Rethinking the Explore Feed for Repeat Users

### Current Feed Structure (Same for Everyone)

```
IntentHero (mode-adaptive)
├── Countries Grid (static, same 6 every visit)
├── Popular Cities (shuffled daily, same for all users)
├── Collections Section (same editorial collections)
└── Community Signal (generic "join the conversation")
```

### Proposed Feed Structure (Context-Aware)

The key change: **the feed should have a "you" layer that sits between IntentHero and the generic browse content.** This layer draws entirely from existing data. It appears only when there's something to show.

```
IntentHero (mode-adaptive, unchanged)
│
├── [IF has upcoming trip] Trip Countdown Zone
│   "Your trip to {city} — {N} days away"
│   Quick links: trip plan, city guide, community
│
├── [IF has saved places] Your Saves Zone
│   Horizontal scroll of saved places (most recent first)
│   "You've saved {N} places" → links to collections
│
├── [IF has community activity] Community Activity Zone
│   "{N} new replies in threads you joined"
│   Preview of 1-2 active threads with new responses
│
├── [IF has recent browsing] Continue Exploring Zone
│   "You were looking at {city}"
│   Link back to that city's detail page
│   (requires: store last viewed city in AsyncStorage)
│
├── Countries Grid (unchanged)
├── Popular Cities (unchanged)
├── Collections Section (unchanged)
└── Community Signal (made contextual — see section 5)
```

### Rules for the "You" Layer

1. **Maximum 2 zones shown** — pick the 2 most relevant. Priority: upcoming trip > community activity > saved places > recent browsing.
2. **Each zone is a single card or small horizontal scroll** — not a full section. Compact. Calm.
3. **All zones are dismissible** — long-press or swipe to hide (store dismissal in AsyncStorage with a TTL so it can reappear later).
4. **No empty states** — if there's nothing personal to show, the feed starts with Countries Grid as it does today. No "you haven't saved anything yet" guilt.
5. **Data sources are all existing:** `getSavedPlaces()`, `getTripsGrouped()`, community thread queries, AsyncStorage for recents.

### What Changes for Different Users

| User Type | What They See | Why They Return |
|-----------|--------------|-----------------|
| **Brand new** | IntentHero + generic feed (unchanged) | Discovery — same as today |
| **Has saves, no trip** | IntentHero + saved places zone + generic feed | "My saves are here" — ownership |
| **Has upcoming trip** | IntentHero + trip countdown + generic feed | Anticipation builds naturally |
| **Active in community** | IntentHero + community activity + generic feed | "People responded to me" |
| **Returning traveler** | IntentHero + continue exploring + generic feed | "Pick up where I left off" |

---

## 5. Community as a Return Driver

### Current State

- Community tab shows all threads sorted by pinned > votes > recency
- No indication of "what's new since last visit"
- User can post, reply, vote — but gets no signal that anyone engaged back
- The Explore feed has a generic "community-signal" zone that says "Join the conversation"

### Proposed Changes

#### 5a. "New Since Last Visit" Line

In the Community thread list, insert a subtle divider line between threads that have new replies since the user's last visit and older threads.

**Implementation:** Store `community_last_visited_at` in AsyncStorage (update on tab focus). When rendering thread list, compare each thread's `updatedAt` (or latest reply timestamp) against this stored value. Insert a divider: "— New activity since your last visit —" in `textMuted` color.

**Data required:** All existing. Just an AsyncStorage timestamp + comparison against thread data already fetched by `useCommunityFeed()`.

#### 5b. Tab Badge for New Replies

Show a small dot badge on the Community tab icon when:
- A thread the user authored has new replies, OR
- A thread the user replied to has new replies since their last visit

**Implementation:**
- On app foreground or Community tab blur, store `community_last_visited_at`
- On app open, run a lightweight query: count threads where (user is author OR user has replied) AND thread has replies newer than `community_last_visited_at`
- If count > 0, show dot on tab
- Requires one new Supabase query (small, indexed on author_id + updated_at)

#### 5c. Contextual Community Signal in Explore Feed

Replace the generic "community-signal" feed zone with a contextual one:

- **If user has active threads with new replies:** "3 new replies in your discussions" → link to Community tab
- **If user has no community activity:** "Solo women are discussing {city user recently browsed}" → link to that city's threads (using existing `getCityThreadPreviews()`)
- **Fallback:** "What solo women are asking about {random featured city}" → existing thread preview

This makes the community signal in the Explore feed feel alive rather than static.

#### 5d. What NOT to Do

- No push notifications for every reply (see section 6)
- No "trending" or "hot" badges — these create FOMO pressure
- No infinite scroll that encourages doom-scrolling
- No follower counts or popularity metrics visible to users
- No "you haven't posted in a while" shame nudges

---

## 6. Notifications & Reminders

### Philosophy

Notifications should feel like a friend texting you something useful, not an app begging for attention. Every notification must pass this test: **"Would I be glad I saw this, or annoyed?"**

### Notifications That Make Sense

| Trigger | Message Style | Frequency Cap |
|---------|--------------|---------------|
| **Someone replied to your community thread** | "{Name} replied to your post about {topic}" | Max 3/day, batch after that |
| **Someone replied to a thread you replied in** | "New replies in '{thread title}'" | Max 1/thread/day |
| **Your upcoming trip is in 3 days** | "Your trip to {city} starts in 3 days. {safety_rating} — here's what to know" | Once per trip |
| **Connection request received** | "{Name} wants to connect" | Immediate, max 5/day |
| **New message from connection** | "{Name} sent you a message" | Immediate (DMs are expected) |

### What Should NEVER Trigger Notifications

- New editorial collections published
- New places added to a city
- "You haven't opened the app in X days"
- "X people are looking at {city} right now"
- Community threads the user hasn't participated in
- Another traveler saved/visited the same place
- Any form of "we miss you"
- Anything with a count designed to create urgency ("5 unread!")

### Contextual Trip Notification (Using Existing Data)

When a user has an upcoming trip (`trip.arriving` is within 3 days), send one notification:

> "Your trip to {destinationName} starts {day}. Tap to review your saved places and safety info."

This uses existing data: `trips.upcoming[0]`, `trip.arriving`, `trip.destinationName`. No new data needed.

### Implementation Note

Push notifications are already set up (`supabase/functions/push-on-message/`). The infrastructure exists for DM notifications. Extending it to community replies requires:
1. A new edge function trigger on `community_replies` insert
2. Check if the thread author (or previous repliers) have push tokens
3. Rate-limit to avoid spam (max 3/day per user for community)

---

## 7. Mental Model: How Habit-Building Works in Sola

```
┌─────────────────────────────────────────────────┐
│                  THE SOLA LOOP                  │
│                                                 │
│   DISCOVER ──→ SAVE ──→ RESURFACE ──→ RETURN   │
│       ↑                                   │     │
│       └───────────────────────────────────┘     │
│                                                 │
│   The app remembers what you care about         │
│   and shows it back to you at the right time.   │
└─────────────────────────────────────────────────┘
```

### Three Principles

1. **Accumulation, not consumption.** Every action (save, browse, post, plan) adds to a personal layer that makes the app more useful over time. The more you use Sola, the more it has to show you.

2. **Quiet signals, not loud alerts.** A dot on a tab. A zone in the feed. A contextual line in a card. Never a modal, never a pop-up, never an interstitial.

3. **Forward momentum, not backward guilt.** "Your trip is in 23 days" (exciting). Never "You haven't opened the app in 12 days" (shame). "3 new replies in your thread" (curiosity). Never "You have 47 unread items" (pressure).

---

## 8. Implementation Plan

### Phase 1: Personal Feed Layer (Highest Impact, ~3-5 days)

**Goal:** Make the Explore feed feel different on return visits.

1. **AsyncStorage: Recent Browsing**
   - Store `last_viewed_city_id` and `last_viewed_city_name` when user visits a city detail page
   - Read on feed load to populate "Continue Exploring" zone

2. **Feed Zone: "Your Saves"**
   - New feed item type: `your-saves` in `FeedItem` union
   - In `useFeedItems`, fetch `getSavedPlaces(userId)` alongside existing data
   - In `buildFeed`, insert `your-saves` zone after IntentHero when saves exist
   - Render as horizontal scroll of saved place cards (reuse existing `PlaceHorizontalCard` or similar)

3. **Feed Zone: "Upcoming Trip"**
   - New feed item type: `upcoming-trip`
   - In `useFeedItems`, fetch `getTripsGrouped(userId)`
   - In `buildFeed`, insert `upcoming-trip` zone when `trips.upcoming.length > 0`
   - Render as a single card: destination + countdown + quick links

4. **Feed Zone: "Continue Exploring"**
   - New feed item type: `continue-exploring`
   - Read from AsyncStorage on mount
   - Single card: "You were looking at {city}" with image + link

**Files to modify:**
- `data/explore/types.ts` — add new FeedItem types
- `data/explore/feedBuilder.ts` — add personal zones
- `data/explore/useFeedItems.ts` — fetch user data alongside feed data
- `app/(tabs)/explore/index.tsx` — render new zone types
- City detail screens — store recent view in AsyncStorage

### Phase 2: Community Return Signals (~2-3 days)

**Goal:** Make Community feel alive between visits.

1. **AsyncStorage: Last Community Visit**
   - Store timestamp when Community tab is focused
   - Compare against thread data on next visit

2. **Tab Badge**
   - In `TabBar.tsx`, query for threads with new replies since last visit
   - Show orange dot on Community tab when count > 0

3. **"New Since Last Visit" Divider**
   - In community thread list, insert visual divider based on timestamp comparison
   - Light gray line with "New activity" text

4. **Contextual Community Signal in Explore**
   - Modify `community-signal` zone rendering in explore/index.tsx
   - If user has active threads with new replies, show count + preview
   - Otherwise show destination-relevant thread preview

**Files to modify:**
- `components/TabBar.tsx` — badge logic
- `app/(tabs)/community/index.tsx` — divider + timestamp storage
- `app/(tabs)/explore/index.tsx` — contextual community signal rendering
- New lightweight query in `data/community/communityApi.ts`

### Phase 3: Trip-Aware Notifications (~2 days)

**Goal:** One useful notification per trip lifecycle.

1. **Pre-trip notification (3 days before)**
   - New edge function triggered by cron or on app open
   - Check upcoming trips where `arriving` is within 3 days
   - Send push with destination name + safety rating

2. **Community reply notification**
   - New edge function trigger on `community_replies` insert
   - Notify thread author + previous repliers
   - Rate limit: max 3 community notifications per user per day

**Files to create/modify:**
- New edge function: `supabase/functions/notify-trip-countdown/`
- New edge function: `supabase/functions/notify-community-reply/`
- Or extend existing `push-on-message` function

### Phase 4: Polish & Defaults (~1-2 days)

1. **Feed zone ordering logic** — implement priority ranking (trip > community > saves > recent)
2. **Dismissibility** — long-press to hide a personal zone (AsyncStorage with 7-day TTL)
3. **Zone cap** — max 2 personal zones shown to keep feed clean
4. **Community tab: thread participation tracking** — lightweight join against user's authored/replied threads

---

## 9. Verification Checklist

After implementation, verify each of these:

- [ ] **New user sees clean feed** — no personal zones, no empty states, no "you haven't saved anything"
- [ ] **User with 1+ saves sees "Your Saves" zone** on Explore feed
- [ ] **User with upcoming trip sees countdown zone** on Explore feed
- [ ] **User who browsed a city yesterday sees "Continue Exploring"** on next visit
- [ ] **Community tab shows dot badge** when user's threads have new replies
- [ ] **Community thread list has "new since last visit" divider** in correct position
- [ ] **Explore community signal is contextual** — not generic for return users
- [ ] **Maximum 2 personal zones shown** — feed doesn't feel cluttered
- [ ] **Personal zones are dismissible** and don't reappear immediately
- [ ] **No notifications fire for passive content** (new collections, new places, etc.)
- [ ] **Trip notification fires once, 3 days before departure**
- [ ] **Community reply notifications are rate-limited** to 3/day
- [ ] **Feed loads fast** — personal data fetched in parallel, not blocking feed render
- [ ] **Travelling mode still works correctly** — personal zones don't conflict with travelling feed
- [ ] **No hardcoded content** — all zones driven by real user data
- [ ] **Zero pressure language** — no guilt, no urgency, no "you missed X"

---

## 10. What This Design Does NOT Include

Explicitly excluded per brief:

- Streaks, points, badges, daily check-ins
- Social pressure mechanics (follower counts, leaderboards)
- Infinite feeds or doom-scroll patterns
- "We miss you" re-engagement notifications
- Artificial urgency ("only 3 seats left!")
- Any hardcoded promotional content
- New screens or features — only reordering and resurfacing existing data

---

## 11. Summary

The core problem is simple: **Sola knows things about its users but doesn't show that knowledge back to them.** The app has saved places, trips, community participation, browsing context — but the primary surface (Explore feed) ignores all of it.

The fix is equally simple: **add a thin personal layer to the Explore feed that surfaces what the user already cares about.** Combined with quiet signals in the Community tab and one contextual notification per trip, this creates natural reasons to return without any manipulative mechanics.

The mental model: *The more you use Sola, the more it has to show you. Not more content — more of YOUR content, in the right place, at the right time.*
