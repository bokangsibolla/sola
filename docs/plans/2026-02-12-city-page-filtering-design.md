# City Page Filtering & Navigation Redesign

**Date:** 2026-02-12
**Status:** Approved
**Goal:** Make city pages (e.g. El Nido) easier to navigate and filter without breaking the existing editorial design.

## Problem

City pages are a long vertical scroll. Finding specific information (e.g. "show me hostels" or "what activities cost under $$") requires scrolling through the entire page. The narrative structure is beautiful but lacks quick access and filtering.

## Solution: Three Additions

### 1. Sticky Section Navigator

A minimal horizontal tab bar that appears when the user scrolls past the hero image.

**Specs:**
- **Trigger:** Fades in (200ms, easeOut) when hero image scrolls out of viewport. Fades out when scrolling back up.
- **Position:** Sticky at top of screen, below safe area inset
- **Height:** 44px
- **Background:** `colors.background` (white), 1px bottom border `colors.border`
- **Labels:** "Overview" · "Places" · "Stay" · "Events" — using `typeStyles.caption` style (11px, medium, uppercase, letter-spacing 1.5)
- **Active indicator:** 2px bottom line in `colors.orange`, smooth slide animation
- **Scroll spy:** Active label updates based on scroll position (detect which section ref is currently in viewport)
- **Tap behavior:** Smooth scroll to section with `scrollTo()` + offset for sticky bar height

**Section anchors mapped to labels:**
- Overview → Women's Insights section
- Places → "Your day in [city]" header
- Stay → "Where to Stay" section
- Events → "What's Happening" section

### 2. Unified Place Filters

A filter bar within the "Your day in [city]" section that lets users filter all places by category and price.

**Specs:**
- **Position:** Below "Your day in [city]" header and subtitle, above the area pills
- **Layout:** Horizontal scroll of pill chips, two groups separated by a thin vertical divider (1px, `colors.border`, 16px height)

**Category chips:**
- `All` (default active) · `Cafes` · `Restaurants` · `Activities` · `Bars` · `Wellness` · `Coworking`
- Derived from `placeType` mapping:
  - Cafes → ['cafe', 'bakery']
  - Restaurants → ['restaurant']
  - Activities → ['activity', 'tour', 'landmark']
  - Bars → ['bar', 'club', 'rooftop']
  - Wellness → ['wellness', 'spa', 'salon', 'gym']
  - Coworking → ['coworking']
- Only show chips that have ≥1 matching place in the city

**Price chips:**
- `$` · `$$` · `$$$` · `$$$$`
- Map to `priceLevel` 1-4
- Only show price levels that exist in the city's data

**Chip styling:**
- Inactive: 1px border `colors.border`, white fill, `colors.textSecondary` text
- Active: `colors.orangeSoft` fill, `colors.orange` border, `colors.orange` text
- Size: paddingH 12, paddingV 6, radius.pill, caption typography
- Gap: `spacing.sm` (8px) between chips

**Filtering behavior:**
- **Default (All, no price):** Time-of-day sections render normally (Morning → Afternoon → Evening → Full Day)
- **Filter active:** Time-of-day sections collapse. Single flat list replaces them, sorted by `curationScore` desc. Header becomes "Showing X [category] places" in muted text
- **Category + Price:** Both filters combine (AND logic)
- **Area + Category/Price:** All three combine — area filter (existing) narrows the pool, then category/price filter within
- **Clear:** Tap active chip to deselect, or tap "All" to reset category

**Result count:** Below filter chips, small muted text: "Showing 8 places" or "Showing 3 cafes under $$"

### 3. Accommodation Section Filters

Dedicated filters within the "Where to Stay" section for type, price, and features.

**Specs:**
- **Position:** Below "Where to Stay 🏨" section title and subtitle
- **Layout:** Horizontal scroll of pill chips in up to 3 rows

**Row 1 — Type chips:**
- `All` (default) · `Hostel` · `Hotel` · `Homestay`
- Direct 1:1 map to `placeType`
- Only show types that exist in city data

**Row 2 — Price chips:**
- `$` · `$$` · `$$$` · `$$$$`
- Map to `priceLevel` 1-4
- Only show existing levels

**Row 3 — Feature chips** (dynamic):
- Derived from `highlights[]` across all accommodations in the city
- Count keyword frequency, surface top 5 most common
- Common examples: "Female Dorm", "Pool", "Coworking", "Kitchen", "Central", "Rooftop", "WiFi"
- Normalize casing (title case display)

**Chip styling (color-coded by group):**
- Type chips active: `colors.orangeSoft` fill, `colors.orange` text
- Price chips active: `colors.greenSoft` fill, `colors.greenFill` text
- Feature chips active: `colors.blueSoft` fill, `colors.blueFill` text
- Inactive: same as place filter chips

**Multi-select:** All three groups support multi-select. Filters combine with AND logic.
- Example: "Hostel" + "$" + "Female Dorm" = show hostels at $ price with "Female Dorm" in highlights

**Empty state:** "No exact matches — try fewer filters" with a "Clear all" text button

**Result count:** "3 hostels found" or "Showing all 7 stays"

## Data Requirements

No new database fields needed. Everything uses existing data:
- `placeType` → category and accommodation type filters
- `priceLevel` → price filters
- `highlights[]` → accommodation feature chips
- `curationScore` → sort order when filtering
- `bestTimeOfDay` → time-of-day grouping (existing)

## Implementation Notes

- Use `useRef` for section scroll anchors
- `Animated.Value` for sticky bar opacity
- `onScroll` event with `scrollEventThrottle={16}` for scroll spy
- Filter state is local component state (not persisted)
- Accommodation feature extraction happens client-side from the already-fetched places data
- All filter chips use the same base `FilterChip` component with color variants
- Existing `PlaceCard` and `FullDayCard` components remain unchanged
- Area filter (existing neighborhood pills) remains and works alongside new filters

## What Stays the Same

- Hero image, breadcrumb, all editorial content
- Women's Insights, Signal Pills, At a Glance, Good to Know
- Community thread previews
- Time-of-day section structure (when no filter is active)
- Place card design and interactions (save, navigate)
- Events section with month picker
- All typography, spacing, color tokens
