# Premium UX Foundation Design

**Date:** 2026-02-03
**Status:** Approved
**Reference:** Airbnb-style UX - clean cards, smooth transitions, images that pull you in

---

## Overview

Transform the Explore experience from functional to premium/addictive through:
1. **Phase 1 (Foundation):** Card hierarchy, visual polish, information flow
2. **Phase 2 (Later):** Shared element animations, micro-interactions, haptic feedback

---

## 1. Three-Level Card Hierarchy

Visual distinction between levels creates "zooming in" feeling.

### Country Cards (Explore landing)
- **Size:** Large - 280px height, full-width
- **Image:** 80% of card, hero treatment
- **Text:** Country name overlaid with gradient, vibe tagline below
- **Feel:** Destination poster

```
┌─────────────────────────────────────────┐
│                                         │
│            [HERO IMAGE]                 │
│                                         │
│    ┌─────────────────────────────┐      │
│    │  Thailand                   │      │
│    │  Slow pace, stunning beaches│      │
│    └─────────────────────────────┘      │
└─────────────────────────────────────────┘
```

### City Cards (on Country page)
- **Size:** Medium - 160px height, full-width
- **Layout:** Image top 60%, content below
- **Content:** City name (prominent), "Best for" tag, arrow affordance
- **Feel:** Chapter in a book

```
┌─────────────────────────────────────────┐
│            [CITY IMAGE]                 │
├─────────────────────────────────────────┤
│  Bangkok                            →   │
│  Best for: nightlife, food              │
│  Plan your days here →                  │
└─────────────────────────────────────────┘
```

### Place Cards (on City page)
- **Size:** Compact - 88px height, horizontal layout
- **Layout:** Square image left, content right
- **Content:** Name, price dots, tags, save heart
- **Feel:** Items in a curated list

```
┌────────┬────────────────────────────────┐
│        │  Fabrica Coffee         ●●○○   │
│ [IMG]  │  [coworking] [wifi]            │
│        │  Great for remote work   ♡     │
└────────┴────────────────────────────────┘
```

---

## 2. Visual Design Details

### Images
- `contentFit="cover"` with consistent aspect ratios
- 200ms fade-in transition on load
- Shimmer placeholder (not gray box)
- Country/City: 16:9 or 3:2
- Places: 1:1 square

### Typography Hierarchy
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Country name | 28px | semibold | white on image |
| City name | 18px | semibold | textPrimary |
| Place name | 15px | semibold | textPrimary |
| Supporting text | 13-14px | regular | textMuted |
| Tags | 11px | medium | orange on orangeFill |

### Whitespace
- Card padding: 16px
- Card gaps: 12-16px
- Section separation: 32px+
- Never cramped

### Borders & Corners
- Cards: 1px subtle border (#E5E5E5), no shadows
- Card corners: 12px
- Pill corners: 20px

### Touch Feedback
- Scale to 0.98 on press
- Opacity 0.95 on press
- Immediate response

---

## 3. Information Flow

### Explore Landing
- Featured country hero (largest, most inviting)
- "Jump to a city" horizontal scroll
- "Browse by country" grid
- No filters, just destinations calling you

### Country Page (macro orientation)
1. Hero image + country name + vibe tagline
2. **"Where do you want to go?"** - cities as THE main content
3. City cards with purpose ("Best for beach lovers")
4. Supporting info below:
   - "Who this is for" (2-3 personas)
   - Safety context
   - Quick facts (reference)
   - Practical info (collapsed)

### City Page (the actual guide)
1. Hero + city name + tagline
2. Brief intro (2-3 sentences max)
3. Area pills (if neighborhoods exist)
4. **Time-based sections:**
   - ☕ Your Morning (cafes, coworking)
   - 🍜 Your Afternoon (lunch, walks)
   - 🌙 Your Evening (dinner, bars)
   - 🗺️ Full Day (day trips)
   - 🏨 Where to Stay
5. Each section: 4-6 place cards max

---

## 4. Implementation Tasks

### Bug Fix (Immediate)
- [x] Fix city page crash: `Array.isArray(tags)` check

### Phase 1: Foundation

**Task 1: Country Card Redesign**
- Update `CountryCard` in `explore/index.tsx`
- Large format, image hero, overlay text
- Add press feedback animation

**Task 2: City Card Redesign**
- Update `CityCard` in `country/[slug].tsx`
- Medium format, image top, content below
- "Best for" tag, arrow affordance

**Task 3: Place Card Polish**
- Update `PlaceCard` in `city/[slug].tsx`
- Compact horizontal layout
- Clean tag display, save button

**Task 4: Country Page Structure**
- Cities first, prominent
- Supporting info below
- Collapsed practical sections

**Task 5: Visual Polish Pass**
- Consistent spacing
- Typography hierarchy
- Touch feedback on all cards
- Shimmer loading states

### Phase 2: Animations (Future)
- Shared element transitions (card → detail)
- Heart save animation
- Haptic feedback
- Page slide transitions

---

## 5. Success Criteria

- Country page makes you want to tap a city
- City page answers "what do I do tomorrow morning?"
- Navigation feels like zooming in, not jumping
- Premium, polished feel throughout
- No bugs or crashes
