# Medium Priority Tooling — Implementation Plan

## Context

High-priority items are complete:
- Sentry error tracking (committed)
- Supabase Realtime for live messaging (committed + migration run)
- Expo Push Notifications with Edge Function (committed + deployed + webhook created)
- EAS project linked

This plan covers the 3 medium-priority items from the tooling strategy.

---

## 1. Supabase Image CDN + Transforms

**What:** Serve profile avatars and any future images at the right size for each screen using Supabase Storage image transforms (e.g. `?width=200&height=200`).

**Files to change:**
- Any component rendering `avatarUrl` — add width/height query params to the storage URL
- Create a small utility like `getImageUrl(path, { width, height })` in `lib/image.ts`

**Steps:**
1. Enable image transforms on the Supabase Storage bucket (Dashboard > Storage > avatars bucket > Settings)
2. Create `lib/image.ts` with a helper that appends `?width=X&height=X` to Supabase storage URLs
3. Update avatar rendering in conversation rows (`app/(tabs)/home/dm/index.tsx`), profile screens, and traveler cards to use the helper
4. Use `width=96` for list thumbnails, `width=200` for profile headers

**No new dependencies required.**

---

## 2. PostHog Analytics

**What:** Privacy-respecting product analytics to understand which features are used, where users drop off in onboarding, and which destinations are popular.

**Steps:**
1. Install `posthog-react-native`
2. Create a PostHog project at https://app.posthog.com (free tier = 1M events/month)
3. Initialize PostHog provider in `app/_layout.tsx` with the project API key
4. Add event tracking to key moments:
   - `onboarding_completed` — end of onboarding flow
   - `message_sent` — in DM thread send handler
   - `sos_tapped` — in SOSButton component
   - `trip_created` — in trip creation flow
   - `place_saved` — when saving to a collection
   - `country_viewed` / `city_viewed` — on destination detail screens
5. Identify users with their userId after login (no PII — just the anonymous ID)

**Files to change:**
- `app/_layout.tsx` — add PostHogProvider
- `app/(tabs)/home/dm/[id].tsx` — track message_sent
- `components/SOSButton.tsx` — track sos_tapped
- `app/(onboarding)/trip-details.tsx` or wherever onboarding completes — track onboarding_completed
- Destination screens — track views

**New dependency:** `posthog-react-native`

---

## 3. API Pagination

**What:** Right now queries like `getProfiles()`, `getPlaces()`, and `getConversations()` load all rows at once. Add cursor-based pagination using Supabase's `.range()` to load data in pages.

**Steps:**
1. Add a `PaginatedResult<T>` type to `data/types.ts`:
   ```ts
   interface PaginatedResult<T> {
     data: T[];
     hasMore: boolean;
   }
   ```
2. Update these API functions in `data/api.ts` to accept `{ page, pageSize }` params:
   - `getProfiles()` — traveler discovery feed
   - `getPlaces()` / `getPlacesByCity()` — place listings
   - `getConversations()` — DM list
   - `getMessages()` — message history (load latest N, scroll up for older)
3. Create a `usePaginatedData` hook in `hooks/usePaginatedData.ts` that wraps React Query's `useInfiniteQuery`
4. Update screens to use `FlatList` with `onEndReached` for infinite scroll:
   - `app/(tabs)/home/index.tsx` — traveler feed
   - `app/(tabs)/home/dm/index.tsx` — conversation list
   - `app/(tabs)/home/dm/[id].tsx` — message history (inverted, load older on scroll up)
   - Place listing screens

**Default page size:** 20 items

**No new dependencies required** — React Query already supports `useInfiniteQuery`.

---

---

## 4. Mapbox or Google Maps Integration (Low Priority)

**What:** Show places, traveler locations, and trip routes on visual maps. The database already stores lat/lng — this makes it visual.

**Steps:**
1. Install `react-native-maps` (Google Maps) or `@rnmapbox/maps` (Mapbox)
2. Create a reusable `MapView` component in `components/MapView.tsx`
3. Add map to city detail screen showing places as pins
4. Add map to trip detail screen showing itinerary route
5. Optionally add "Travelers near me" map to home/discover

**Decision needed:** Mapbox (free up to 25K map loads/month, more customizable styling) vs Google Maps ($200/month free credit, more familiar). Mapbox recommended for Sola's aesthetic.

**New dependency:** `@rnmapbox/maps` or `react-native-maps`

---

## 5. RevenueCat (Low Priority — When Monetizing)

**What:** Handle App Store and Google Play subscriptions without dealing with receipt validation, renewal logic, or platform differences.

**Steps:**
1. Create a RevenueCat account at https://app.revenuecat.com
2. Install `react-native-purchases`
3. Configure products in RevenueCat dashboard (map to App Store Connect / Google Play Console products)
4. Initialize RevenueCat in `app/_layout.tsx`
5. Create a paywall screen in `app/(tabs)/profile/premium.tsx`
6. Gate premium features behind entitlement checks using a `usePremium()` hook

**Decision needed:** What's premium vs free. Common pattern for travel apps:
- Free: browse destinations, basic messaging, SOS
- Premium: unlimited trip planning, verified badge, priority support

**New dependency:** `react-native-purchases`

---

## 6. MCP for AI Features (Low Priority — When You Have Users)

**What:** Model Context Protocol — a standard way to connect AI models to your app's data. Enables features like a travel planning assistant or smart recommendations.

**Steps (when ready):**
1. Define MCP tools that expose Sola's data (places, trips, safety info)
2. Build a Supabase Edge Function that acts as the MCP server
3. Create a chat-style UI screen for the AI assistant
4. Connect to Claude or another LLM provider via their API

**Example tools to expose:**
- `search_places({ city, category, vibe })` — find places matching criteria
- `get_safety_info({ country })` — safety ratings and emergency numbers
- `plan_trip({ destination, dates, interests })` — generate itinerary from existing place data

**Decision needed:** Which AI provider, whether to gate behind premium. Revisit after understanding what users actually want.

---

## 7. Offline-First Caching (Low Priority — Post-Launch)

**What:** Make the app work without internet using a local database that syncs with Supabase. Critical for travelers in areas with poor connectivity.

**Steps (when ready):**
1. Install WatermelonDB (`@nozbe/watermelondb`)
2. Define local schemas mirroring key Supabase tables (countries, cities, places, trips, saved places)
3. Build sync adapter that pulls from Supabase and resolves conflicts
4. Migrate screens to read from local DB first, sync in background
5. Cache safety/emergency data locally (highest priority for offline)

**This is a significant architecture change.** Plan for it but don't build it before launch. Prioritize caching emergency numbers and saved trip data first.

**New dependency:** `@nozbe/watermelondb`

---

## Order of implementation

**Medium (do before/at launch):**
1. **Image CDN** (smallest change, immediate UX improvement)
2. **Pagination** (architectural, should be done before user growth)
3. **PostHog** (can be added anytime, no architectural dependency)

**Low (do after launch, as needed):**
4. **Mapbox** (when you want visual maps)
5. **RevenueCat** (when you decide on monetization)
6. **MCP / AI features** (when you understand what users want)
7. **Offline caching** (when users report connectivity issues)

---

## Summary of what was completed in the previous session

| Commit | Description |
|--------|-------------|
| `76f672f` | Sentry error tracking setup |
| `76388bb` | Supabase Realtime for live messaging |
| `7e00894` | Push notifications + Edge Function + push_tokens table |

Migrations run manually on Supabase:
- `00006` — Realtime replication for messages table
- `00007` — push_tokens table + RLS

Edge Function deployed: `push-on-message`
Database webhook created: messages INSERT → push-on-message
