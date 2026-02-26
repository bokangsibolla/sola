# Travel Identity & Smart Home Feed — Design

**Date:** 2026-02-25
**Status:** Draft
**Supersedes:** Parts of `2026-02-24-profile-page-design.md` (countries visited, interests sections)

## Problem

The Home tab is static and unintelligent — it shows the same content regardless of who you are or what you're doing. Profile identity is buried. Interests are 8 hardcoded strings disconnected from our tag system. Countries visited is a flat flag grid that nobody wants to fill out. Onboarding lets people skip name and username entirely, creating ghost accounts.

## Goal

Transform the Home tab into a context-aware travel dashboard that mixes identity, trips, discovery, and community through a consistent visual card system. Rebuild interests to connect to the tag database. Replace the flag grid with a visual travel map. Enforce core identity at signup.

## Architecture

Seven interconnected pieces, designed as one system:

1. **Card Engine** — state machine driving Home feed composition
2. **Card Types** — five card families with consistent visual language
3. **Feed Assembly** — rules mapping user state to card selection
4. **Interests System** — connected to tags DB via `profile_tags` junction table
5. **Travel Map** — visual countries-visited card replacing FlagGrid
6. **Onboarding Enforcement** — name/username/country required at signup
7. **Visual System** — shared card dimensions, radii, press states

---

## 1. Card Engine

The Home feed is assembled dynamically based on user state. No hardcoded feed — the card engine evaluates your current situation and builds the right mix.

### User States

| State | Condition | Primary Focus |
|-------|-----------|---------------|
| **New** | < 7 days since signup, no trips | Identity setup, inspiration |
| **Planning** | Has a trip with status `planned` | Trip prep, destination tips |
| **Traveling** | Has a trip with status `active` | Live trip, safety, local discovery |
| **Returned** | Completed a trip in last 14 days | Reflection, photos, community sharing |
| **Idle** | None of the above | Re-engagement, new inspiration |

State is derived client-side from profile and trip data — no new DB column needed.

### State Detection Logic

```typescript
function getUserState(profile: Profile, trips: TripWithStops[]): UserState {
  const now = new Date();
  const signupDate = new Date(profile.createdAt);
  const daysSinceSignup = diffDays(now, signupDate);

  const activeTrip = trips.find(t => t.status === 'active');
  if (activeTrip) return 'traveling';

  const recentCompleted = trips.find(
    t => t.status === 'completed' && diffDays(now, new Date(t.leaving)) <= 14
  );
  if (recentCompleted) return 'returned';

  const plannedTrip = trips.find(t => t.status === 'planned');
  if (plannedTrip) return 'planning';

  if (daysSinceSignup <= 7 && trips.length === 0) return 'new';

  return 'idle';
}
```

---

## 2. Card Types

Five card families. Every card shares the same visual language (see Section 7).

### Identity Cards

Surface your travel identity — stats, map, profile completeness.

| Card | Trigger | Content |
|------|---------|---------|
| **Travel Map** | Has ≥ 1 country | SVG map with highlighted countries, stat line |
| **Profile Completeness** | Missing avatar/bio/interests | Progress ring, "Complete your profile" CTA |
| **Stats Snapshot** | Has ≥ 1 trip | "12 countries · 8 trips · 3 continents" |

### Trip Cards

Your active travel context — the trip you're on, or the one you're planning.

| Card | Trigger | Content |
|------|---------|---------|
| **Active Trip** | status = active | Cover image, destination, day count, quick actions |
| **Upcoming Trip** | status = planned, arriving within 30 days | Countdown, destination, weather preview |
| **Trip Recap** | Completed in last 14 days | Cover image, "Add photos", "Share your experience" |

### Discovery Cards

Places, activities, and destinations tailored to your state and interests.

| Card | Trigger | Content |
|------|---------|---------|
| **Recommended City** | Always (except traveling) | City hero image, solo rating, one-line pitch |
| **Activity Spotlight** | Planning or traveling | Activity image, city name, type pill |
| **Collection** | Always | Collection hero, title, place count |

### Community Cards

Threads and conversations relevant to your context.

| Card | Trigger | Content |
|------|---------|---------|
| **Trending Thread** | Always | Thread title, reply count, author avatar |
| **Destination Thread** | Planning/traveling | Thread from your destination's community |

### Nudge Cards

Gentle prompts to build out profile or engage with the app.

| Card | Trigger | Content |
|------|---------|---------|
| **Avatar Nudge** | No avatar, not dismissed in 7 days | "Add a profile photo" + one-tap picker |
| **Interests Nudge** | No interests selected | "What kind of traveler are you?" |
| **First Trip Nudge** | No trips, > 3 days since signup | "Plan your first trip" |
| **Verification Nudge** | Unverified, not dismissed | Existing VerificationNudge component |

---

## 3. Feed Assembly

Each user state has a recipe — a prioritized list of cards to show.

### New User Feed
1. Profile Completeness card (if incomplete)
2. Avatar Nudge (if no avatar)
3. Interests Nudge (if no interests)
4. Recommended City × 2
5. Collection × 1
6. Trending Thread × 1
7. First Trip Nudge

### Planning Feed
1. Upcoming Trip card
2. Activity Spotlight (from destination) × 2
3. Destination Thread (from destination)
4. Recommended City × 1 (different country)
5. Collection × 1

### Traveling Feed
1. Active Trip card (pinned at top)
2. Activity Spotlight (nearby) × 2
3. Destination Thread
4. Community prompt: "How's your trip going?"

### Returned Feed
1. Trip Recap card
2. Stats Snapshot (updated numbers)
3. Travel Map (with newly highlighted country)
4. Trending Thread × 1
5. Recommended City × 1 ("Where next?")

### Idle Feed
1. Travel Map (if has countries)
2. Stats Snapshot (if has trips)
3. Recommended City × 2
4. Collection × 1
5. Trending Thread × 1
6. Nudge card (rotate: interests, trip, verification)

### Assembly Rules
- Maximum 8 cards per feed load
- No two cards of the same type adjacent (interleave)
- Nudge cards: max 1 per feed, never at position 0
- Discovery cards: fill remaining slots after identity/trip/community
- Pull-to-refresh rebuilds the feed with fresh data

---

## 4. Interests System

### Current Problem

Interests are stored as `text[]` on the `profiles` table — 8 hardcoded strings like "Being outdoors" and "Trying the food" from `day-style.tsx`. They're disconnected from our tag system and can't power recommendations or matching.

### New Design

Connect interests to the existing tag infrastructure via a junction table.

#### New Table: `profile_tags`

```sql
CREATE TABLE profile_tags (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_slug   text NOT NULL,
  tag_label  text NOT NULL,
  tag_group  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, tag_slug)
);

CREATE INDEX idx_profile_tags_slug ON profile_tags(tag_slug);
CREATE INDEX idx_profile_tags_group ON profile_tags(tag_group);

ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read (for profile viewing + matching)
CREATE POLICY "profile_tags_select"
  ON profile_tags FOR SELECT
  TO authenticated
  USING (true);

-- Only owner can manage their tags
CREATE POLICY "profile_tags_insert"
  ON profile_tags FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_tags_delete"
  ON profile_tags FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());
```

#### Why `tag_slug` Instead of FK to `tags.id`

The existing `tags` table is for place tags (vibe, amenity, cuisine). Profile interests span a broader set — travel style, food preferences, activity types. Using slug strings (matching `destination_tags.tag_slug` conventions) keeps things flexible without coupling to the place tag schema.

#### Interest Groups

Three groups, each presented as a question in the picker:

**Group 1: "What draws you to a place?"** (`travel_draw`)
- History & culture
- Nature & outdoors
- Beach & coast
- City life
- Wellness & spiritual
- Adventure & adrenaline
- Art & design
- Nightlife & social

**Group 2: "What do you love eating?"** (`cuisine_pref`)
- Street food
- Local cuisine
- Fine dining
- Vegetarian & vegan
- Seafood
- Coffee & cafe culture
- Market food
- Cooking classes

**Group 3: "Your travel vibe?"** (`travel_vibe`)
- Slow & intentional
- Packed itinerary
- Spontaneous
- Photography-driven
- Budget backpacker
- Comfort & luxury
- Solo by choice
- Open to connections

#### Picker UI

- Full-screen modal or push screen
- One group per section, title is the question
- Chips in wrap layout, multi-select
- No minimum, no maximum
- Orange fill when selected, neutral when not
- "Save" button at bottom
- Used in both onboarding (day-style screen replacement) and edit-profile

#### Migration from `text[]`

- Keep `profiles.interests` column for backward compatibility during transition
- New code reads from `profile_tags` table
- One-time migration script maps old text values to new slugs:
  - "History & culture" → `history-culture` in `travel_draw`
  - "Being outdoors" → `nature-outdoors` in `travel_draw`
  - "Trying the food" → `local-cuisine` in `cuisine_pref`
  - "Going out at night" → `nightlife-social` in `travel_draw`
  - "Rest & wellness" → `wellness-spiritual` in `travel_draw`
  - "Adventure & sports" → `adventure-adrenaline` in `travel_draw`
  - "Shopping & markets" → `market-food` in `cuisine_pref`
  - "Art & creativity" → `art-design` in `travel_draw`

#### Profile Display

On the profile page, interests show as pills grouped by category:

```
What draws me          Nature & outdoors · City life · Art & design
What I eat             Street food · Coffee & cafe culture
My vibe                Slow & intentional · Solo by choice
```

When viewing someone else's profile, shared interests get `orangeFill` background.

---

## 5. Travel Map

### Current Problem

The FlagGrid is a flat row of emoji flags. It looks like data entry, not a travel story. Nobody wants to manually add flags to a list.

### New Design: Travel Map Card

A single visual card that shows your travel footprint.

#### What It Looks Like

- Warm-toned minimal world map SVG (low detail, continental outlines)
- Visited countries highlighted with orange fill (`colors.orange` at 0.3 opacity)
- Below the map: stat line — `"12 countries · 3 continents"`
- Card height: ~180px, same visual weight as a trip card
- `cardLg` radius, no border (the map illustration fills the space)

#### Tap Interaction

Tapping the Travel Map card expands inline (or pushes to a detail view) showing countries grouped by continent:

```
Africa (3)
  🇿🇦 South Africa  ·  🇳🇦 Namibia  ·  🇹🇿 Tanzania

Southeast Asia (5)
  🇹🇭 Thailand  ·  🇻🇳 Vietnam  ·  🇰🇭 Cambodia  ·  🇱🇦 Laos  ·  🇮🇩 Indonesia

Europe (4)
  🇵🇹 Portugal  ·  🇪🇸 Spain  ·  🇮🇹 Italy  ·  🇬🇷 Greece
```

Footer: **"+ Add a country"** link for manual additions.

#### Data Sources (unchanged)

- **Primary**: Trip destinations — trip stops automatically contribute countries
- **Secondary**: `user_visited_countries` table — for pre-Sola travel history
- **Merge**: Deduplicate with `Array.from(new Set(...))` (Hermes-safe: `Array.from(set)`)

#### Continent Mapping

Static lookup from ISO2 country code to continent:

```typescript
const CONTINENT_MAP: Record<string, string> = {
  TH: 'Southeast Asia', VN: 'Southeast Asia', KH: 'Southeast Asia',
  ZA: 'Africa', NA: 'Africa', TZ: 'Africa',
  PT: 'Europe', ES: 'Europe', IT: 'Europe',
  // ... all countries
};
```

This is a pure utility — no DB query needed.

#### SVG Map Component

Use a lightweight world map SVG (~20KB) with country paths identified by ISO2 code. On render, apply orange fill to visited country paths. Libraries like `react-native-svg` (already in the project) can handle this.

Alternatively, for v1: use a static pre-rendered map image with country overlay regions. The SVG approach is better but more work.

**Recommendation: Start with the continent-grouped list view as v1.** Add the SVG map visualization as v2. The grouped list already solves the core problem (making countries visited engaging and story-like) without the SVG complexity.

#### Where It Appears

- **Profile page**: Replaces the FlagGrid section
- **Home feed**: As an Identity card in returned/idle states
- **Others' profiles**: Read-only, tappable to see continent grouping

---

## 6. Onboarding Enforcement

### Current Problem

Onboarding collects first name, country, and date of birth — but username is never collected. Accounts can exist without a username, which breaks profile URLs and traveler matching.

### Required at Signup

Three fields gate entry to the main app. Collected on a single screen after auth, before any optional screens.

| Field | Validation | Source |
|-------|-----------|--------|
| **First name** | Min 1 char, max 50 | Existing `profile.tsx` screen |
| **Username** | 3-20 chars, lowercase alphanumeric + dots/underscores, unique | New field on `profile.tsx` |
| **Home country** | Must select from list | Existing `profile.tsx` screen |

#### Username Auto-Suggestion

When the user types their first name, auto-suggest a username:

```typescript
function suggestUsername(firstName: string): string {
  const base = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.floor(Math.random() * 900) + 100; // 3-digit
  return `${base}${suffix}`;
}
```

Display as pre-filled but editable. Inline validation checks uniqueness on blur (debounced Supabase query).

#### Screen: "Set up your profile"

```
[Avatar placeholder — tap to add photo (optional)]

First name
[_______________]

Username
[@_______________]  ← auto-suggested, editable
                     "Available ✓" or "Taken — try sarah.travels?"

Where are you from?
[Country picker dropdown]

[Continue →]
```

Single screen, three required fields, clean layout. This replaces the current `profile.tsx` onboarding screen (which already collects first name and country but not username).

#### Interests in Onboarding

After the required profile screen, the new interests picker appears as an optional-but-encouraged screen:

- Title: "What kind of traveler are you?"
- Three groups of chips (from Section 4)
- Multi-select, no minimum
- "Skip for now" link at bottom
- "Continue" button saves selections to `profile_tags`

This replaces the current `day-style.tsx` screen.

---

## 7. Visual System

Consistent card language across Home feed, profile, and all surfaces.

### Card Dimensions

| Card Type | Height | Background | Radius |
|-----------|--------|-----------|--------|
| Trip card (profile) | 200px | Full-bleed image + gradient | `radius.cardLg` (16px) |
| Travel Map card | ~180px | SVG/illustration | `radius.cardLg` |
| Discovery card (Home) | 180px | Full-bleed image + gradient | `radius.cardLg` |
| Active Trip card (Home) | 200px | Full-bleed image + gradient | `radius.cardLg` |
| Community card | auto | `colors.neutralFill` | `radius.cardLg` |
| Nudge card | auto | `colors.orangeFill` | `radius.cardLg` |
| Identity/Stats card | auto | `colors.neutralFill` | `radius.cardLg` |

### Shared Rules

- **All cards**: `radius.cardLg`, no shadows, `overflow: 'hidden'`
- **Image cards**: `LinearGradient` overlay (`transparent` → `rgba(0,0,0,0.6)`), white text at bottom
- **Text cards**: `neutralFill` (#F3F3F3) or `orangeFill` (#FFF5F1) background
- **Press state**: `opacity: 0.9, transform: [{ scale: 0.98 }]` (from `pressedState` in design tokens)
- **Screen padding**: `spacing.screenX` (24px) on all horizontal edges
- **Card spacing**: `spacing.md` (12px) between cards vertically
- **Typography on cards**: Title in `fonts.semiBold` 18px, subtitle in `fonts.medium` 13px
- **No borders on image cards**: Image fills edge to edge within radius
- **1px border on text cards**: `borderWidth: 1, borderColor: colors.border`

### Component Reuse

The card system should be built from composable primitives:

```
BaseCard          — shared dimensions, radius, press state, overflow
  ImageCard       — adds image background, gradient, bottom text overlay
  TextCard        — adds background color, padding, content slot
  NudgeCard       — extends TextCard with orangeFill default + dismiss logic
```

---

## Data Requirements

### New DB Objects
- `profile_tags` table (Section 4)
- `username` column on `profiles` — already exists but nullable; add NOT NULL constraint for new signups

### New API Functions
- `getProfileTags(userId)` — fetch profile_tags for a user
- `setProfileTags(tags)` — upsert profile_tags (delete old + insert new)
- `checkUsernameAvailable(username)` — uniqueness check

### Existing Data (sufficient)
- `user_visited_countries` table — no changes needed
- `profiles` table — has all identity fields
- `trips` + `trip_stops` — trip data for state detection and card content
- `community_threads` — for community cards
- `destination_tags` — for matching interests to destinations (future recommendation enhancement)

### No New External Dependencies
- World map SVG: static asset, no library needed beyond `react-native-svg` (already installed)
- Continent mapping: static TypeScript lookup

---

## File Plan

```
# New files
components/home/CardEngine.tsx            — state detection + feed assembly logic
components/home/cards/ImageCard.tsx        — base image card (gradient overlay)
components/home/cards/TextCard.tsx         — base text card (neutral/orange bg)
components/home/cards/TripCard.tsx         — active/upcoming/recap trip cards
components/home/cards/DiscoveryCard.tsx    — recommended city, activity spotlight
components/home/cards/CommunityCard.tsx    — trending/destination thread
components/home/cards/NudgeCard.tsx        — nudge cards with dismiss logic
components/home/cards/TravelMapCard.tsx    — map visualization + stat line
components/home/cards/StatsCard.tsx        — countries · trips · continents
components/home/cards/ProfileProgress.tsx  — profile completeness ring
components/profile/InterestPicker.tsx      — grouped chip picker (modal/screen)
components/profile/TravelMap.tsx           — expanded continent-grouped list
components/profile/InterestPills.tsx       — display pills on profile page

# Modified files
app/(tabs)/home/index.tsx                 — replace static content with CardEngine feed
app/(tabs)/travelers/user/[id].tsx        — swap FlagGrid for TravelMap, interests for InterestPills
app/(onboarding)/profile.tsx              — add username field, enforce required
app/(onboarding)/day-style.tsx            — replace with new interest groups from profile_tags
app/(tabs)/home/edit-profile.tsx          — add interest editing via InterestPicker
state/onboardingStore.ts                  — add username to onboarding data
data/api.ts                               — add profile_tags queries

# New migration
supabase/migrations/20260225_profile_tags.sql
```

---

## Out of Scope

- SVG world map with country path highlighting (v2 — start with continent list)
- AI-powered card ranking (v2 — start with rule-based assembly)
- Weather data on trip cards (requires external API)
- Push notifications triggered by state changes
- Shared travel map (social feature)
- Profile tag-based traveler matching algorithm
