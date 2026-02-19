# Universal Navigation System — Design Document

**Date**: 2026-02-16
**Status**: Draft — pending approval
**Scope**: All screens across all tabs

---

## The Problem

Sola currently has **6 different navigation patterns** across 47+ screens:

| Pattern | Where Used | What User Sees |
|---------|-----------|----------------|
| AppHeader + bare arrow icon | All Destinations, Continent | Naked `←` with no label |
| UniversalHeader breadcrumbs | Country, Activity | Logo row + breadcrumb trail |
| ScreenHeader w/ back chevron | Thread detail, Settings | `‹` chevron + centered title |
| CityHero frosted circle | City, Area | White arrow on transparent circle |
| Custom "Back to X" label | Place detail only | `‹ Back to Lisbon` |
| Inline mini-breadcrumb | Collection only | `Discover / Collection Name` |

Users encounter a different visual language at every depth. There's no consistent mental model. The app feels stitched together.

---

## Design Principles

Grounded in [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/navigation-and-search), [Nielsen Norman Group](https://www.nngroup.com/topic/mobile-navigation/) mobile navigation research, and [cognitive load research](https://thisisglance.com/learning-centre/how-does-memory-science-influence-mobile-navigation-design):

### 1. Don't invent — inherit

> "The fastest way to create friction is by inventing your own navigation rules." — Apple HIG

iOS users have deeply learned behavior: left = back, right = deeper. The back button shows the parent name. Swiping from the left edge goes back. Tab bar is always there. **Use what 2 billion people already know.**

### 2. Recognition over recall

Users shouldn't have to remember where they came from. The interface shows them. The back button label says where "back" leads. The screen title says where they are. That's the entire cognitive model.

### 3. One pattern, zero exceptions

Every non-root screen uses the same header component. It adapts its *content* based on depth, but the *structure* never changes. Users learn the system once.

### 4. Escape hatches at every level

- **Swipe from left edge** → go back one level (iOS native)
- **Back button** → go to named parent (visible, tappable)
- **Context subtitle** → jump to any ancestor (depth 3+)
- **Tab bar** → reset to root (always visible, one tap)

No user is ever trapped.

---

## The System: `NavigationHeader`

One component. Every screen. Replaces `AppHeader`, `UniversalHeader`, `ScreenHeader`, `BackButton`, all custom back buttons, and the collection inline breadcrumb.

### Anatomy

```
┌──────────────────────────────────────────────────┐
│  ← Parent Name                        [actions]  │  ← nav row (44pt)
│                                                   │
│  Page Title                                       │  ← title (large)
│  Ancestor · … · Grandparent                      │  ← context (depth 3+ only)
└──────────────────────────────────────────────────┘
```

Three elements:
1. **Nav row**: Back button with parent name (left), action icons (right)
2. **Title**: Large, prominent current page name
3. **Context subtitle**: Small, muted ancestor trail — only appears at depth 3+

### Behavior by Depth

**Depth 0 — Tab roots** (Discover, Home, Connect, Trips)
```
┌──────────────────────────────────────────────────┐
│  [sola logo]                              🔔     │
│                                                   │
│  Discover                                         │
└──────────────────────────────────────────────────┘
```
- Logo replaces back button
- Large title = tab name
- No context subtitle
- Actions: notification bell

**Depth 1** (All Destinations, See All, Search results)
```
┌──────────────────────────────────────────────────┐
│  ← Discover                               🔔     │
│                                                   │
│  All Destinations                                 │
└──────────────────────────────────────────────────┘
```
- Back button shows parent tab name
- Large title = screen name
- No context subtitle (unnecessary at this depth)

**Depth 2** (Europe, Portugal from direct access)
```
┌──────────────────────────────────────────────────┐
│  ← All Destinations                        🔔     │
│                                                   │
│  Europe                                           │
└──────────────────────────────────────────────────┘
```
- Back button shows the page that pushed this one
- Still no context — two levels is easy to track mentally

**Depth 3+** (Context subtitle activates)
```
┌──────────────────────────────────────────────────┐
│  ← Europe                                  🔔     │
│                                                   │
│  Portugal                                         │
│  Discover · All Destinations                      │
└──────────────────────────────────────────────────┘
```
- Context subtitle appears: shows ancestors above the parent
- Each segment is tappable — navigates to that screen
- Uses `·` separator (not `/` — softer, more premium)

**Depth 4+** (Context collapses)
```
┌──────────────────────────────────────────────────┐
│  ← Portugal                                🔔     │
│                                                   │
│  Lisbon                                           │
│  Discover · … · Europe                            │
└──────────────────────────────────────────────────┘
```
- Middle ancestors collapse to `…`
- Always shows: root + `…` + immediate grandparent
- Tapping `…` opens a bottom sheet with the full path (reuse existing modal pattern)

**Depth 5–7** (Same pattern scales)
```
┌──────────────────────────────────────────────────┐
│  ← Lisbon                                  🔔     │
│                                                   │
│  Bairro Alto                                      │
│  Discover · … · Portugal                          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  ← Bairro Alto                             🔔     │
│                                                   │
│  Fado Night at Tasca do Chico                     │
│  Discover · … · Lisbon                            │
└──────────────────────────────────────────────────┘
```

### Hero Variant

For screens with full-bleed hero images (cities, areas, activities):

```
┌──────────────────────────────────────────────────┐
│  (●)←                               🔔    ↗      │  ← frosted buttons on image
│                                                   │
│              [FULL BLEED HERO IMAGE]              │
│                                                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  ← gradient
│  PORTUGAL                                         │  ← context label
│  Lisbon                                           │  ← title on image
│  A city of light, tiles, and fado                 │  ← subtitle
└──────────────────────────────────────────────────┘
│  Discover · … · Europe                            │  ← context below image
│                                                   │
│  [Page content...]                                │
```

Rules for hero variant:
- Back button uses frosted circle (same 36x36 size, `rgba(0,0,0,0.35)` background)
- Actions also get frosted circles
- Title renders on the image (white text, gradient behind)
- Context subtitle renders BELOW the hero, in the content area (not on the image)
- Same navigation logic — only the visual presentation differs

### Modal Variant

For screens presented modally (search, new post, new trip):

```
┌──────────────────────────────────────────────────┐
│                                            ✕      │
│                                                   │
│  New Post                                         │
└──────────────────────────────────────────────────┘
```

- Close button (✕) instead of back arrow
- No context subtitle (modals are not part of the hierarchy)
- No back label (modals are self-contained)

---

## Navigation Context System

### How screens know their parent's name

Two mechanisms, in priority order:

#### 1. Navigation params (primary)

When navigating, the caller passes context:

```tsx
// From continent/[key].tsx navigating to country
router.push({
  pathname: '/(tabs)/discover/country/[slug]',
  params: {
    slug: 'portugal',
    _navParentTitle: 'Europe',
    _navAncestors: JSON.stringify([
      { label: 'Discover', path: '/(tabs)/discover' },
      { label: 'All Destinations', path: '/(tabs)/discover/all-destinations' },
    ]),
  },
});
```

Hidden params prefixed with `_nav` carry navigation context forward. Each screen:
1. Reads its own `_navParentTitle` for the back button label
2. Reads `_navAncestors` for the context subtitle
3. Appends itself to the ancestors array when pushing the next screen

#### 2. Data-driven fallback (for deep links)

When a user arrives via deep link, shared URL, or app restart — no navigation params exist. Each screen resolves its own context from data:

```tsx
// In country/[slug].tsx
const country = useCountry(slug);

// No nav params? Build from data.
const parentTitle = params._navParentTitle
  ?? country?.continent_name   // "Europe" from DB
  ?? 'Discover';               // ultimate fallback

const ancestors = params._navAncestors
  ? JSON.parse(params._navAncestors)
  : [{ label: 'Discover', path: '/(tabs)/discover' }];
```

The hierarchy is encoded in the data itself (city → country → continent → root), so we can always reconstruct the path.

#### Fallback chain per entity type

| Entity | Parent title fallback | Ancestor fallback |
|--------|----------------------|-------------------|
| Country | `continent_name` | `[Discover]` |
| City | `country_name` | `[Discover, continent]` |
| Area | `city_name` | `[Discover, …, country]` |
| Activity | `city_name` | `[Discover, …, country]` |
| Place | `city_name` | `[Discover, …, country]` |
| Collection | `'Discover'` | `[Discover]` |
| Continent | `'All Destinations'` | `[Discover]` |
| Thread | `'Community'` | `[Connect]` |
| User profile | `'Travelers'` | `[Connect]` |

---

## Smart Back Logic

The back button doesn't just call `router.back()`. It navigates to the **logical parent**.

### Why

`router.back()` goes to the previous route in the stack — but that might be:
- A search results page that no longer exists
- A different tab entirely
- Nothing (deep link, no history)

Smart back ensures consistent behavior: the back button always goes where it says it will.

### Implementation

```tsx
function handleBack() {
  // If we have navigation state with history, use it
  const canGoBack = router.canGoBack();

  if (canGoBack) {
    router.back();
  } else {
    // Deep link or no history — go to logical parent
    router.replace(logicalParentPath);
  }
}
```

For the typical case (user navigated normally), `router.back()` works perfectly and preserves scroll position + state. The smart fallback only activates when there's no history.

---

## Long Name Handling

### Back button label

- Max width: 50% of screen width
- Truncates with ellipsis: `← Bairro Alto do Lour…`
- If parent name is extremely long (>25 chars), abbreviate: `← Bairro Alto…`

### Context subtitle

- Max width: 100% of content area minus padding
- Middle segments collapse to `…` first
- If still too long, truncate the longest visible segment
- Never wraps to second line — single line, `numberOfLines={1}`

### Page title

- Full width, wraps to max 2 lines
- `numberOfLines={2}` with ellipsis on overflow
- Font size stays constant (never shrinks to fit)

---

## Navigation Hierarchy

### Screen classification

| Type | Examples | Nav behavior |
|------|----------|-------------|
| **Tab root** | Discover index, Home, Connect, Trips | Logo, no back button |
| **List screen** | All Destinations, All Activities, See All | Back to tab root, large title |
| **Browse screen** | Continent detail | Back to list, large title |
| **Guide screen** | Country, City, Collection | Back to parent, context subtitle |
| **Detail screen** | Activity, Place, Area | Back to parent, context subtitle |
| **Modal** | Search, New Post, New Trip | Close button, no hierarchy |
| **Utility screen** | Settings, Edit Profile, Notifications | Back to parent, compact title |

### Tab-specific depth maps

**Discover tab**:
```
discover (0)
├── all-destinations (1)
│   └── continent/[key] (2)
│       └── country/[slug] (3)
│           ├── city/[slug] (4)
│           │   ├── area/[id] (5)
│           │   │   └── activity/[slug] (6)
│           │   └── place-detail/[id] (5)
│           └── activity/[slug] (4)
├── all-activities (1)
│   └── activity/[slug] (2)
├── collection/[slug] (1)
│   └── country/[slug] (2) ... same subtree
├── see-all (1)
└── search (modal — no depth)
```

**Connect tab**:
```
connect (0)
├── thread/[id] (1)
│   └── user/[id] (2)
├── user/[id] (1)
├── connections (1)
├── dm/index (1)
│   └── dm/[id] (2)
└── new (modal — no depth)
```

**Home tab**:
```
home (0)
├── profile (1)
│   └── edit-profile (2)
├── settings (1)
│   └── delete-account (2)
├── notifications (1)
├── saved (1)
│   └── collections/[id] (2)
└── verify (1)
```

**Trips tab**:
```
trips (0)
├── [id] (1)
└── new (modal — no depth)
```

---

## Visual Spec

### NavigationHeader — Standard variant

```
Height breakdown:
  Nav row:      44pt (back button + actions)
  Title:        32pt font, 40pt line height
  Context:      13pt font, 18pt line height (only at depth 3+)
  Bottom space:  16pt

Total at depth 0-2:  ~100pt
Total at depth 3+:   ~118pt
```

### Typography

| Element | Font | Size | Color |
|---------|------|------|-------|
| Back label | PlusJakartaSans-Medium | 16 | `colors.textPrimary` |
| Back chevron | Ionicons `chevron-back` | 20 | `colors.textPrimary` |
| Page title | PlusJakartaSans-SemiBold | 28 | `colors.textPrimary` |
| Context segment (tappable) | PlusJakartaSans-Medium | 13 | `colors.orange` |
| Context segment (current) | PlusJakartaSans-Medium | 13 | `colors.textMuted` |
| Context separator `·` | PlusJakartaSans-Medium | 13 | `colors.textMuted` |
| Context ellipsis `…` | PlusJakartaSans-Medium | 13 | `colors.textMuted` |

### Spacing (uses design tokens)

| Element | Value | Token |
|---------|-------|-------|
| Header horizontal padding | 24 | `spacing.screenX` |
| Back button left offset | -8 (aligns chevron with content edge) | — |
| Back button hit area | 44×44 | — |
| Gap: nav row → title | 4 | `spacing.xs` |
| Gap: title → context | 4 | `spacing.xs` |
| Gap: context → content | 16 | `spacing.lg` |

### Back button spec

```
┌────────────────────┐
│  ‹  Parent Name    │   44pt touch target
└────────────────────┘
     ↑ chevron-back (20px)
        ↑ 4px gap
           ↑ parent name (16px medium)
```

- Chevron: `Ionicons` `chevron-back`, size 20, `textPrimary`
- Label: 16px medium, `textPrimary`
- The chevron + label act as one touch target
- Press state: opacity 0.6 (brief, 100ms)

### Hero variant — back button

```
┌──────┐
│  ←   │   36×36 frosted circle
└──────┘
     ↑ Ionicons arrow-back, size 22, #FFFFFF
     ↑ backgroundColor: rgba(0,0,0,0.35)
     ↑ borderRadius: 18
```

- No text label on the hero (the parent context is implicit from the hero content)
- Parent name appears in context subtitle below the hero instead

### Action buttons

- Notification bell: `Feather` `bell`, size 22
- Share: `Feather` `share`, size 20
- Settings: `Feather` `settings`, size 20
- All icons: `colors.textPrimary` on standard, `#FFFFFF` on hero
- Badge: 8×8 orange dot for unread notifications (same as current)
- Action area right-aligned, gap: `spacing.xs` (4)

---

## Component API

```tsx
interface Ancestor {
  label: string;
  path: string;       // Expo Router path to navigate to
}

interface NavigationHeaderProps {
  /** Current page title */
  title: string;

  /** Back button label — parent page name */
  parentTitle?: string;

  /** Handler for back — defaults to router.back() with smart fallback */
  onBack?: () => void;

  /** Ancestors for context subtitle (auto-shown at depth 3+) */
  ancestors?: Ancestor[];

  /** Visual variant */
  variant?: 'standard' | 'hero' | 'modal';

  /** Right-side action buttons */
  rightActions?: React.ReactNode;

  /** Override: force show/hide context even at wrong depth */
  showContext?: boolean;

  /** For hero variant: subtitle text below title on image */
  heroSubtitle?: string;

  /** For hero variant: small label above title (e.g., country name) */
  heroLabel?: string;

  /** For hero variant: image source */
  heroImage?: string;

  /** For hero variant: hero height (default 260) */
  heroHeight?: number;
}
```

### Usage examples

```tsx
// Tab root
<NavigationHeader title="Discover" rightActions={<NotificationBell />} />

// Depth 1
<NavigationHeader title="All Destinations" parentTitle="Discover" />

// Depth 3 (context auto-shows)
<NavigationHeader
  title="Portugal"
  parentTitle="Europe"
  ancestors={[
    { label: 'Discover', path: '/(tabs)/discover' },
    { label: 'All Destinations', path: '/(tabs)/discover/all-destinations' },
  ]}
/>

// Hero page
<NavigationHeader
  variant="hero"
  title="Lisbon"
  heroLabel="PORTUGAL"
  heroSubtitle="A city of light, tiles, and fado"
  heroImage={city.heroImageUrl}
  parentTitle="Portugal"
  ancestors={[
    { label: 'Discover', path: '/(tabs)/discover' },
    { label: 'Europe', path: '/(tabs)/discover/continent/europe' },
  ]}
  rightActions={<><ShareButton /><SaveButton /></>}
/>

// Modal
<NavigationHeader variant="modal" title="New Post" />
```

---

## Helper: `useNavContext` hook

Encapsulates the logic of reading nav params, falling back to data, and building the ancestors + parent title.

```tsx
function useNavContext(options: {
  /** Current page display name */
  title: string;
  /** Expo Router path for this page (for passing to children) */
  path: string;
  /** Fallback parent title if no nav params (e.g., from entity data) */
  fallbackParentTitle?: string;
  /** Fallback ancestors if no nav params */
  fallbackAncestors?: Ancestor[];
}): {
  parentTitle: string | undefined;
  ancestors: Ancestor[];
  /** Pass this when pushing to a child screen */
  childNavParams: {
    _navParentTitle: string;
    _navAncestors: string; // JSON
  };
}
```

This hook:
1. Reads `_navParentTitle` and `_navAncestors` from route params
2. Falls back to the provided fallbacks if params are missing (deep link case)
3. Returns `childNavParams` — ready to spread into the next `router.push()` call

---

## Refactor Plan

### Phase 1: Build the component (no screen changes)

1. Create `components/NavigationHeader.tsx`
   - Standard variant (nav row + title + context)
   - Modal variant (close button + title)
   - All typography and spacing per spec
2. Create `hooks/useNavContext.ts`
   - Param reading, fallback logic, child param builder
3. Create `components/NavigationHero.tsx`
   - Hero image + gradient + frosted back button + title overlay
   - Accepts `NavigationHeader` context for the content below
4. Unit: Verify component renders correctly at each depth (0–6)

### Phase 2: Migrate Discover tab (highest complexity, most benefit)

5. `discover/index.tsx` — Replace `AppHeader` with `NavigationHeader` (depth 0)
6. `discover/all-destinations.tsx` — Replace `AppHeader` + bare arrow
7. `discover/all-countries.tsx` — Same pattern
8. `discover/all-activities.tsx` — Same pattern
9. `discover/see-all.tsx` — Same pattern
10. `discover/continent/[key].tsx` — Replace `AppHeader` + bare arrow, add `useNavContext`
11. `discover/collection/[slug].tsx` — Replace inline breadcrumb
12. `discover/country/[slug].tsx` — Replace `UniversalHeader`, use `useNavContext`
13. `discover/city/[slug].tsx` — Replace `CityHero` back button, integrate hero variant
14. `discover/area/[id].tsx` — Replace inline back button, integrate hero variant
15. `discover/activity/[slug].tsx` — Replace `UniversalHeader`, use `useNavContext`
16. `discover/place-detail/[id].tsx` — Replace custom "Back to X" label

### Phase 3: Migrate other tabs

17. `connect/index.tsx` — NavigationHeader depth 0
18. `connect/thread/[id].tsx` — Replace ScreenHeader
19. `connect/user/[id].tsx` — Replace whatever exists
20. `connect/connections.tsx` — Replace header
21. `connect/dm/index.tsx` — Replace header
22. `connect/dm/[id].tsx` — Replace header
23. `home/index.tsx` — NavigationHeader depth 0
24. `home/profile.tsx` — Migrate
25. `home/settings.tsx` — Migrate
26. `home/edit-profile.tsx` — Migrate
27. `home/notifications.tsx` — Migrate
28. `home/saved.tsx` — Migrate
29. `trips/index.tsx` — NavigationHeader depth 0
30. `trips/[id].tsx` — Migrate
31. `connect/new.tsx` — Modal variant
32. `trips/new.tsx` — Modal variant

### Phase 4: Cleanup

33. Delete `components/UniversalHeader.tsx`
34. Delete `components/ui/ScreenHeader.tsx`
35. Delete `components/ui/BackButton.tsx`
36. Remove bare back-arrow patterns from all files
37. Verify no remaining imports of deleted components
38. TypeScript check: `npx tsc --noEmit`

---

## Edge Cases

### Deep link (no navigation history)

User opens `sola.app/city/lisbon`. There's no stack.
- `useNavContext` sees no `_navParentTitle` param
- Falls back to data: city's `country_name` = "Portugal"
- Back button reads `← Portugal`
- `onBack` calls `router.replace('/(tabs)/discover/country/portugal')` (logical parent)
- Context subtitle built from data: `Discover · Europe`

### External share link

Same as deep link. The fallback chain always produces a valid parent.

### Page refresh (web / dev)

Same as deep link — no stack, falls back to data.

### Modal overlay

Modals use the `modal` variant: `✕` close button, no hierarchy. The underlying stack is preserved. Dismissing the modal returns to where the user was.

### No history + no data (edge edge case)

If somehow there's no nav params AND the data fetch fails:
- Back button label: `← Back` (generic fallback)
- Context subtitle: hidden
- `onBack` navigates to tab root

### Very long entity names

"Mercado da Ribeira Time Out Market" as a back label:
- Truncated to `← Mercado da Rib…` (max ~20 chars visible)
- Full name accessible via the page title on the previous screen

### Same entity reachable from multiple paths

Portugal can be reached from:
- Discover → All Destinations → Europe → Portugal
- Discover → Collection "Best for Solo" → Portugal
- Direct deep link → Portugal

In each case, the back button shows the actual parent that brought you there (Europe, "Best for Solo", or the data-driven fallback). The system is path-aware, not entity-aware.

---

## What Gets Deleted

| Component | Replacement |
|-----------|------------|
| `UniversalHeader` | `NavigationHeader` |
| `ScreenHeader` | `NavigationHeader` |
| `BackButton` | Built into `NavigationHeader` |
| `CityHero` back button | `NavigationHeader` hero variant |
| All inline `Pressable` back arrows | `NavigationHeader` |
| Collection inline breadcrumb | `NavigationHeader` with context |
| Place detail "Back to X" | `NavigationHeader` with parentTitle |

---

## Performance Considerations

- `NavigationHeader` is a pure component — memoized via `React.memo`
- Context subtitle only renders at depth 3+ (no wasted elements)
- Hero variant uses the same `expo-image` + `expo-linear-gradient` (no new deps)
- `useNavContext` is a thin hook — reads params once, no subscriptions
- No global navigation state store — context flows through params (zero rerenders on other screens)
- The overflow modal (for collapsed `…` segments) is lazy — only mounted on press

---

## What This Achieves

| Before | After |
|--------|-------|
| 6 navigation patterns | 1 component, 3 variants |
| Users learn a new pattern per screen | Users learn one pattern |
| No parent name on back button | Always shows where "back" goes |
| Lost at depth 4+ | Context subtitle + tab bar escape |
| Deep links → broken back button | Data-driven fallback, always works |
| Hardcoded navigation labels | Dynamic from params + entity data |
| Inconsistent header height/spacing | Same measurements everywhere |
| Different back icon styles | One chevron style (standard) or one frosted circle (hero) |
