# Home Tab Moodboard Redesign

**Date**: 2026-02-11
**Branch**: `feature/home-moodboard`

## Overview

Transform the Home tab from a personalized dashboard into a Pinterest-style moodboard that inspires travel. Full immersion from the first pixel — no personal layer on top, just pure visual inspiration grouped by emotional vibe.

## Page Structure (top to bottom)

1. **Header** — Sola logo left, hamburger menu right (unchanged)
2. **Search bar** — Subtle, minimal "Where feels right?" pill
3. **Vibe sections** — 5-6 horizontal scroll rows, each with serif one-liner title + hero+supporting cards
4. **Your Shortlist** — "Places you're drawn to" at bottom, only if user has saved places
5. **End** — No end card. Shortlist is the soft close.

No trip status, no alerts, no quick actions, no community zone. Pure inspiration.

## Vibe Sections

Each section is an editorial grouping powered by existing Supabase destination tags.

| Section Title | Tags Queried | Tag Mode | Entity Type |
|---|---|---|---|
| "Lose Yourself in a Big City" | `city` + `lively` | all | city |
| "Wake Up to the Ocean" | `beach`, `island` | any | city |
| "Chase the Altitude" | `mountain` | all | city |
| "Slow Down Somewhere Beautiful" | `relaxed` + `slow_travel` | all | city |
| "Where the Culture Runs Deep" | `city_culture` + `aesthetic` | all | city |
| "Your First Solo Adventure" | `first_solo_trip` | all | country |

Rules:
- Countries and cities never mixed in the same section
- If a section has < 2 results, it's hidden entirely
- Cities may appear in multiple sections — that's fine
- Titles are hardcoded editorial, not generated from tags

## Card Design

### Hero card (first in each row)
- 200px wide × 240px tall
- Full-bleed image with linear gradient (transparent → dark) from bottom
- City/country name at bottom-left, white, semi-bold
- Country name underneath in smaller text (for city cards)
- No type label pill

### Supporting cards (rest of row)
- 130px wide × 170px tall
- Same treatment as hero — image, gradient, name
- Rounded corners (radius.md)

### Section layout
- Title in InstrumentSerif, ~20px, left-aligned with 24px screen padding
- No subtitle, no "See all", no arrows
- Cards start at screen edge with 24px left padding, 12px gap
- Last card has 24px right padding
- 32px vertical spacing between sections

### Interactions
- Horizontal scroll, no snap, no pagination
- Press state: opacity 0.9, scale 0.98
- Tap navigates to city/country detail screen

## Your Shortlist

- Title: "Places you're drawn to" (same serif style)
- Horizontal scroll of saved destinations — all 130×170 cards (no hero)
- Only shown if user has 1+ saved places
- If empty: section absent entirely
- Also accessible from hamburger menu ("Saved Places")

## Empty/Edge States

- First-time visitor: full moodboard, no empty states — page is complete from day one
- Sparse data: sections with < 2 results hidden entirely
- No saves: shortlist section absent

## Technical Approach

### New files
- `components/home/VibeSection.tsx` — horizontal row (title + hero + supporting cards)
- `components/home/MoodboardCard.tsx` — image card (hero/supporting variants via prop)
- `data/home/useHomeMoodboard.ts` — hook fetching all vibe sections in parallel

### Modified files
- `app/(tabs)/home/index.tsx` — gutted and rebuilt as moodboard
- `data/api.ts` — new `getCitiesByTags()` function

### Unchanged
- Header (logo + hamburger)
- SearchBar component (reused)
- City/country detail navigation (existing routes)
- Saved places data layer (existing hooks)
- All other tabs

### Data config
```typescript
const VIBE_SECTIONS = [
  { title: "Lose Yourself in a Big City", tags: ["city", "lively"], tagMode: "all", entityType: "city", minResults: 2 },
  { title: "Wake Up to the Ocean", tags: ["beach", "island"], tagMode: "any", entityType: "city", minResults: 2 },
  { title: "Chase the Altitude", tags: ["mountain"], tagMode: "all", entityType: "city", minResults: 2 },
  { title: "Slow Down Somewhere Beautiful", tags: ["relaxed", "slow_travel"], tagMode: "all", entityType: "city", minResults: 2 },
  { title: "Where the Culture Runs Deep", tags: ["city_culture", "aesthetic"], tagMode: "all", entityType: "city", minResults: 2 },
  { title: "Your First Solo Adventure", tags: ["first_solo_trip"], tagMode: "all", entityType: "country", minResults: 2 },
]
```
