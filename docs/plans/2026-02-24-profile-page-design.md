# Profile Page & Travel Identity — Design

**Date:** 2026-02-24
**Status:** Draft

## Problem

Sola has no profile page. When you tap a traveler, there's nowhere to go. Profiles are invisible — no way to see someone's travel history, countries visited, or trip photos. There's no incentive to upload photos or build out your travel identity. The Travelers tab cards are functional but don't convey who someone is as a traveler.

## Design Decisions

- **One profile screen** for both viewing others and viewing yourself (`isOwn` flag toggles edit affordance)
- **Full-bleed trip cards** (Polarsteps-style) with cover images as the main visual content
- **Gentle nudges** over gates — auto-populate countries from completed trips, prompt for photos at natural moments
- **Travelers tab stays clean** — small enhancements (bigger avatar, flag row, country count) but the visual payoff is on the profile page itself

## Profile Page Structure

### Screen: `app/(tabs)/travelers/[id].tsx`

Push screen from Travelers tab (and accessible from anywhere via `router.push`). Also used as "My Profile" from Home tab avatar menu.

### Sections (top to bottom)

#### 1. Hero Section
- Large circular avatar (88px)
- If no avatar: neutral placeholder with user icon
- Name (20px semiBold) + home country flag emoji
- Verified badge inline (small green checkmark) if `verificationStatus === 'verified'`
- Bio text (15px regular, textSecondary, max 3 lines)

#### 2. Stats Row
Horizontal, evenly spaced, understated:
- `X countries` — from visited countries count
- `X trips` — from public/completed trip count
- `Joined Mon YYYY` — from `createdAt`

Typography: number in semiBold 17px, label in regular 13px textMuted. No icons, no colorful counters.

#### 3. Action Buttons
- **Viewing others**: "Connect" button (orange outline) + connection status handling (pending_sent, connected, etc.)
- **Viewing self**: "Edit profile" button (neutral outline) that pushes to `home/edit-profile`
- Full width, single button, 44px height

#### 4. Countries Visited
- Section title: "Countries visited" (17px semiBold)
- Flag grid: emoji flags in a horizontal wrap layout, 28px each with 8px gap
- If more than 15 flags: show first 15 + "+X more" pill
- Tapping the section or "+X more" expands to show full list with country names + trip counts (reuse existing `VisitedCountries` component in a bottom sheet or inline expand)
- If no countries: hide section entirely (don't show empty state here)

#### 5. Trips
- Section title: "Trips" (17px semiBold)
- Only shows trips with `privacyLevel` that permits viewing (public always, friends if connected, private never)
- **Trip card design**: Full-bleed image, 200px tall, rounded corners (radius.card)
  - Cover image fills the card (`contentFit: 'cover'`)
  - Bottom gradient overlay (transparent → rgba(0,0,0,0.6))
  - Trip title or destination name (18px semiBold, white) at bottom-left
  - Date range (13px medium, white 0.8 opacity) below title
  - Status pill top-right if not completed ("Planned", "Active")
  - **No cover image fallback**: Use city/country hero image from our DB if available, otherwise a subtle warm gradient with destination name centered
- Vertical list, 12px gap between cards
- If no visible trips: "No trips yet" (textMuted, centered)
- **Viewing self with no trips**: "Plan your first trip" CTA button

#### 6. Interests
- Section title: "Interests" (17px semiBold)
- Pill chips in wrap layout (same style as TravelerCard tags)
- If viewing someone else: highlight shared interests with orangeFill background
- If no interests: hide section

### Navigation

- **Back button** top-left (standard push screen header)
- **Overflow menu** (three dots) top-right for others: "Report", "Block"
- **Overflow menu** for self: "Settings", "Share profile" (future)

## Nudging System

### Auto-populate countries
- When a trip status changes to `completed`, check if its `countryIso2` countries (from stops) are in `user_visited_countries`
- If not, auto-insert them
- Implementation: client-side check in `updateTrip` flow, or a Supabase trigger (trigger preferred — works regardless of client)

### Cover photo nudge
- In trip creation/edit form: move cover image to the **top** of the form
- Large tappable area (180px tall, dashed border when empty) with "Add a cover photo" text
- When a trip is marked completed without a cover image: show a subtle banner on the trip card on the profile: "Add a photo" with camera icon — one tap opens picker

### Profile photo nudge
- On Home tab: if `avatarUrl` is null, show a nudge card (similar style to VerificationNudge)
- Copy: "Add a profile photo" / "Other travelers are more likely to connect when they can see who you are"
- One-tap action opens image picker directly
- Dismissible, but reappears after 7 days if still no avatar

## TravelerCard Enhancements

Small upgrades to the existing card, no layout change:

1. **Avatar**: 56px → 64px
2. **Flags row**: Below location line, show first 5 country flag emojis from visited countries (inline, 16px each, 4px gap). If no visited countries, hide.
3. **Country count**: After flags, subtle `+X` text if more than 5 countries (13px, textMuted)
4. **onPress**: Now pushes to `travelers/[id]` profile page (currently does nothing meaningful)

## Data Requirements

### New API functions needed
- `getPublicProfile(userId)` — profile + visited countries + public trips (single query or parallel)
- `getVisitedCountriesForUser(userId)` — already exists as `getUserVisitedCountries`
- `getPublicTripsForUser(userId)` — trips with privacy filtering

### Existing data that's sufficient
- `Profile` type has everything needed for the hero
- `TripFull` has `coverImageUrl`, `title`, `destinationName`, dates, status, privacyLevel
- `user_visited_countries` table is ready
- `VisitedCountriesEditor` works for edit flow
- Connection status system is complete

### No new DB tables needed
Everything uses existing tables: `profiles`, `user_visited_countries`, `trips`, `trip_stops`.

### Optional DB enhancement
- Supabase trigger: auto-insert visited countries when trip status → completed
- This is nice-to-have, can be done client-side initially

## File Plan

```
app/(tabs)/travelers/[id].tsx          — Profile screen (new)
components/profile/ProfileHero.tsx     — Avatar, name, bio, stats (new)
components/profile/ProfileTrips.tsx    — Trip card list (new)
components/profile/ProfileTripCard.tsx — Single full-bleed trip card (new)
components/profile/FlagGrid.tsx        — Country flag emoji grid (new)
components/TravelerCard.tsx            — Enhanced (edit existing)
components/home/AvatarNudge.tsx        — Profile photo nudge card (new)
data/profile/profileApi.ts            — Profile page queries (new)
```

## Out of Scope (v2)

- Travel stats drill-down (total days traveled, continents, world %, furthest from home)
- World map visualization
- Community activity on profile (thread count, recent posts)
- "Share profile" deep link
- Photo gallery per trip (multiple images)
- Follower/following counts (Sola uses connections, not follows)
