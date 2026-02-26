# Travelers Feed Redesign — Social Discovery Without Trip Gate

**Date**: 2026-02-25
**Status**: Design approved, ready for implementation

## Problem

The Travelers tab is currently trip-gated. If you don't have an active trip with `matching_opt_in=true`, you see an empty state telling you to plan a trip. This makes the tab useless for:

- Women at home who want to meet travelers passing through their city
- Women who want to browse by shared travel experience (visited same countries)
- Women looking for travelers from their home country
- Anyone who just wants to see the community before committing to a trip

## Design Decisions

- **Vibe**: Social feed — scroll through profiles of real women travelers, discover people organically
- **Primary signal**: Proximity first — "who's near me?" is the most natural question
- **No trip gate**: The feed always shows something, whether you're traveling or at home
- **Layout**: Sectioned horizontal scroll carousels (Spotify/Netflix pattern)
- **Home state**: Show travelers visiting your home city — your city becomes a hosting signal

## Feed Sections

### When Traveling (active location sharing or active trip)

| Priority | Section Title | Data Source | Card Context Label |
|----------|--------------|-------------|-------------------|
| 1 | **Near You** | `profiles.location_city_name` match + lat/lng distance | "0.5km away" |
| 2 | **Also in [Country]** | Same `location_country_name`, different city | "In Chiang Mai" |
| 3 | **Trip Overlap** | `trip_overlap_matches` view (existing) | "Also here Jan 5-12" |
| 4 | **Been Where You've Been** | `user_visited_countries` intersection | "Also visited Portugal, Thailand +2" |
| 5 | **From Your Country** | `profiles.home_country_iso2` match | "Cape Town" (their city) |
| 6 | **Shared Interests** | `profiles.interests` array overlap | "hiking, photography, food" |

### When At Home (no active trip, location not shared or location = home city)

| Priority | Section Title | Data Source | Card Context Label |
|----------|--------------|-------------|-------------------|
| 1 | **Travelers in [Your City]** | Others with `location_city_name` = user's home city | "Visiting from Brazil" |
| 2 | **Been Where You've Been** | `user_visited_countries` intersection | "Also visited Portugal, Vietnam" |
| 3 | **From Your Country** | `profiles.home_country_iso2` match | "Also from South Africa" |
| 4 | **Shared Interests** | `profiles.interests` array overlap | "Also into diving, food" |

### Section Rules

- Sections only appear if they have results (no empty sections)
- A user appears in the **highest-priority section only** (deduplication)
- Each section scrolls horizontally with existing `TravelerCard` components
- "See all" link at end of each section (future: navigates to filtered list view)
- Sections use existing `SectionHeader` component from `components/travelers/`

## TravelerCard Changes

The existing `TravelerCard` already supports `contextLabel`, `sharedInterests`, and `visitedCountryIso2s`. Changes needed:

1. **Always show visited country flags** — up to 5 flag emojis + "+N" count. Currently only shown on profile pages, should show on feed cards too for instant travel-experience signal.
2. **Section-aware context labels** — each section generates its own context string (see table above).
3. No other card layout changes needed.

## Data Layer

### New API Functions

**1. `getTravelersInCity(userId, cityName, blockedIds)`**
- Query `profiles` where `location_city_name = cityName` AND `is_discoverable = true`
- Exclude self and blocked users
- Similar to existing `getNearbyTravelers()` but without trip requirement

**2. `getTravelersWithSharedCountries(userId, userCountryIds, blockedIds)`**
- Join `user_visited_countries` to find users with overlapping country lists
- Return overlap count for sorting (most shared countries first)
- Include the overlapping country names for context label

**3. `getTravelersFromHomeCountry(userId, countryIso2, blockedIds)`**
- Query `profiles` where `home_country_iso2 = countryIso2` AND `is_discoverable = true`
- Exclude self and blocked users

**4. `getTravelersInCountry(userId, countryName, blockedIds)`**
- Already exists in API — just needs to be wired into the feed

### Existing Functions (No Changes)

- `getTripCityMatches()` — Tier 3 trip overlap (stays as-is)
- `getTripCountryMatches()` — Part of trip overlap (stays as-is)
- `getTravelersWithSharedInterests()` — Tier 6 shared interests (stays as-is)
- `getConnectionStatus()` — For card button state
- `getConnectedUserIds()` — For filtering
- `getBlockedUserIds()` — For filtering

### New Feed Hook: `useTravelersFeedV2`

Replaces the trip-gated `useTravelersFeed`:

```typescript
function useTravelersFeedV2(): {
  sections: TravelerSection[];
  isLoading: boolean;
  error: Error | null;
  connectedProfiles: Profile[];
  pendingReceived: ConnectionRequest[];
  userProfile: Profile | null;
}

interface TravelerSection {
  id: string;                    // 'near-you' | 'same-country' | etc.
  title: string;                 // "Near You in Bangkok"
  travelers: TravelerCardData[];
  contextType: SectionContextType;
}

interface TravelerCardData {
  profile: Profile;
  connectionStatus: ConnectionStatus;
  contextLabel: string;
  sharedInterests: string[];
  visitedCountryIso2s: string[];
}
```

**Logic:**

1. Determine context: `isTraveling` = has active location sharing AND location differs from home city, OR has an active trip
2. Fire all section queries in parallel via React Query
3. Build section list based on context (traveling vs. home)
4. Deduplicate: track seen user IDs, skip users already in a higher-priority section
5. Filter out empty sections

### No Schema Changes

Everything uses existing columns and tables:
- `profiles.location_city_name`, `location_country_name`, `location_lat`, `location_lng`
- `profiles.home_country_iso2`, `home_country_name`
- `profiles.interests`
- `profiles.is_discoverable`
- `user_visited_countries` table
- `trip_overlap_matches` view
- `blocked_users` table

## Privacy

- All discovery respects `is_discoverable` flag (existing)
- Location only shown if `location_sharing_enabled = true` (existing)
- Distance shown only if both users have lat/lng (graceful degradation to city name)
- Blocked users excluded from all queries (existing)
- No new privacy surfaces — we're using existing opt-in flags

## Screen States

1. **Full feed** — At least one section has results. Show sections.
2. **Empty feed** — No sections have results (new user, no visited countries, no interests, no location). Show a warm onboarding state: "Complete your profile to discover travelers" with CTAs to add interests, visited countries, and home city.
3. **Loading** — Skeleton cards in horizontal scroll (existing pattern).

## Implementation Notes

- Keep the segmented control (Travelers / Activities) — this redesign is for the Travelers segment only
- Keep the search bar at top — username search is orthogonal to feed
- Keep the `PendingConnectionsBanner` above the feed
- The existing `TravelerCard` component needs minimal changes (just always show flags)
- New hook `useTravelersFeedV2` replaces `useTravelersFeed` — old hook can be removed after migration
