# Country → Activity Flow Fix & Country Detail Polish

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Country → Activity crash and elevate the Country/City detail pages to feel like a premium, researched travel product.

**Architecture:** The flow is Country (`country/[slug]`) → City (`city/[slug]`) → Place Detail (`place-detail/[id]`). Activities are `Place` rows with `placeType IN ('activity', 'tour')`. Two issues: (1) the `place-detail/[id]` screen crashes when data is missing/partial, and (2) the city page needs visual polish — better contextual framing, cleaner cards, and smarter data surfacing.

**Tech Stack:** React Native, Expo Router, Supabase, React Query (via `useData` hook)

---

## PART 1: Fix the Breaking Error

### Root Cause Analysis

The crash occurs in the `place-detail/[id].tsx` screen, which is reached from the city page when tapping any place/activity card (`router.push('/explore/place-detail/${place.id}')`). Multiple crash vectors exist:

1. **Cascading null access on `place` before loading completes.** The screen declares `const { data: category } = useData(() => place?.primaryCategoryId ? getCategory(place.primaryCategoryId) : ...)` where `place` is accessed before it's loaded. While there's a `loading` guard later, the `useData` hooks for `category`, `city`, and `profile` all depend on `place` being loaded — but they all fire on initial render when `place` is still `null`. The `useData` hook builds query keys from deps like `[place?.primaryCategoryId]` which are `undefined` on first render. When the query refires after `place` loads, the old query with the `undefined` key may have already triggered an error or returned stale data.

2. **`highlights` and `considerations` accessed on null `place`.** Lines 219-220: `const highlights = place?.highlights ?? []` and `const considerations = place?.considerations ?? []` are declared BEFORE the `if (!place)` guard at line 225. If `place` is `null`, these default to `[]` correctly via optional chaining — but the `displayType` computation at line 234 does `place.originalType` without optional chaining, which would crash if `place` is somehow falsy after the guard.

3. **Missing `id` param causes empty string query.** `getPlaceById(id ?? '')` will query Supabase with an empty string if `id` is undefined (e.g. malformed navigation), which returns `undefined`, making the screen show "Place not found" rather than crashing — but the other hooks (`getPlaceMedia`, `getPlaceTags`) fire with that empty string simultaneously, potentially causing Supabase errors.

4. **`getPlaceById` returns `undefined` → `useData` converts to `null`.** The hook returns `null`, the screen handles this with `if (!place)` — but the dependent hooks (`getCategory(place.primaryCategoryId)`) still fire one render cycle where `place` is null.

5. **The `city/[slug]` page's `PlaceCard` and `FullDayCard` each fire 3-4 parallel `useData` hooks per card** (`getPlaceFirstImage`, `getPlaceTags`, `isPlaceSaved`) with the place ID. If a place has an invalid/missing `id`, these all fail silently or throw.

### Fix Strategy

Add defensive guards throughout the navigation chain:

- Guard all `useData` calls that depend on prior data with proper `enabled`-style checks (return `Promise.resolve(null/[])` when deps are missing)
- Add null-safe access throughout the `place-detail` screen
- Ensure `id` param is validated before use
- Add try/catch around navigation targets in card press handlers

---

### Task 1: Fix place-detail/[id].tsx crash — defensive data loading

**Files:**
- Modify: `app/(tabs)/explore/place-detail/[id].tsx`

**Step 1: Add null guards to all dependent useData hooks**

In `app/(tabs)/explore/place-detail/[id].tsx`, the dependent hooks fire even when their parent data isn't loaded yet. Fix by guarding each hook:

```typescript
// Current (lines 114-124):
const { data: place, loading, error, refetch } = useData(() => getPlaceById(id ?? ''), [id]);
const { data: media } = useData(() => getPlaceMedia(id ?? ''), [id]);
const { data: tags } = useData(() => getPlaceTags(id ?? ''), [id]);
const { data: category } = useData(
  () => place?.primaryCategoryId ? getCategory(place.primaryCategoryId) : Promise.resolve(null),
  [place?.primaryCategoryId],
);
const { data: city } = useData(
  () => place?.cityId ? getCityById(place.cityId) : Promise.resolve(null),
  [place?.cityId],
);

// Fixed:
const { data: place, loading, error, refetch } = useData(
  () => id ? getPlaceById(id) : Promise.resolve(undefined),
  [id],
);
const { data: media } = useData(
  () => id ? getPlaceMedia(id) : Promise.resolve([]),
  [id],
);
const { data: tags } = useData(
  () => id ? getPlaceTags(id) : Promise.resolve([]),
  [id],
);
const { data: category } = useData(
  () => place?.primaryCategoryId ? getCategory(place.primaryCategoryId) : Promise.resolve(undefined),
  [place?.primaryCategoryId ?? ''],
);
const { data: city } = useData(
  () => place?.cityId ? getCityById(place.cityId) : Promise.resolve(undefined),
  [place?.cityId ?? ''],
);
```

Key changes:
- Guard `id` checks before calling `getPlaceById`, `getPlaceMedia`, `getPlaceTags`
- Use `?? ''` in deps arrays to avoid `undefined` query keys (which can cause React Query issues)

**Step 2: Move variable declarations after the null guard**

Move `highlights`, `considerations`, `images`, and `displayType` after the `if (!place)` return statement:

```typescript
// Lines 216-236 should be reorganized:
// Keep loading/error guards first
if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
if (!place) {
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.notFound}>Place not found</Text>
    </View>
  );
}

// NOW safe to access place properties directly
const images = (media ?? []).filter((m) => m.mediaType === 'image');
const highlights = place.highlights ?? [];
const considerations = place.considerations ?? [];
const displayType = place.originalType
  ? place.originalType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  : category?.name || place.placeType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
```

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors from place-detail/[id].tsx

**Step 4: Commit**

```bash
git add app/\(tabs\)/explore/place-detail/\[id\].tsx
git commit -m "fix: guard against null place data in place-detail screen"
```

---

### Task 2: Fix city/[slug].tsx — defensive card rendering

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add press handler guards in PlaceCard and FullDayCard**

In `PlaceCard`, guard the navigation and data hooks:

```typescript
// In PlaceCard, add null guard to the press handler (line 155-158):
onPress={() => {
  if (!place?.id) return;
  posthog.capture('place_card_tapped', { place_id: place.id, place_name: place.name });
  router.push(`/explore/place-detail/${place.id}`);
}}

// In FullDayCard, same guard (line 257-260):
onPress={() => {
  if (!place?.id) return;
  posthog.capture('fullday_card_tapped', { place_id: place.id, place_name: place.name });
  router.push(`/explore/place-detail/${place.id}`);
}}
```

**Step 2: Guard useData hooks in PlaceCard**

```typescript
// Current:
const { data: imageUrl } = useData(() => getPlaceFirstImage(place.id), [place.id]);
const { data: tags } = useData(() => getPlaceTags(place.id), [place.id]);
const { data: isSaved } = useData(
  () => userId ? isPlaceSaved(userId, place.id) : Promise.resolve(false),
  [userId, place.id],
);

// Fixed:
const { data: imageUrl } = useData(
  () => place?.id ? getPlaceFirstImage(place.id) : Promise.resolve(null),
  [place?.id ?? ''],
);
const { data: tags } = useData(
  () => place?.id ? getPlaceTags(place.id) : Promise.resolve([]),
  [place?.id ?? ''],
);
const { data: isSaved } = useData(
  () => (userId && place?.id) ? isPlaceSaved(userId, place.id) : Promise.resolve(false),
  [userId, place?.id ?? ''],
);
```

Same pattern for FullDayCard.

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 4: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "fix: add defensive guards to city page place cards"
```

---

### Task 3: Fix activity/[slug].tsx — defensive rendering

**Files:**
- Modify: `app/(tabs)/explore/activity/[slug].tsx`

**Step 1: Guard the slug param**

```typescript
// Current (line 19-22):
const { data, loading, error, refetch } = useData(
  () => getActivityWithDetails(slug ?? ''),
  [slug]
);

// Fixed:
const { data, loading, error, refetch } = useData(
  () => slug ? getActivityWithDetails(slug) : Promise.resolve(undefined),
  [slug ?? ''],
);
```

**Step 2: Guard property access on activity**

The `activity.highlights` and `activity.considerations` access is guarded with `&&` checks which is fine. But `activity.googleRating.toFixed(1)` on line 108 could crash if `googleRating` is somehow a non-number. Add a type guard:

```typescript
// Line 108 - already guarded by line 105 check, but add safety:
{typeof activity.googleRating === 'number' && (
  <View style={styles.ratingRow}>
    <Ionicons name="star" size={14} color={colors.textPrimary} />
    <Text style={styles.ratingText}>{activity.googleRating.toFixed(1)}</Text>
    {activity.googleReviewCount != null && activity.googleReviewCount > 0 && (
      <Text style={styles.reviewCount}>
        ({activity.googleReviewCount.toLocaleString()} reviews)
      </Text>
    )}
  </View>
)}
```

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 4: Commit**

```bash
git add app/\(tabs\)/explore/activity/\[slug\].tsx
git commit -m "fix: add defensive guards to activity detail screen"
```

---

## PART 2: Improve the City Detail Page

### Available Data for Context

From the `City` type, these fields are available for contextual framing:
- `summary` — editorial description of the city
- `subtitle` — one-line tagline
- `bestFor` — what the city is best for
- `soloLevel` — beginner/intermediate/expert
- `safetyRating` — safety level
- `goodForInterests` — array of interest tags
- `highlights` — array of highlight strings
- `topThingsToDo` — array of top activities (city-specific field)
- `bestMonths` — best time to visit
- `internetQuality`, `englishFriendliness` — practical quick facts

From the parent `Country`:
- `name`, `safetyRating`, `soloLevel`

### Visual Simplifications

1. **PriceDots (4 circles)**: Currently shows ●●○○ for every card — visually noisy and unclear. Replace with a simple text label like "$$" or remove entirely for cards (keep on detail pages only).
2. **Save button text ("Save"/"Saved")**: The text label next to the heart icon is redundant. Simplify to just the heart icon — it's a universally understood affordance.
3. **Tag pills on list cards**: Currently showing up to 3 tag pills per card in a compact card layout. This makes the cards visually dense. Limit to 2 most relevant tags, or show only the first "good_for" or "vibe" tag.

---

### Task 4: Add contextual framing to city page — above "Plan your days"

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add a context section between editorial and Plan header**

After the `CityEditorial` section and before `planHeader`, add contextual signals using existing city data:

```typescript
// New component: CityContext — shows research signals using existing data
function CityContext({ city, country }: { city: City; country: Country | null }) {
  const signals: { icon: string; label: string }[] = [];

  if (city.soloLevel === 'beginner') {
    signals.push({ icon: 'compass-outline', label: 'Good for first-time solo' });
  } else if (city.soloLevel === 'intermediate') {
    signals.push({ icon: 'compass-outline', label: 'Some solo experience helpful' });
  }

  if (city.englishFriendliness === 'high') {
    signals.push({ icon: 'chatbubble-outline', label: 'English widely spoken' });
  }

  if (city.internetQuality === 'excellent' || city.internetQuality === 'good') {
    signals.push({ icon: 'wifi-outline', label: 'Reliable internet' });
  }

  if (city.safetyRating === 'very_safe' || city.safetyRating === 'generally_safe') {
    signals.push({ icon: 'shield-checkmark-outline', label: 'Generally safe for women' });
  }

  if (signals.length === 0) return null;

  return (
    <View style={styles.contextSection}>
      {signals.slice(0, 3).map((signal, i) => (
        <View key={i} style={styles.contextRow}>
          <Ionicons name={signal.icon as any} size={16} color={colors.greenSoft} />
          <Text style={styles.contextText}>{signal.label}</Text>
        </View>
      ))}
    </View>
  );
}
```

Place this component AFTER `CityEditorial` and BEFORE the neighborhood pills.

Styles:
```typescript
contextSection: {
  marginTop: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.sm,
},
contextRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
},
contextText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: colors.greenSoft,
},
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "feat: add contextual framing signals to city detail page"
```

---

### Task 5: Simplify activity cards — reduce noise

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Replace PriceDots with simple text in PlaceCard**

Replace the PriceDots component usage in PlaceCard with a simpler representation or remove it:

```typescript
// Replace PriceDots in cardTopRow with simple text:
{place.priceLevel != null && place.priceLevel > 0 && (
  <Text style={styles.priceLabel}>{'$'.repeat(place.priceLevel)}</Text>
)}
```

New style:
```typescript
priceLabel: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: colors.textMuted,
},
```

**Step 2: Remove save text label — icon-only**

In `PlaceCard`, simplify the save button from heart+text to just the heart icon:

```typescript
// Replace the save button (lines 208-222):
<Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
  <Ionicons
    name={saved ? 'heart' : 'heart-outline'}
    size={18}
    color={saved ? colors.orange : colors.textMuted}
  />
</Pressable>
```

Remove the `saveText` style and the `<Text>` element.

**Step 3: Limit tags to 2 per card**

Change line 184 from `tags.slice(0, 3)` to `tags.slice(0, 2)`:
```typescript
{tags.slice(0, 2).map((tag) => {
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 5: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "polish: simplify place cards — cleaner price, icon-only save, fewer tags"
```

---

### Task 6: Improve "Plan your days" section header with place count

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Compute total place count and show in Plan header**

```typescript
// Replace the planHeader section (lines 574-579):
{hasPlaces && (
  <View style={styles.planHeader}>
    <Text style={styles.planTitle}>Plan your days</Text>
    <Text style={styles.planSubtitle}>
      {(() => {
        const total = (groupedPlaces?.morning.length ?? 0)
          + (groupedPlaces?.afternoon.length ?? 0)
          + (groupedPlaces?.evening.length ?? 0)
          + (groupedPlaces?.fullDay.length ?? 0);
        return total > 0
          ? `${total} curated places across your day`
          : 'Everything you need for your trip';
      })()}
    </Text>
  </View>
)}
```

**Step 2: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "polish: show curated place count in Plan your days header"
```

---

### Task 7: Add highlights section to city page (using existing data)

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add city highlights below CityContext**

If the city has `highlights` or `topThingsToDo`, surface them as a compact list:

```typescript
function CityHighlights({ city }: { city: City }) {
  const items = city.topThingsToDo ?? city.highlights ?? [];
  if (items.length === 0) return null;

  return (
    <View style={styles.highlightsSection}>
      <Text style={styles.highlightsLabel}>What to expect</Text>
      {items.slice(0, 4).map((item, i) => (
        <View key={i} style={styles.highlightRow}>
          <View style={styles.highlightBullet} />
          <Text style={styles.highlightText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
```

Styles:
```typescript
highlightsSection: {
  marginTop: spacing.lg,
  paddingTop: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.borderSubtle,
},
highlightsLabel: {
  fontFamily: fonts.semiBold,
  fontSize: 15,
  color: colors.textPrimary,
  marginBottom: spacing.sm,
},
highlightRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: spacing.sm,
  marginBottom: spacing.xs,
},
highlightBullet: {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.orange,
  marginTop: 8,
},
highlightText: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textSecondary,
  flex: 1,
  lineHeight: 20,
},
```

Place this component between `CityContext` and the neighborhood pills.

**Step 2: Import City type if not already imported**

The `City` type should already be imported from the data hooks. Verify.

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 4: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "feat: surface city highlights and top things to do"
```

---

### Task 8: Polish spacing and alignment across city page

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Fix community section double-padding**

The community section has `paddingHorizontal: spacing.screenX` at line 986-987 but the parent `.content` already has `paddingHorizontal: spacing.lg` (which is 16px). Remove the extra padding from the community section:

```typescript
// Remove paddingHorizontal from communitySection style:
communitySection: {
  marginTop: spacing.xl,
  marginBottom: spacing.lg,
  // Remove: paddingHorizontal: spacing.screenX,
},
```

**Step 2: Consistent section spacing**

Ensure all sections use the same vertical rhythm:
- Section gap: `spacing.xl` (24px) between major sections
- Inner gap: `spacing.md` (12px) within sections
- Card gap: `spacing.md` (12px) between cards

Review and fix any inconsistencies.

**Step 3: Move community section after the place sections**

Currently community section appears BEFORE "Plan your days". Move it to after the time-based place sections — users should see the core content (places) before the community CTA.

Reorder in the JSX:
1. City name + tagline
2. CityEditorial
3. CityContext (new — from Task 4)
4. CityHighlights (new — from Task 7)
5. Neighborhood pills
6. Plan your days header
7. Time-based sections
8. Community section (moved down)
9. Empty state (if no places)

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 5: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "polish: fix spacing, reorder sections for better content hierarchy"
```

---

### Task 9: Improve FullDayCard — better save affordance and cleaner layout

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Move save button to image overlay corner**

Instead of the absolute-positioned heart inside the body, overlay it on the image:

```typescript
// In FullDayCard, move the save button to overlay on image:
<View style={styles.fullDayImageContainer}>
  {imageUrl ? (
    <Image source={{ uri: imageUrl }} style={styles.fullDayImage} contentFit="cover" transition={200} pointerEvents="none" />
  ) : (
    <View style={[styles.fullDayImage, styles.fullDayImagePlaceholder]} pointerEvents="none" />
  )}
  <Pressable onPress={handleSave} style={styles.fullDaySaveOverlay} hitSlop={8}>
    <Ionicons
      name={saved ? 'heart' : 'heart-outline'}
      size={20}
      color={saved ? colors.orange : '#FFFFFF'}
    />
  </Pressable>
</View>
```

New styles:
```typescript
fullDayImageContainer: {
  position: 'relative',
},
fullDaySaveOverlay: {
  position: 'absolute',
  top: spacing.sm,
  right: spacing.sm,
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(0,0,0,0.3)',
  alignItems: 'center',
  justifyContent: 'center',
},
```

Remove the old `fullDaySave` style.

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add app/\(tabs\)/explore/city/\[slug\].tsx
git commit -m "polish: move save button to image overlay for cleaner layout"
```

---

### Task 10: Final verification and cleanup

**Files:**
- Verify: `app/(tabs)/explore/country/[slug].tsx`
- Verify: `app/(tabs)/explore/city/[slug].tsx`
- Verify: `app/(tabs)/explore/place-detail/[id].tsx`
- Verify: `app/(tabs)/explore/activity/[slug].tsx`

**Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30`
Expected: No new errors introduced by our changes

**Step 2: Verify no Hermes iterator issues**

Run: `grep -rn '\[\.\.\.new Set\|\.\.\.new Map\|\[\.\.\..*\.keys()\]' app/ components/ data/`
Expected: No matches (we must use `Array.from()` instead)

**Step 3: Test the full navigation flow mentally**

Verify these paths work:
1. Explore → Country card → Country page (city list loads)
2. Country → City card → City page (places load, context shows)
3. City → PlaceCard (morning/afternoon/evening) → place-detail page (loads safely)
4. City → FullDayCard → place-detail page (loads safely)
5. Explore feed → Activity card → activity/[slug] page (loads safely)
6. Search → Activity result → activity/[slug] page
7. All activities → Activity → activity/[slug] page

**Step 4: Commit any remaining cleanup**

```bash
git add -A
git commit -m "chore: final verification pass on country-activity flow"
```

---

## Summary of Changes

### Bug Fixes (Part 1)
| File | Fix |
|------|-----|
| `place-detail/[id].tsx` | Guard all useData hooks against null id/place, move derived vars after null guard |
| `city/[slug].tsx` | Guard press handlers and useData hooks in PlaceCard + FullDayCard |
| `activity/[slug].tsx` | Guard slug param, add type safety to rating display |

### Design Improvements (Part 2)
| Change | Rationale |
|--------|-----------|
| CityContext component | Surfaces solo-friendliness, safety, English, internet signals from existing data |
| CityHighlights component | Shows topThingsToDo / highlights as a scannable list |
| Simplified PriceDots → "$" text | Reduces visual noise on compact cards |
| Save button → icon-only | Heart icon is universally understood, no text needed |
| Tags limited to 2 per card | Reduces density for better scannability |
| Place count in "Plan your days" | Signals research depth without marketing copy |
| Community section moved down | Content-first hierarchy: places before discussion CTAs |
| FullDayCard save → image overlay | Cleaner card layout, standard travel app pattern |
| Fixed double padding on community section | Consistent horizontal alignment |
