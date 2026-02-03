# Explore Experience Redesign

> **Goal:** Transform Explore from a functional directory into a delightful trip planning experience that feels like zooming into your destination.

**Core insight:** Travelers have a natural mental model of nested exploration:
- Country → "Which cities should I visit?"
- City → "Which areas should I explore?"
- Area → "What's here for me?"

The app should feel like zooming in on a map, with each level answering one clear question.

---

## Design Principles

1. **One question per screen** - Don't overwhelm. Each page has a single job.
2. **Cities are the hero** - That's where decisions happen.
3. **Show the vibe, not just the facts** - One-liners > descriptions.
4. **Zooming, not jumping** - Transitions should feel like traveling deeper.
5. **Delight in the details** - Haptics, animations, personality.

---

## Level 1: Explore Landing Page

**Question answered:** "Where should I go?"

### Layout

```
┌─────────────────────────────────────┐
│  Where are you dreaming of?         │
│  [____Search countries or cities____]│
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ ░░░░ FEATURED COUNTRY ░░░░ │    │  ← Big, inviting hero
│  │  Philippines                │    │
│  │  Island hop through paradise│    │
│  └─────────────────────────────┘    │
│                                     │
│  Popular cities ──────────────────  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  ← Horizontal scroll
│  │Ubud│ │BKK │ │Lis-│ │Siar│ →     │    Tap = go straight to city
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  Browse by country ───────────────  │
│  ┌──────────┐ ┌──────────┐         │  ← Grid of countries
│  │ Thailand │ │ Vietnam  │         │
│  └──────────┘ └──────────┘         │
└─────────────────────────────────────┘
```

### Key Elements

- **Featured country:** Editorial pick, big and inviting
- **Popular cities:** Fast lane for people who know where they want to go
- **Browse by country:** For dreamers exploring regions

---

## Level 2: Country Page

**Question answered:** "Which cities should I visit?"

### Layout

```
┌─────────────────────────────────────┐
│ ← Explore                           │
├─────────────────────────────────────┤
│ ░░░░░░░░░░░ HERO IMAGE ░░░░░░░░░░░ │
│  Philippines                        │
│  Island-hop through paradise        │
├─────────────────────────────────────┤
│  Quick context          [Safe ✓]   │
│  "English spoken, budget-friendly"  │
├─────────────────────────────────────┤
│                                     │
│  Where do you want to go?           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ░░░░ EL NIDO ░░░░░░░░░░░░░ │   │  ← City cards are BIG
│  │  Dramatic cliffs & lagoons  │   │
│  │  Best for: Beach & nature   │   │
│  │                         →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ░░░░ SIARGAO ░░░░░░░░░░░░░ │   │
│  │  Surf, chill, repeat        │   │
│  │  Best for: Slow travel      │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  ▼ Practical info                   │  ← Collapsed by default
├─────────────────────────────────────┤
│  Emergency: 911                     │
└─────────────────────────────────────┘
```

### Key Elements

- **Cities take 70% of screen** - They're the main event
- **Each city has a vibe line** - "Surf, chill, repeat" not "City in Philippines"
- **"Best for" tag** - Quick persona matching
- **Practical info collapsed** - Available but not blocking
- **Arrow on cards** - Clear invitation to tap

---

## Level 3: City Page (Trip Planner)

**Question answered:** "How should I spend my time here?"

### Layout

```
┌─────────────────────────────────────┐
│ ← Philippines                       │
├─────────────────────────────────────┤
│ ░░░░░░░░░░░ HERO IMAGE ░░░░░░░░░░░ │
│  Manila                             │
│  Gateway to the islands             │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 📍 Explore by area          │   │  ← Tap to expand & filter
│  │ Poblacion · Intramuros · ... │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│                                     │
│  Plan your days                     │
│                                     │
│  ☕ MORNING                         │
│  Start your day right               │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Cafe 1│ │Cafe 2│ │Cafe 3│  →    │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  🍜 AFTERNOON                       │
│  Explore & refuel                   │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Place │ │Place │ │Place │  →    │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  🌙 EVENING                         │
│  Wind down or go out                │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Bar   │ │Dinner│ │Club  │  →    │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  🗺️ IF YOU HAVE A FULL DAY         │
│  Worth the trip                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ░░░ TAGAYTAY DAY TRIP ░░░░ │   │
│  │ Volcano views + bulalo      │   │
│  │ 🕐 4-6 hours · 🚗 2hr south │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  🏨 WHERE TO STAY                   │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Hostel│ │Hotel │ │B&B   │  →    │
│  └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────┘
```

### Key Elements

- **"Plan your days" framing** - Not browsing, planning
- **Time-based sections with taglines** - "Start your day right"
- **Area shown on each place** - Mental mapping
- **Full day section** - Bigger cards, shows duration + transport
- **Where to stay last** - After you know what you'll do

### Area Interaction

- Tap area pill → page filters to show only that area's places
- Area stays highlighted
- Tap again to deselect

---

## Level 4: Place Cards

**Question answered:** "Should I save this?"

### Card Design

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░ IMAGE ░░░░░░░░░░░░░░░░░░ │
│                              ♡    │
├───────────────────────────────────┤
│ Yardstick Coffee             $$   │
│ ┌──────┐ ┌────────┐              │
│ │☕ Cafe│ │Laptop ok│              │
│ └──────┘ └────────┘              │
│ "Best flat white in Poblacion"    │
│ 📍 Poblacion                      │
└───────────────────────────────────┘
```

### Card Elements

| Element | Purpose |
|---------|---------|
| Big image (60%) | Vibe check in 0.5 seconds |
| Save heart on image | One-tap save without opening |
| Price dots ($$) | Budget planning at a glance |
| Quick tags (2-3 max) | "Is this for me?" |
| One-liner hook | The "why" - a recommendation, not description |
| Area label | "Oh this is near where I'm staying" |

---

## Delight & Polish

### Page Transitions

| Transition | Animation |
|------------|-----------|
| Explore → Country | Card expands to fill screen |
| Country → City | City card rises up |
| City → Place | Slides up as modal |
| Back | Reverse animation (zoom out feel) |

### Micro-interactions

| Action | Feedback |
|--------|----------|
| Tap any card | Scale to 95% then back |
| Save a place | Heart pops + light haptic |
| Scroll places | Subtle parallax on images |
| Filter by area | Cards shuffle smoothly |

### Loading States

- Skeleton shimmer placeholders (not spinners)
- Content fades in when ready

### Haptic Feedback

| Action | Haptic |
|--------|--------|
| Save place | Light tap |
| Change filter | Soft tick |
| Pull to refresh | Medium thud |

### Empty States

Personality over generic messages:

```
🗺️
We're still exploring here
Check back soon — our team is adding places

[Browse other cities]
```

---

## Implementation Priority

### Phase 1: Structure (High Impact)
1. Restructure Explore landing with cities prominent
2. Redesign country page with cities as hero
3. Add "Full day" section to city page
4. Update place cards with new layout

### Phase 2: Polish (Delight)
1. Add page transitions (shared element animations)
2. Add micro-interactions (tap feedback, save animation)
3. Add skeleton loading states
4. Add haptic feedback

### Phase 3: Refinement
1. Area cards with vibe words (needs content)
2. One-liner hooks for places (needs content)
3. Custom pull-to-refresh animation
4. Empty state illustrations

---

## Technical Notes

### Existing Data Model Supports This

- `countries` → Country pages
- `cities` → City pages
- `city_areas` → Area filtering
- `places` → Place cards
- `places.best_time_of_day` → Time sections (needs migration applied)
- `places.estimated_duration` → Full day section

### Animations

Use `react-native-reanimated` for:
- Shared element transitions
- Layout animations
- Gesture-based interactions

Use `expo-haptics` for:
- Tap feedback
- Save confirmation

### Missing Content Needed

- City vibe one-liners (e.g., "Surf, chill, repeat")
- Area vibe words (e.g., "Nightlife", "History")
- Place one-liner hooks (e.g., "Best flat white in Poblacion")
- "Best for" tags on cities

---

## Success Metrics

- **Engagement:** More taps into cities (not bouncing at country level)
- **Saves:** More places saved per session
- **Session depth:** Users going Explore → Country → City → Place
- **Qualitative:** "This feels nice to use"
