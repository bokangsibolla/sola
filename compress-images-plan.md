# Image Performance Optimization Plan

## Context

The Sola app is ~70 MB. Bundled images account for ~12 MB, with 5.7 MB being completely unused files. Remote images (city/country heroes, activity photos) are served at full resolution from Supabase — no transforms, no size-appropriate resizing. Every image component uses bare-minimum expo-image props (just `contentFit` and `transition`) with no caching config, no placeholders, no error handling. The main feed screens use ScrollView with `.map()` instead of FlatList, meaning every image stays mounted in memory. React Query has a 30-second staleTime causing frequent refetches.

**Goal**: Reduce bundle size, cut network transfer, improve perceived speed, and reduce memory usage.

---

## Phase 1: Quick Wins (Zero Risk)

### 1.1 Delete unused bundled images

Delete from `assets/images/` (confirmed zero references in app code):
- `solo-canyon-mist.jpg` (3.1 MB)
- `solo-cliff-fjord.jpg` (1.6 MB)
- `pexels-driving.jpg` (160 KB)
- `pexels-hiking.jpg` (208 KB)
- `pexels-mountain-cliff.jpg` (164 KB)
- `pexels-mountain-hiking.jpg` (304 KB)
- `pexels-sailing.jpg` (164 KB)

**Savings**: ~5.7 MB from app bundle

### 1.2 Compress remaining hero images

Use `sharp` (already a devDependency) to compress the 3 large used hero JPGs:
- `solo-bali-palms.jpg` (1.6 MB → ~200 KB at 1200px wide, 80% quality)
- `solo-canyon-relax.jpg` (1.8 MB → ~200 KB)
- `solo-golden-field.jpg` (1.5 MB → ~200 KB)

Write a one-time script: `scripts/compress-bundled-images.ts`

**Savings**: ~4.3 MB additional from bundle

### 1.3 Clean up repo dead weight

- Add `banner-photos/`, root-level marketing PNGs to `.gitignore`
- Delete `banner-photos/` directory (8.5 MB, only used by linkedin-banner.html which is also not part of the app)

### 1.4 Configure React Query defaults

**File**: `app/_layout.tsx` (line 33)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min (was: default 0)
      gcTime: 30 * 60 * 1000,       // 30 min GC
      refetchOnWindowFocus: false,   // Not meaningful in RN
    },
  },
});
```

**File**: `hooks/useData.ts` — remove the `staleTime: 30_000` override (let global default apply; 5 min is better for mostly-static travel content)

---

## Phase 2: Image Component & Supabase Transforms

### 2.1 Add size presets to `lib/image.ts`

Add typed size presets matching actual display sizes (2x for Retina):

```typescript
export const IMAGE_SIZES = {
  avatarSm: { width: 64, height: 64 },
  avatarMd: { width: 112, height: 112 },
  avatarLg: { width: 192, height: 192 },
  heroFull: { width: 800, height: 600 },   // full-width heroes
  cardGrid: { width: 400, height: 500 },   // half-width grid cards
  thumbnail: { width: 200, height: 200 },  // small thumbnails
  spotlightWide: { width: 800, height: 450 },
} as const;

export function getOptimizedUrl(
  url: string | null | undefined,
  preset: keyof typeof IMAGE_SIZES,
): string | null | undefined {
  return getImageUrl(url, IMAGE_SIZES[preset]);
}
```

### 2.2 Create `OptimizedImage` wrapper

**New file**: `components/ui/OptimizedImage.tsx`

A thin wrapper around expo-image that adds:
- `cachePolicy="memory-disk"` (explicit)
- `onError` → falls back to `colors.neutralFill` placeholder or optional fallback image
- `sizePreset` prop → calls `getOptimizedUrl()` automatically
- Same interface as expo-image (passes through all other props)

### 2.3 Migrate high-impact components

Replace bare `<Image>` with `<OptimizedImage>` in these components (priority order):

| Component | File | Preset | Impact |
|-----------|------|--------|--------|
| CountryShowcaseCard | `components/explore/CountryShowcaseCard.tsx` | `cardGrid` | Every country in Discover grid |
| EditorialHero | `components/explore/EditorialHero.tsx` | `heroFull` | Featured hero on Discover |
| CityHero | `components/explore/city/CityHero.tsx` | `heroFull` | City detail page hero |
| ImageCard | `components/ui/ImageCard.tsx` | `heroFull` | Generic image cards |
| ExploreCard | `components/explore/ExploreCard.tsx` | `cardGrid` | Airbnb-style cards |
| GridCard | `components/explore/GridCard.tsx` | `cardGrid` | Grid layout cards |
| FeaturedCard | `components/explore/FeaturedCard.tsx` | `heroFull` | Featured cards |
| ActivityCard | `components/explore/cards/ActivityCard.tsx` | `thumbnail` | Activity thumbnails |
| MoodboardCard | `components/home/MoodboardCard.tsx` | `cardGrid` | Home moodboard |
| HeroModule | `components/home/HeroModule.tsx` | `heroFull` | Home hero |
| ForYouRow | `components/home/ForYouRow.tsx` | `cardGrid` | Personalized row |
| DestinationCard | `components/home/DestinationCard.tsx` | `cardGrid` | Destination carousel |

**Expected network savings**: Each card image goes from ~500 KB–2 MB → ~30–80 KB. With 20+ countries in Discover, this saves **10–40 MB per session**.

---

## Phase 3: Virtualization & Prefetching

### 3.1 Convert Discover feed to FlatList

**File**: `app/(tabs)/discover/index.tsx`

Currently: `ScrollView` → `gridRows.map()` renders all country cards at once.

Convert to `FlatList` with:
- `ListHeaderComponent` = search bar + filter chips + EditorialHero + ContinentFilter
- `data={gridRows}`, each item is a row of 2 country cards
- `initialNumToRender={4}`, `windowSize={5}`

The codebase already uses FlatList in community feed, connections, DM list — so the pattern is established.

### 3.2 Add `recyclingKey` to list images

For every `OptimizedImage` rendered inside a FlatList, add `recyclingKey={item.id}` to prevent image flickering during cell recycling.

### 3.3 Prefetch key images on tab load

Use `Image.prefetch()` from expo-image:
- On Home load: prefetch hero image + first 3 ForYou cards
- On Discover load: prefetch featured country hero + first 4 grid items

```typescript
import { Image } from 'expo-image';
// After data loads:
Image.prefetch(getOptimizedUrl(heroUrl, 'heroFull'));
```

---

## Dependency Chain

```
Phase 1: All steps independent, can be done in parallel
  1.1 Delete unused images
  1.2 Compress used images
  1.3 Clean repo
  1.4 Configure React Query

Phase 2: Sequential
  2.1 Add size presets to lib/image.ts
  2.2 Create OptimizedImage (depends on 2.1)
  2.3 Migrate components (depends on 2.2, can be incremental)

Phase 3: Depends on Phase 2
  3.1 Convert Discover to FlatList (independent of Phase 2 but better after)
  3.2 Add recyclingKey (depends on 3.1)
  3.3 Prefetch images (depends on 2.1)
```

## Key Files

| File | Changes |
|------|---------|
| `assets/images/` | Delete 7 unused files, compress 3 hero JPGs |
| `lib/image.ts` | Add IMAGE_SIZES presets + getOptimizedUrl() |
| `components/ui/OptimizedImage.tsx` | New wrapper component |
| `app/_layout.tsx` (line 33) | QueryClient config |
| `hooks/useData.ts` (line 37) | Remove staleTime override |
| `app/(tabs)/discover/index.tsx` | ScrollView → FlatList |
| 12 image-heavy components | Migrate to OptimizedImage |
| `.gitignore` | Add marketing files |

## Expected Outcomes

| Metric | Before | After All Phases |
|--------|--------|-----------------|
| Bundle size (images) | ~12 MB | ~2 MB |
| Network per Discover load | ~15–30 MB | ~1–2 MB |
| Failed images | Blank card | Neutral placeholder |
| Memory (Discover scroll) | All cards mounted | Virtualized |
| Image load feel | Abrupt pop-in | Smooth 200ms transition with placeholder |
| Data refetch frequency | Every 30s | Every 5 min |

## Verification

1. `npx tsc --noEmit` — no new type errors
2. Run app on device, open Discover tab — images should load noticeably faster
3. Check network tab (React Native Debugger or Flipper) — image requests should use `/render/image/` path with width/height params
4. Scroll through Discover grid — no blank cards, graceful placeholders on error
5. Kill and reopen app — cached images should appear instantly
6. Check bundle size before/after with `npx expo export` or EAS build
