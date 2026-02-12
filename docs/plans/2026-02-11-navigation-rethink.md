# Navigation Architecture Rethink

> Date: 2026-02-11
> Status: Design complete, ready for implementation
> Branch: `feature/navigation-rethink`

---

## Part 1: Diagnosis — Why the Current Navigation Fails

### Current Structure (5 tabs)

| # | Label | Route | Screens | Primary Purpose |
|---|-------|-------|---------|-----------------|
| 1 | Explore | `explore/` | 13 | Browse destinations, cities, collections, places |
| 2 | Community | `community/` | 3 | Forum threads about travel |
| 3 | Trips | `trips/` | 3 | Trip planning and management |
| 4 | Travelers | `home/` | 5 | Find people, DMs, connections, user profiles |
| 5 | Profile | `profile/` | 6 | Your profile, settings, saved collections |

### Five Structural Failures

**1. "Travelers" is three features sharing a trench coat.**

The Travelers tab simultaneously serves as: a people discovery engine, a connection/friend-request manager, a messaging inbox, and a profile viewer for other users. A user looking for her messages has to think "Travelers" — that's a cognitive dead end. Worse, the `InboxButton` in every other tab's header routes to a nested screen *inside* this tab (`/home/dm`), which means tapping inbox in Explore teleports you to the Travelers tab without warning. The route is even called `home/` internally — it doesn't even know what it is.

**2. No anchor — the app has no "home base."**

There's no screen that says "you are here." Explore functions as the landing tab but it's a discovery engine — useful for browsing, useless for the returning user who wants her trip, her messages, or her saved places. Every session starts with "where do I need to go?" instead of "here's what's relevant to me." There's no gravity.

**3. Community and Travelers overlap and are both thin.**

Community has 3 screens (thread list, detail, compose). Travelers has 5 screens (but 3 are messaging/connections). Both are "social" features — asking questions vs. finding people — but they're in different tabs with no connection. A thread about Medellín safety lives in Community. The traveler currently *in* Medellín lives in Travelers. These are the same world.

**4. Profile doesn't earn a tab.**

Profile is a mostly-static screen visited occasionally to edit a bio or change settings. It has 6 nested screens but they're all rare-use. Giving Profile equal visual weight to Explore implies equal importance. It isn't. Premium apps (Airbnb, Apple Maps) treat profile as a secondary access point, not a primary destination.

**5. Explore is vague and overloaded.**

Explore has 13 nested screens — more than the other 4 tabs combined. It handles search, city pages, country pages, collections, activities, place details, saved places (in travelling mode), safety info (in travelling mode), community signals, trip countdown cards, and your saved places. The label "Explore" doesn't tell you what you'll find. The depth of nesting means you can be 3-4 screens deep and lose all sense of where you are. It's also mode-dependent, meaning it changes shape based on whether you're travelling — the same tab shows different content at different times.

### Root Cause

The tabs are organized by **feature type** (content browser, forum, planner, people finder, profile viewer) rather than by **user intent** (orient myself, find a destination, connect with people, manage my trip). This forces users to learn the app's internal logic rather than matching their own mental model.

---

## Part 2: The New Mental Model

A solo woman traveler thinks in four modes of intent:

| Intent | Her question | Tab |
|--------|-------------|-----|
| Orient | "What's relevant to me right now?" | **Home** |
| Discover | "Where should I go? What's out there?" | **Discover** |
| Connect | "Who can I talk to? What are people saying?" | **Connect** |
| Plan | "What does my trip look like?" | **Trips** |

### New Tab Bar: 4 Tabs

```
┌─────────┬──────────┬─────────┬────────┐
│  Home   │ Discover │ Connect │ Trips  │
└─────────┴──────────┴─────────┴────────┘
```

**Profile** exits the tab bar. Accessed via avatar tap in the Home header — one tap from any screen (tap Home tab → tap avatar), never lost, but not occupying prime real estate.

### Why 4:

- **Not 3**: Trips and Discover must be separate. Merging them recreates the Explore overload problem.
- **Not 5**: Profile doesn't earn a tab. Community and Travelers don't earn separate tabs — they're both "connect with people" and splitting them fragments the social layer.
- **4 is the Apple sweet spot**: iOS Settings, Health, Music, Fitness all use 4 tabs. It's the most confident configuration — enough to cover the domain without overwhelming.

### What each tab means mentally:

- **Home** — "My world." The anchor. Personalized, contextual, always relevant. First thing you see, always one tap away.
- **Discover** — "The world." Browse destinations, cities, collections. Pure inspiration and research. No personal content.
- **Connect** — "Other people." Travelers, conversations, community threads. Everything social lives here.
- **Trips** — "My plans." Trip management, itineraries, active trip. Your travel logistics.

---

## Part 3: Home Tab — The Anchor

The biggest structural change. Today there's no "home." The new Home tab is a **personalized, contextual dashboard** that answers: "What's relevant to me right now?"

### What appears on Home (adapts to context):

**Always present:**
- Active trip card (if you have one) — destination, dates, countdown or "Day 3 of 7". Taps through to trip detail in Trips tab.
- Unread messages indicator — "2 new messages" → taps through to DM inbox in Connect tab.
- Recent community activity — threads you've posted in with new replies, or threads trending for your destination.
- A destination suggestion or two — personalized based on interests/past trips.

**When actively traveling (travelling mode):**
- Active trip card is **prominent** — top of feed, expanded with city hero image.
- Safety essentials — emergency number, nearest embassy for current country.
- "Nearby" signal — "3 Sola travelers near you right now" → taps to Connect.
- Saved places you haven't visited yet for this trip.

**When planning (upcoming trip exists):**
- Upcoming trip card — "Lisbon in 12 days" with progress indicator.
- Unanswered community threads about your destination.
- Suggested places for your destination.

**When dreaming (no active trip):**
- Inspiration-forward — trending destinations, new collections.
- Community highlights — popular recent threads.
- Gentle "Start planning" prompt.

### What Home is NOT:
- Not a social media feed with infinite scroll.
- Not a notification center.
- Not a duplicate of Discover.
- It's a **dashboard** — finite, scannable, contextual. Think Apple's "Today" view, not Instagram's feed. 5-8 cards, each one a doorway deeper into the app.

### Screen depth from Home:
Home is a **routing surface** — cards tap through to their full destinations (trip detail lives in Trips, DM thread lives in Connect, city page lives in Discover). Home stays shallow — typically 1 level deep at most.

### Home header:
- **Left**: User avatar (32px circle) — taps to Profile screen.
- **Right**: Nothing, or a subtle notification bell if we add push notifications later. Clean.
- The avatar serves double duty: it provides profile access AND personalizes the header ("this is MY space").

---

## Part 4: Discover Tab — The World

This is today's Explore, but **focused**. It sheds everything that doesn't belong (trip-specific content, social features, mode-dependent behavior) and becomes a pure browsing/inspiration engine.

### What Discover contains:

**Primary screen:**
- Search bar — prominent at top. The front door to all content.
- IntentHero — adaptive entry point (kept from current implementation).
- Countries grid — browsable, filterable.
- Featured cities — horizontal scroll.
- Collections — "Ways to travel solo", thematic groupings.
- Activities — yoga, hiking, etc. (if present in data).

**Nested screens (same as today):**
- `search.tsx` — Full search modal
- `city/[slug].tsx` — City detail page
- `country/[slug].tsx` — Country detail
- `country/cities.tsx` — Cities within a country
- `country/places.tsx` — Places within a country
- `collection/[slug].tsx` — Collection detail
- `activity/[slug].tsx` — Activity detail
- `place-detail/[id].tsx` — Place detail
- `all-countries.tsx` — All countries list
- `all-destinations.tsx` — All destinations
- `all-activities.tsx` — All activities
- `see-all.tsx` — Generic see-all

### What moves OUT of Discover:
- ~~Saved places for your trip~~ → Home tab (summary card) + Trips tab (full list)
- ~~"Know before you go" safety card~~ → Home tab (when travelling)
- ~~Community signal card~~ → Connect tab
- ~~Community activity card~~ → Home tab (summary)
- ~~Upcoming trip countdown card~~ → Home tab
- ~~Continue exploring card~~ → Home tab
- ~~Your saves section~~ → Home tab (summary) + Profile (full list)
- ~~Mode-dependent behavior~~ → Discover is mode-agnostic. Same experience always.

### Discover header:
- **Left**: Sola logo (keep current branding)
- **Right**: Nothing. No inbox button (that's now a Connect tab concern). Clean.

### Why "Discover" not "Explore":
"Explore" has become a generic app-nav word — Spotify, Instagram, Uber all use it for unrelated things. It's lost semantic weight. "Discover" is slightly more intentional: it implies *finding something new*. But the label matters less than the tab having a **single clear job**: browse the world.

---

## Part 5: Connect Tab — Other People

The most important consolidation. Today, "social" is fractured across three locations: Community (forum threads), Travelers (people search), and InboxButton (DMs buried inside Travelers). Connect unifies everything social under one roof.

### Structure: Segment Control

The primary screen uses a **top segment control** — two segments that let you switch views without leaving the tab:

```
┌──────────────────────────────────┐
│  Connect                   [✉️]  │
│                                  │
│  [ Discussions ]  [ Travelers ]  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Content switches here     │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

**Discussions segment** (absorbs Community):
- Thread list — recent discussions, filterable by topic/destination
- Sola Team featured hero card
- Search pill for discussion search
- FAB to compose new thread
- Taps into → thread detail (preserved as-is)

**Travelers segment** (absorbs old Travelers/Home):
- People discovery — suggested, nearby, shared interests
- Search by username
- Connection requests banner
- Location consent banner
- Taps into → user profile, connect/message actions

### Where DMs go:

DMs get the **inbox icon in the Connect header** — right side. Tapping it opens the DM inbox as a nested screen within Connect. This is logical: messages are part of connecting with people.

The InboxButton **disappears from all other tab headers**. Instead, unread message count shows as a **badge on the Connect tab icon** in the bottom bar — the universal "you have messages" pattern. No more mysterious inbox icon that teleports you to a different tab.

### Connect header:
- **Left**: "Connect" title
- **Right**: Inbox/message icon → DM inbox. Badge count if unread.

### Nested screens from Connect:
- `thread/[id].tsx` — Thread detail (from Discussions)
- `new.tsx` — New thread composer (from Discussions)
- `user/[id].tsx` — User profile (from Travelers)
- `connections.tsx` — Connection requests
- `dm/index.tsx` — DM inbox
- `dm/[id].tsx` — DM conversation

### Why this works:

Today: "Someone messaged me about Medellín. Where do I find that?" → User has to remember messages live under "Travelers."

With Connect: Everything about other people is in Connect. Discussions, people, messages. The answer is always obvious.

---

## Part 6: Trips Tab — My Plans

The Trips tab is the clearest of the four — it already exists and its purpose is well-defined. The changes are additive, not structural.

### What it gains:
- **Saved places for your active trip** — moved from Explore's travelling mode sections
- **Safety essentials** — emergency numbers for your destination (moved from Explore)
- These additions make the trip detail screen more self-contained: everything you need for your trip lives in Trips

### Primary screen (mostly unchanged):
- Active trip card (if any) — expanded, prominent
- Upcoming trips list
- Past trips (collapsible)
- Empty state → "Plan your first trip" with gentle CTA to Discover

### Nested screens (unchanged):
- `[id].tsx` — Trip detail (itinerary, places, dates)
- `new.tsx` — New trip creation

### Trips header:
- **Left**: "Trips" title
- **Right**: Add trip button (circular with plus icon) — keep current

### What Trips is NOT:
- Not a destination browser (that's Discover)
- Not a place to find people for your trip (that's Connect)
- Just your logistics: where, when, what you've saved, what you need to know

---

## Part 7: Profile — Demoted from Tab

Profile exits the tab bar and becomes accessible via:

1. **Avatar tap in Home header** — the primary access path. Your face is always visible in Home.
2. **From any user-profile-related action** — "Edit profile" buttons, settings links, etc.

### Profile screens (all move under `home/` stack):
- `profile.tsx` — Your profile view (avatar, bio, interests, collections, stats)
- `edit-profile.tsx` — Edit profile form
- `settings.tsx` — Settings (account, privacy, notifications, help, logout)
- `verify.tsx` — ID verification flow
- `delete-account.tsx` — Account deletion
- `collections/[id].tsx` — Collection detail (your saved places)

### Settings as secondary navigation:

Settings (accessed from Profile) serves as the **secondary menu** for everything that doesn't need primary navigation:
- Account settings
- Privacy & safety
- Notification preferences
- Help & support
- Legal (privacy policy, terms of service)
- ID verification
- Logout
- Delete account

This replaces the need for any hamburger menu or overflow menu. Profile → Settings covers all secondary needs. It's the pattern used by every major iOS app (Instagram, Airbnb, Apple Health).

### How users always know how to get to settings:
Home tab → Avatar → Profile → Settings gear icon. Two taps from the anchor. Consistent, memorable, no learning required.

---

## Part 8: Orientation & Wayfinding

### How does a user always know where she is?

**1. Bottom tab bar — always visible.**
The active tab is always highlighted (orange icon + label). The tab bar **never hides**, even when 3 screens deep in a navigation stack. This is the primary orientation cue. Glance down → know your tab.

**2. Header title — always present.**
Every screen has a clear title in the header. "Connect", "Medellín", "Trip to Portugal", "DM Inbox". The title changes as you navigate deeper, giving a breadcrumb-like sense of where you are within the tab.

**3. Back button — always standard.**
Standard iOS back chevron on every pushed screen. Always goes up one level. No custom back behavior, no surprises.

**4. Tab tap = reset to root.**
Tapping an already-active tab scrolls to top. Tapping an inactive tab goes to that tab's root screen. This is the universal "I'm lost" recovery — built into iOS, requires zero learning.

### Rules that prevent disorientation:

1. **Never hide the tab bar.** Even modals should either keep it visible or have an obvious close button (X) in the top corner.
2. **Never cross-tab navigate silently.** No more InboxButton that teleports from Explore to Travelers. Every navigation stays within its tab's stack, or explicitly switches tabs with visual feedback.
3. **Modals are rare.** Only two things are modals (slide from bottom with X to close):
   - Search (from Discover)
   - Compose new thread/trip (creation flows)
   Everything else is a push navigation within the tab's stack.
4. **Maximum 3 levels deep per tab.** Tab root → detail → sub-detail. If we find ourselves needing 4+ levels, the information architecture is wrong.

### Screen hierarchy per tab:

| Tab | Level 0 (root) | Level 1 | Level 2 |
|-----|----------------|---------|---------|
| Home | Dashboard | Profile, Trip card → Trips tab | Edit profile, Settings |
| Discover | Browse feed | City/Country/Collection detail | Place detail |
| Connect | Discussions/Travelers | Thread detail, User profile, DM inbox | DM conversation |
| Trips | Trip list | Trip detail | Place detail (within trip) |

---

## Part 9: Color, Iconography, and Clarity

### Bottom bar visual treatment:

**Current**: Orange active icon + label, warm gray inactive. White-ish background with hairline top border. This is solid but can be strengthened.

**Proposed improvements:**

1. **Filled vs outline icons**: Active state uses **filled** icon variant. Inactive uses **outline** variant. This is the iOS standard (SF Symbols) and provides instant visual distinction that doesn't rely on color alone. Accessibility win.

2. **Keep orange active state**: `colors.orange` (#E5653A) for active icon + label. This is Sola's brand and it works.

3. **Darken inactive state slightly**: Current `colors.tabBarInactive` (#B8B0AA) is a warm gray that can feel washed out. Consider darkening to ~#9A938D for better contrast while remaining obviously "not active." Test for WCAG AA contrast ratio.

4. **Badge on Connect tab**: Orange dot (current community badge treatment) moves to Connect tab. Shows when there are unread DMs or new community replies. Single badge, one tab — not scattered across multiple tabs.

5. **No badge on Home**: Home surfaces unread info in its feed. No badge needed — visiting Home shows you everything.

### Icon choices:

| Tab | Icon concept | Reasoning |
|-----|-------------|-----------|
| Home | House | Universal "home" symbol. Apple, Google, Airbnb all use it. Zero learning. |
| Discover | Compass | Maps to exploration/discovery. More specific than magnifying glass (which implies search, not browsing). |
| Connect | Chat bubble(s) | Implies conversation and human connection. More specific than generic "people" icon. |
| Trips | Suitcase | Maps directly to travel/trips. More specific than map pin (which could mean location). |

All icons should be custom assets at 26px matching the current `TAB_ICON_SIZE`, consistent with the existing warm, slightly rounded Sola aesthetic. Not thin-line geometric icons (too cold), not chunky filled icons (too heavy).

### Label typography (keep current):
- 10px PlusJakartaSans-Medium (inactive)
- 10px PlusJakartaSans-SemiBold (active)
- Labels always visible — never icon-only

---

## Part 10: File Structure & Route Changes

### New directory structure under `app/(tabs)/`:

```
app/(tabs)/
  _layout.tsx              → 4 tabs: home, discover, connect, trips

  home/
    _layout.tsx            → Stack navigator
    index.tsx              → NEW: Personalized dashboard feed
    profile.tsx            → MOVED from profile/index.tsx (adapted)
    edit-profile.tsx       → MOVED from profile/edit.tsx
    settings.tsx           → MOVED from profile/settings.tsx
    verify.tsx             → MOVED from profile/verify.tsx
    delete-account.tsx     → MOVED from profile/delete-account.tsx
    collections/[id].tsx   → MOVED from profile/collections/[id].tsx

  discover/
    _layout.tsx            → Stack navigator
    index.tsx              → ADAPTED from explore/index.tsx (stripped of personal/social content)
    search.tsx             → KEPT from explore/search.tsx
    city/[slug].tsx        → KEPT from explore/city/[slug].tsx
    country/[slug].tsx     → KEPT from explore/country/[slug].tsx
    country/cities.tsx     → KEPT from explore/country/cities.tsx
    country/places.tsx     → KEPT from explore/country/places.tsx
    collection/[slug].tsx  → KEPT from explore/collection/[slug].tsx
    activity/[slug].tsx    → KEPT from explore/activity/[slug].tsx
    place-detail/[id].tsx  → KEPT from explore/place-detail/[id].tsx
    all-countries.tsx      → KEPT from explore/all-countries.tsx
    all-destinations.tsx   → KEPT from explore/all-destinations.tsx
    all-activities.tsx     → KEPT from explore/all-activities.tsx
    see-all.tsx            → KEPT from explore/see-all.tsx

  connect/
    _layout.tsx            → Stack navigator
    index.tsx              → NEW: Segment control (Discussions / Travelers)
    thread/[id].tsx        → MOVED from community/thread/[id].tsx
    new.tsx                → MOVED from community/new.tsx
    user/[id].tsx          → MOVED from home/user/[id].tsx
    connections.tsx        → MOVED from home/connections.tsx
    dm/index.tsx           → MOVED from home/dm/index.tsx
    dm/[id].tsx            → MOVED from home/dm/[id].tsx

  trips/
    _layout.tsx            → Stack navigator (unchanged)
    index.tsx              → KEPT (unchanged)
    [id].tsx               → KEPT (unchanged)
    new.tsx                → KEPT (unchanged)
```

### Directories to remove after migration:
- `app/(tabs)/explore/` → replaced by `discover/`
- `app/(tabs)/community/` → absorbed into `connect/`
- `app/(tabs)/profile/` → absorbed into `home/` (profile screens under home stack)
- Old `app/(tabs)/home/` → gutted and rebuilt (travelers screens move to connect)

### Route path migration map:

| Old route | New route |
|-----------|-----------|
| `/(tabs)/explore` | `/(tabs)/discover` |
| `/(tabs)/explore/search` | `/(tabs)/discover/search` |
| `/(tabs)/explore/city/[slug]` | `/(tabs)/discover/city/[slug]` |
| `/(tabs)/explore/country/[slug]` | `/(tabs)/discover/country/[slug]` |
| `/(tabs)/explore/country/cities` | `/(tabs)/discover/country/cities` |
| `/(tabs)/explore/country/places` | `/(tabs)/discover/country/places` |
| `/(tabs)/explore/collection/[slug]` | `/(tabs)/discover/collection/[slug]` |
| `/(tabs)/explore/activity/[slug]` | `/(tabs)/discover/activity/[slug]` |
| `/(tabs)/explore/place-detail/[id]` | `/(tabs)/discover/place-detail/[id]` |
| `/(tabs)/explore/all-countries` | `/(tabs)/discover/all-countries` |
| `/(tabs)/explore/all-destinations` | `/(tabs)/discover/all-destinations` |
| `/(tabs)/explore/all-activities` | `/(tabs)/discover/all-activities` |
| `/(tabs)/explore/see-all` | `/(tabs)/discover/see-all` |
| `/(tabs)/explore/lens/[slug]` | REMOVED (deprecated) |
| `/(tabs)/community` | `/(tabs)/connect` (Discussions segment) |
| `/(tabs)/community/thread/[id]` | `/(tabs)/connect/thread/[id]` |
| `/(tabs)/community/new` | `/(tabs)/connect/new` |
| `/home/user/[id]` | `/connect/user/[id]` |
| `/home/connections` | `/connect/connections` |
| `/home/dm` | `/connect/dm` |
| `/home/dm/[id]` | `/connect/dm/[id]` |
| `/profile/settings` | `/home/settings` |
| `/profile/edit` | `/home/edit-profile` |
| `/profile/collections/[id]` | `/home/collections/[id]` |
| `/(tabs)/profile/verify` | `/(tabs)/home/verify` |
| `/(tabs)/profile/delete-account` | `/(tabs)/home/delete-account` |
| `/(tabs)/profile` | `/(tabs)/home/profile` |

---

## Part 11: User Flow Maps

### Flow 1: "I want to check my messages"
```
Open app → Home tab (default)
See "2 new messages" card on dashboard
Tap → navigates to Connect tab → DM inbox
OR: Tap Connect tab → tap inbox icon in header → DM inbox
```
**Before**: Open app → Explore tab → look for inbox icon → tap → teleported to Travelers tab → DM inbox. Confusing.

### Flow 2: "Where should I go next?"
```
Tap Discover tab → Browse countries, cities, collections
Tap a city → City detail page (within Discover stack)
Save a place → saved to your collection
Tap back → return to browse
```
**Before**: Same flow but mixed in with personal content, mode-dependent sections.

### Flow 3: "I want to ask about safety in Medellín"
```
Tap Connect tab → Discussions segment is showing
Tap FAB (compose) → write question about Medellín
Post → returns to thread list
```
**Before**: Had to find and tap "Community" tab — separate from travelers/people.

### Flow 4: "Where's my trip info?"
```
Tap Trips tab → see active trip card
Tap → trip detail with itinerary, saved places, safety info
```
**Before**: Trip info was partially in Trips tab, partially in Explore (travelling mode sections).

### Flow 5: "I want to edit my profile"
```
Home tab → tap avatar in header → Profile screen
Tap "Edit profile" → Edit profile form
Save → return to Profile → tap back → Home
```
**Before**: Dedicated Profile tab (5th tab position).

### Flow 6: "I'm lost, how do I get back?"
```
Tap Home tab → always goes to dashboard root
```
This is the universal escape. Home is always the first tab, always one tap, always the anchor.

---

## Part 12: Implementation Plan

### Phase 1: Directory Structure & Routing (Foundation)

**Goal**: Create the new directory structure, move files, and update the tab configuration. The app should compile and navigate correctly with 4 tabs.

1. Create `app/(tabs)/discover/` directory with `_layout.tsx`
2. Move all files from `explore/` to `discover/` (except mode-dependent feed items)
3. Create `app/(tabs)/connect/` directory with `_layout.tsx`
4. Move `community/thread/[id].tsx` and `community/new.tsx` to `connect/`
5. Move `home/user/[id].tsx`, `home/connections.tsx`, `home/dm/` to `connect/`
6. Move `profile/` screens to `home/` (as `profile.tsx`, `edit-profile.tsx`, `settings.tsx`, `verify.tsx`, `delete-account.tsx`, `collections/[id].tsx`)
7. Update `app/(tabs)/_layout.tsx` — 4 tabs: home, discover, connect, trips
8. Update `TabBar.tsx` — new TAB_ICONS map, new badge logic (Connect instead of Community)
9. Remove old `explore/`, `community/`, `profile/` directories
10. **Bulk update all `router.push()` calls** across the app using the route migration map above

**Files affected**: ~40 files with router.push calls need path updates.

### Phase 2: Build New Home Tab (The Anchor)

**Goal**: Replace the old Travelers index screen with the personalized dashboard.

1. Create new `home/index.tsx` — the dashboard feed
2. Build dashboard card components:
   - `ActiveTripCard` — reuse/adapt existing trip card components
   - `UnreadMessagesCard` — pull from DM data hooks
   - `CommunityActivityCard` — pull from community feed hooks
   - `DestinationSuggestionCard` — pull from explore data
   - `SafetyEssentialsCard` — reuse emergency numbers logic
3. Build context-aware feed ordering (travelling vs planning vs dreaming)
4. Add avatar button to Home header → navigates to `home/profile`

### Phase 3: Build Connect Tab Index (The Consolidation)

**Goal**: Create the unified social screen with segment control.

1. Create `connect/index.tsx` with segment control UI
2. **Discussions segment**: Adapt community/index.tsx logic:
   - FeaturedHeroCard
   - Thread list with search
   - FAB for new thread
   - Vote handling
3. **Travelers segment**: Adapt old home/index.tsx logic:
   - Traveler sections (nearby, shared interests, suggested)
   - Username search
   - Location consent banner
   - Pending connections banner
4. Move InboxButton from global headers to Connect header only
5. Add unread badge to Connect tab icon in TabBar

### Phase 4: Clean Up Discover (The Focus)

**Goal**: Strip Discover of everything that's not destination browsing.

1. Update `discover/index.tsx`:
   - Remove `community-signal` feed item type
   - Remove `community-activity` feed item type
   - Remove `saved-in-city` feed item type
   - Remove `your-saves` feed item type
   - Remove `know-before-you-go` feed item type
   - Remove `upcoming-trip` feed item type
   - Remove `continue-exploring` feed item type
   - Keep: `countries-grid`, `popular-cities`, `collections-section`
   - Keep: IntentHero
2. Remove ModeIndicatorPill from Discover header
3. Remove InboxButton from Discover header
4. Update `useFeedItems` / `feedBuilder` to stop generating personal feed items for Discover
5. Clean header: Sola logo left, nothing right

### Phase 5: Tab Bar Visual Upgrade

**Goal**: Filled/outline icon states, updated badge, refined colors.

1. Create new icon assets (or adapt existing):
   - `icon-home.png` / `icon-home-active.png`
   - `icon-discover.png` / `icon-discover-active.png`
   - `icon-connect.png` / `icon-connect-active.png`
   - `icon-trips.png` / `icon-trips-active.png`
2. Update `TabBar.tsx`:
   - Dual icon support (active/inactive variants)
   - Badge logic moved from `community` route to `connect` route
   - Unread DM count included in badge logic
3. Slightly darken inactive color for better contrast

### Phase 6: Route Verification & Polish

**Goal**: Every navigation path works. No dead ends. No orphaned screens.

1. Verify every `router.push()` call resolves to a valid route
2. Test all flows from the User Flow Maps (Part 11)
3. Verify tab tap resets to root on all 4 tabs
4. Verify back buttons work correctly through all stacks
5. Verify deep links still work (if any exist)
6. Run `npx tsc --noEmit | grep -E '(app/|components/|data/)'` — zero errors
7. Clean up any unused imports, dead code from removed directories

---

## Part 13: What This Changes and What It Doesn't

### Changes:
- 5 tabs → 4 tabs
- Tab labels: Explore/Community/Trips/Travelers/Profile → Home/Discover/Connect/Trips
- Profile leaves the tab bar (accessed via avatar)
- Community and Travelers merge into Connect
- New personalized Home dashboard replaces the discovery feed as landing screen
- InboxButton removed from non-Connect headers
- Unread badge moves to Connect tab icon
- Explore renamed to Discover, stripped of personal/social content
- All route paths update to new directory structure

### Does NOT change:
- Screen designs within detail pages (city, country, collection, place, thread, DM, user profile)
- Data layer (API calls, hooks, types)
- Design system (colors, fonts, spacing, tokens)
- Onboarding flow
- Auth flow
- Trip creation/management flow
- Community thread/reply functionality
- Traveler search/connection functionality
- DM messaging functionality
- SOS screen

The content stays the same. Only how you access it changes.

---

## Part 14: Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Route migration breaks deep links | Audit all deep link configs before migration. Add redirects if needed. |
| Home dashboard feels empty for new users (no trip, no messages) | Design strong empty state with clear CTAs: "Plan your first trip", "Discover destinations" |
| Segment control in Connect feels buried | Default to Discussions (more content for new users). Badge draws attention to tab. |
| 4 tabs may feel sparse | Each tab has clear, substantial content. Better to feel confident than cluttered. |
| Users accustomed to old layout get confused | First-session tooltip or subtle highlight is acceptable but not required — the new layout should be self-explanatory. |
| Lots of router.push paths to update | Create a search-and-replace script or do it methodically with the route migration map. |
