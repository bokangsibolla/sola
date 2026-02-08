# Premium Polish — Tier 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate Sola from "well-designed indie app" to "investor-grade premium product" through micro-consistency, editorial framing, and noise reduction — without changing brand, backend, or content.

**Architecture:** Pure presentation-layer changes. We add design tokens to `constants/design.ts`, then systematically apply them across Explore and Community screens. We also restructure the Explore feed builder and Community feed to introduce visual hierarchy. No new API calls, no new data models.

**Tech Stack:** React Native, Expo Router, existing design system (`constants/design.ts`)

---

## Task 1: Add overlay, press state, and badge tokens to design system

**Files:**
- Modify: `constants/design.ts`

**Step 1: Add new tokens**

Add these new token groups to `constants/design.ts` after the existing `radius` export:

```typescript
// In colors object, add:
  // Overlay gradients (standardized from 6 inconsistent values)
  overlaySoft: 'rgba(0,0,0,0.35)',
  overlayMedium: 'rgba(0,0,0,0.55)',
  overlayStrong: 'rgba(0,0,0,0.7)',

// New export after radius:
export const cardHeight = {
  sm: 160,    // city pairs
  md: 220,    // spotlights, meet-travellers
  lg: 300,    // editorial collections
};

export const pressedState = {
  opacity: 0.9,
  transform: [{ scale: 0.98 }] as const,
};
```

**Step 2: Verify file compiles**

Run: `npx tsc --noEmit constants/design.ts` (or check that the app still loads)

**Step 3: Commit**

```bash
git add constants/design.ts
git commit -m "feat(design): add overlay, cardHeight, and pressedState tokens"
```

---

## Task 2: Standardize gradient overlays across Explore

Replace all inconsistent `rgba(0,0,0,0.XX)` gradient values with the new overlay tokens.

**Files:**
- Modify: `components/explore/HeroGrid.tsx`
- Modify: `components/explore/cards/EditorialCollectionCard.tsx`
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: HeroGrid.tsx — standardize gradients**

In `components/explore/HeroGrid.tsx`:
- Import `colors` already imported — use `colors.overlayStrong` and `colors.overlaySoft`
- Top card gradient: `['transparent', 'rgba(0,0,0,0.65)']` → `['transparent', colors.overlayStrong]`
- Bottom card gradient: `['transparent', 'rgba(0,0,0,0.7)']` → `['transparent', colors.overlayStrong]`
- TypeLabel background: `'rgba(0,0,0,0.35)'` → `colors.overlaySoft`

**Step 2: EditorialCollectionCard.tsx — standardize gradients**

In `components/explore/cards/EditorialCollectionCard.tsx`:
- Gradient: `['transparent', 'rgba(0,0,0,0.7)']` → `['transparent', colors.overlayStrong]`
- TypeLabel background: `'rgba(0,0,0,0.35)'` → `colors.overlaySoft`

**Step 3: index.tsx (Explore) — standardize gradients + add missing gradient to spotlights**

In `app/(tabs)/explore/index.tsx`:
- TypeLabel background: `'rgba(0,0,0,0.35)'` → `colors.overlaySoft`
- Small card overlay: `'rgba(0,0,0,0.35)'` → `colors.overlaySoft`
- Spotlight overlay: `'rgba(0,0,0,0.4)'` → `colors.overlayMedium`
- Meet travellers gradient: `['transparent', 'rgba(0,0,0,0.6)']` → `['transparent', colors.overlayMedium]`
- **CRITICAL:** Add `LinearGradient` to `CitySpotlightCard` — currently it only uses a flat background overlay with no gradient, making text hard to read on light images. Add:
  ```tsx
  <LinearGradient
    colors={['transparent', colors.overlayMedium]}
    style={StyleSheet.absoluteFill}
    pointerEvents="none"
  />
  ```
  ...after the Image and before the TypeLabel in the CitySpotlightCard component. Then remove `backgroundColor` from `spotlightOverlay` style (it becomes redundant with the gradient).

**Step 4: Commit**

```bash
git add components/explore/HeroGrid.tsx components/explore/cards/EditorialCollectionCard.tsx app/\(tabs\)/explore/index.tsx
git commit -m "fix(explore): standardize gradient overlays to 3 tokens, add missing spotlight gradient"
```

---

## Task 3: Standardize press states across Explore

Replace inconsistent press state values (0.7, 0.8, 0.9 opacity) with the single `pressedState` token.

**Files:**
- Modify: `components/explore/QuickActionsRow.tsx`
- Modify: `components/explore/DiscoveryLensesSection.tsx`
- Modify: `app/(tabs)/explore/index.tsx` (verify consistency)

**Step 1: QuickActionsRow.tsx**

Import `pressedState` from `@/constants/design`. Replace:
```typescript
pillPressed: {
  opacity: 0.7,
},
```
With:
```typescript
pillPressed: pressedState,
```

Also fix the hardcoded gap and padding:
- `gap: 6` → `gap: spacing.xs + 2` (keep 6px, or just use spacing.xs=4 — prefer `gap: spacing.xs` for simplicity and grid alignment)
- `paddingVertical: spacing.sm + 2` → `paddingVertical: spacing.md` (12px instead of 10px — aligns to spacing grid)

**Step 2: DiscoveryLensesSection.tsx**

Import `pressedState`. Replace any custom pressed opacity (e.g. `opacity: 0.8`) with `pressedState`.

**Step 3: Verify Explore index.tsx**

Confirm `app/(tabs)/explore/index.tsx` already uses `opacity: 0.9, transform: [{ scale: 0.98 }]` — it does (line 366-369). No change needed.

**Step 4: Commit**

```bash
git add components/explore/QuickActionsRow.tsx components/explore/DiscoveryLensesSection.tsx
git commit -m "fix(explore): standardize press states to single pressedState token"
```

---

## Task 4: Standardize badge and pill padding

Fix the inconsistent 3px/4px vertical padding on badges and type labels.

**Files:**
- Modify: `components/explore/HeroGrid.tsx`
- Modify: `components/explore/cards/EditorialCollectionCard.tsx`
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Standardize type label padding to 4px**

In all three files, find `paddingVertical: 3` on type labels and change to `paddingVertical: spacing.xs` (4px).

Locations:
- `HeroGrid.tsx` line ~192: `paddingVertical: 3` → `paddingVertical: spacing.xs`
- `HeroGrid.tsx` line ~229: badge `paddingVertical: 3` → `paddingVertical: spacing.xs`
- `EditorialCollectionCard.tsx` line ~84: `paddingVertical: 3` → `paddingVertical: spacing.xs`
- `EditorialCollectionCard.tsx` line ~114: badge `paddingVertical: 4` → `paddingVertical: spacing.xs` (already 4 but use token)
- `app/(tabs)/explore/index.tsx` line ~379: `paddingVertical: 3` → `paddingVertical: spacing.xs`

**Step 2: Commit**

```bash
git add components/explore/HeroGrid.tsx components/explore/cards/EditorialCollectionCard.tsx app/\(tabs\)/explore/index.tsx
git commit -m "fix(explore): standardize badge/pill padding to spacing.xs token"
```

---

## Task 5: Activate SectionHeader on Explore feed with editorial variant

This is the highest-impact visual change. The Explore feed currently uses inline 12px uppercase labels (or nothing) between sections. We'll replace these with the existing `SectionHeader` component using its editorial (serif) variant.

**Files:**
- Modify: `app/(tabs)/explore/index.tsx` — import and use SectionHeader
- Modify: `data/explore/feedBuilder.ts` — adjust feed structure to emit section headers
- Modify: `data/explore/types.ts` — add section-header feed item type

**Step 1: Add section-header type to FeedItem union**

In `data/explore/types.ts`, add a new variant to the `FeedItem` union:

```typescript
| { type: 'section-header'; title: string; subtitle?: string; variant: 'default' | 'editorial' }
```

**Step 2: Emit section headers from feedBuilder**

In `data/explore/feedBuilder.ts`, insert section-header items before key sections:

Before the first city pair (currently has inline `sectionLabel`):
```typescript
feed.push({
  type: 'section-header',
  title: 'Popular with solo women',
  variant: 'editorial',
});
```

Remove `sectionLabel` from the first city pair push (since SectionHeader replaces it).

Before the interleave loop, after the first city pair, do NOT add more section headers — let the interleaved content flow naturally. The editorial header on the first city pair section is the key signature moment.

**Step 3: Render SectionHeader in Explore index.tsx**

In `app/(tabs)/explore/index.tsx`:
- Import `SectionHeader` from `@/components/explore/SectionHeader`
- Add a case to `renderItem`:

```tsx
case 'section-header':
  return (
    <SectionHeader
      title={item.title}
      subtitle={item.subtitle}
      variant={item.variant}
    />
  );
```

- Add key extractor case:
```tsx
case 'section-header':
  return `section-${item.title}`;
```

- Remove the inline `sectionHeader` and `sectionLabel` styles (they're now replaced by the component)
- Remove the inline section header rendering from `CityPairCard` — it should only render the pair row, no header

**Step 4: Commit**

```bash
git add data/explore/types.ts data/explore/feedBuilder.ts app/\(tabs\)/explore/index.tsx
git commit -m "feat(explore): activate SectionHeader component with editorial serif variant"
```

---

## Task 6: Add topic chips row to Community feed

Transform Community from a flat forum into a navigable knowledge base by surfacing the existing topic taxonomy as horizontal filter chips.

**Files:**
- Modify: `app/(tabs)/community/index.tsx`

**Step 1: Add topic chips row to ListHeader**

In the `ListHeader` JSX, between the search bar and the filter row, add a horizontal ScrollView of topic pills. Topics are already loaded in state (`topics`).

```tsx
{/* Topic chips — quick filter by category */}
{topics.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.topicChipsRow}
  >
    <Pressable
      onPress={() => setFilters({ topicId: undefined })}
      style={[
        styles.topicChip,
        !filters.topicId && styles.topicChipActive,
      ]}
    >
      <Text style={[
        styles.topicChipText,
        !filters.topicId && styles.topicChipTextActive,
      ]}>All</Text>
    </Pressable>
    {topics.map((topic) => (
      <Pressable
        key={topic.id}
        onPress={() => setFilters({ topicId: filters.topicId === topic.id ? undefined : topic.id })}
        style={[
          styles.topicChip,
          filters.topicId === topic.id && styles.topicChipActive,
        ]}
      >
        <Text style={[
          styles.topicChipText,
          filters.topicId === topic.id && styles.topicChipTextActive,
        ]}>{topic.label}</Text>
      </Pressable>
    ))}
  </ScrollView>
)}
```

**Step 2: Add `topicId` to the useCommunityFeed filter interface**

Check that `useCommunityFeed` already supports `topicId` in its filter params — it does (`ThreadFeedParams` has `topicId?: string`), and `setFilters` already merges partial params. No hook change needed.

Check that `getThreadFeed` in `communityApi.ts` filters by `topicId` — verify and add if needed.

**Step 3: Add styles for topic chips**

```typescript
topicChipsRow: {
  paddingVertical: spacing.sm,
  gap: spacing.sm,
  marginBottom: spacing.sm,
},
topicChip: {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: radius.full,
  backgroundColor: colors.neutralFill,
},
topicChipActive: {
  backgroundColor: colors.orangeFill,
},
topicChipText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: colors.textSecondary,
},
topicChipTextActive: {
  color: colors.orange,
},
```

**Step 4: Commit**

```bash
git add app/\(tabs\)/community/index.tsx
git commit -m "feat(community): add topic chips row for category-based filtering"
```

---

## Task 7: Split Community feed into Sola Team / Community zones

Visually separate Sola Team (curated) threads from user threads to build trust and surface authoritative content.

**Files:**
- Modify: `app/(tabs)/community/index.tsx`

**Step 1: Separate Sola Team threads in the feed**

Instead of rendering all threads in a single FlatList, split the data:

In `CommunityHome`, derive two lists from `threads`:

```typescript
const solaTeamThreads = threads.filter((t) => t.authorType === 'system');
const communityThreads = threads.filter((t) => t.authorType !== 'system');
```

**Step 2: Render Sola Team section in ListHeader**

After the filter row in `ListHeader`, add a "From Sola" section if there are system threads:

```tsx
{/* Sola Team threads — curated content */}
{solaTeamThreads.length > 0 && (
  <View style={styles.solaSection}>
    <Text style={styles.solaSectionTitle}>From Sola</Text>
    {solaTeamThreads.slice(0, 3).map((thread) => (
      <ThreadCard
        key={thread.id}
        thread={thread}
        onPress={() => router.push(`/(tabs)/community/thread/${thread.id}`)}
        onVote={handleVote}
        router={router}
      />
    ))}
    <View style={styles.solaSectionDivider} />
  </View>
)}
```

**Step 3: Use only community threads in FlatList data**

Change the FlatList `data` prop from `threads` to `communityThreads`.

**Step 4: Style the Sola section**

```typescript
solaSection: {
  marginBottom: spacing.lg,
},
solaSectionTitle: {
  fontFamily: fonts.semiBold,
  fontSize: 15,
  color: colors.textPrimary,
  letterSpacing: -0.2,
  marginBottom: spacing.sm,
},
solaSectionDivider: {
  height: 1,
  backgroundColor: colors.borderDefault,
  marginTop: spacing.md,
},
```

**Step 5: Commit**

```bash
git add app/\(tabs\)/community/index.tsx
git commit -m "feat(community): split feed into Sola Team and community zones"
```

---

## Task 8: Remove Quick Actions row and End Card from Explore

Reduce visual noise. These items break the editorial flow and are redundant (search screen already has "Browse By" with identical routes).

**Files:**
- Modify: `data/explore/feedBuilder.ts`
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Remove from feed builder**

In `data/explore/feedBuilder.ts`, remove:
```typescript
// --- Quick actions (bottom) ---
feed.push({ type: 'quick-actions' });
```

And remove:
```typescript
// --- End card ---
feed.push({ type: 'end-card' });
```

Keep the `meet-travellers` item for now (it will be reworked in Tier 2).

**Step 2: Clean up Explore index.tsx**

In `app/(tabs)/explore/index.tsx`:
- Remove the `QuickActionsRow` import
- Remove the `case 'quick-actions'` from renderItem
- Remove the `EndCard` component definition
- Remove the `case 'end-card'` from renderItem
- Remove `'quick-actions'` and `'end-card'` from keyExtractor
- Remove unused styles: `endCard`, `endCardText`, `endCardButton`, `endCardLink`

**Step 3: Clean up types.ts**

In `data/explore/types.ts`, remove `| { type: 'quick-actions' }` and `| { type: 'end-card' }` from the FeedItem union.

**Step 4: Commit**

```bash
git add data/explore/feedBuilder.ts app/\(tabs\)/explore/index.tsx data/explore/types.ts
git commit -m "refactor(explore): remove Quick Actions row and End Card for cleaner editorial flow"
```

---

## Summary of changes

| Task | What | Files touched | Impact |
|------|------|--------------|--------|
| 1 | Design tokens | `constants/design.ts` | Foundation for all other tasks |
| 2 | Gradient overlays | 3 Explore files | Visual cohesion on every card |
| 3 | Press states | 2 components | Consistent tactile feedback |
| 4 | Badge padding | 3 files | Micro-detail consistency |
| 5 | SectionHeader activation | 3 files | **Highest impact** — editorial feel |
| 6 | Topic chips in Community | 1 file | Knowledge-base navigation |
| 7 | Community zone split | 1 file | Trust + content hierarchy |
| 8 | Remove noise from Explore | 3 files | Premium restraint |

**Total files modified:** ~8 unique files
**Risk level:** Low — all changes are presentation-only, no data model or API changes
**Estimated time:** Each task is 15-30 minutes. Full tier: ~3-4 hours.
