# Explore Experience Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Explore from a flat directory into a delightful trip planner with clear visual hierarchy, prominent cities, and the "Full Day" section for day trips.

**Architecture:** Enhance existing screens without changing routes. Improve visual design of cards, add featured hero to Explore landing, enhance city page with "Plan your days" framing and better Full Day section.

**Tech Stack:** React Native, Expo Router, TypeScript, expo-image

---

## Pre-requisite: Apply Database Migration

Before implementing, run this SQL in Supabase Dashboard > SQL Editor:

```sql
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS best_time_of_day text
    CHECK (best_time_of_day IS NULL OR best_time_of_day IN ('morning', 'afternoon', 'evening', 'any')),
  ADD COLUMN IF NOT EXISTS estimated_duration text,
  ADD COLUMN IF NOT EXISTS booking_info text,
  ADD COLUMN IF NOT EXISTS physical_level text
    CHECK (physical_level IS NULL OR physical_level IN ('easy', 'moderate', 'challenging'));

CREATE INDEX IF NOT EXISTS idx_places_best_time ON places(city_id, best_time_of_day)
  WHERE is_active = true;

UPDATE places SET best_time_of_day = 'any'
WHERE place_type IN ('hotel', 'hostel', 'homestay') AND best_time_of_day IS NULL;
```

---

## Task 1: Enhance Explore Landing - Featured Hero + Better Section Headers

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Update the header to be more inviting**

Change the AppHeader subtitle from "Find your next destination" to "Where are you dreaming of?"

In `app/(tabs)/explore/index.tsx`, find line 166:
```typescript
<AppHeader title="Explore" subtitle="Find your next destination" />
```

Change to:
```typescript
<AppHeader title="Explore" subtitle="Where are you dreaming of?" />
```

**Step 2: Add a Featured Country Hero component**

Add this new component after the CountryCard component (around line 99):

```typescript
// ---------------------------------------------------------------------------
// Featured Country Hero
// ---------------------------------------------------------------------------

function FeaturedCountryHero({ country, content }: CountryWithContent) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      style={styles.featuredHero}
      onPress={() => {
        posthog.capture('featured_country_tapped', { country_slug: country.slug });
        router.push(`/(tabs)/explore/country/${country.slug}` as any);
      }}
    >
      {country.heroImageUrl ? (
        <Image source={{ uri: country.heroImageUrl }} style={styles.featuredImage} contentFit="cover" transition={300} />
      ) : (
        <View style={[styles.featuredImage, styles.featuredImagePlaceholder]} />
      )}
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredLabel}>Featured destination</Text>
        <Text style={styles.featuredName}>{country.name}</Text>
        {content?.subtitle && (
          <Text style={styles.featuredSubtitle}>{content.subtitle}</Text>
        )}
        <View style={styles.featuredCta}>
          <Text style={styles.featuredCtaText}>Explore</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  );
}
```

**Step 3: Update the main content to show featured hero**

Replace the content section (lines 225-262) with:

```typescript
<>
  {/* Featured Country Hero */}
  {(countriesWithContent ?? []).length > 0 && (
    <FeaturedCountryHero
      country={countriesWithContent![0].country}
      content={countriesWithContent![0].content}
    />
  )}

  {/* Popular Cities Section */}
  {(citiesWithContext ?? []).length > 0 && (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Jump to a city</Text>
      <Text style={styles.sectionSubtitle}>Start planning what to do</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityScroll}
      >
        {(citiesWithContext ?? []).map((item) => (
          <CityCard
            key={item.city.id}
            city={item.city}
            countryName={item.countryName}
            content={item.content}
          />
        ))}
      </ScrollView>
    </View>
  )}

  {/* Countries Section */}
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Browse by country</Text>
    <Text style={styles.sectionSubtitle}>Explore cities and plan your trip</Text>
    <View style={styles.countryGrid}>
      {(countriesWithContent ?? []).slice(1).map((item) => (
        <CountryCard
          key={item.country.id}
          country={item.country}
          content={item.content}
        />
      ))}
    </View>
  </View>
</>
```

**Step 4: Add Featured Hero styles**

Add these styles to the StyleSheet (before the closing `});`):

```typescript
// Featured hero
featuredHero: {
  height: 280,
  borderRadius: radius.card,
  overflow: 'hidden',
  marginBottom: spacing.xl,
  backgroundColor: colors.borderSubtle,
},
featuredImage: {
  width: '100%',
  height: '100%',
},
featuredImagePlaceholder: {
  backgroundColor: colors.borderSubtle,
},
featuredOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: spacing.xl,
  paddingTop: spacing.xxl,
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
featuredLabel: {
  fontFamily: fonts.medium,
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: spacing.xs,
},
featuredName: {
  fontFamily: fonts.semiBold,
  fontSize: 28,
  color: '#FFFFFF',
},
featuredSubtitle: {
  fontFamily: fonts.regular,
  fontSize: 15,
  color: 'rgba(255,255,255,0.9)',
  marginTop: 4,
},
featuredCta: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  marginTop: spacing.md,
},
featuredCtaText: {
  fontFamily: fonts.semiBold,
  fontSize: 14,
  color: '#FFFFFF',
},
```

**Step 5: Run the app and verify**

Run: `npx expo start`
Expected:
- Featured hero shows first country prominently
- "Jump to a city" section shows horizontal scroll of cities
- "Browse by country" shows remaining countries

**Step 6: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: add featured country hero and improve explore layout

- Add prominent featured destination hero at top
- Update section headers to be more inviting
- Reorder countries to show featured first

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Enhance City Cards on Explore Page

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Update CityCard component for better visual hierarchy**

Replace the CityCard component (lines 42-68) with:

```typescript
function CityCard({ city, countryName, content }: CityWithContext) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      style={styles.cityCard}
      onPress={() => {
        posthog.capture('city_tapped', { city_slug: city.slug, city_name: city.name });
        router.push(`/(tabs)/explore/city/${city.slug}` as any);
      }}
    >
      {city.heroImageUrl ? (
        <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.cityImage, styles.cityImagePlaceholder]} />
      )}
      <View style={styles.cityBody}>
        <Text style={styles.cityName} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.cityCountry} numberOfLines={1}>{countryName}</Text>
        {content?.bestFor && (
          <View style={styles.cityBestFor}>
            <Text style={styles.cityBestForText} numberOfLines={1}>{content.bestFor}</Text>
          </View>
        )}
      </View>
      <View style={styles.cityArrowContainer}>
        <Ionicons name="chevron-forward" size={14} color={colors.orange} />
      </View>
    </Pressable>
  );
}
```

**Step 2: Update city card styles**

Replace the city card styles (lines 348-386) with:

```typescript
// City cards (horizontal scroll)
cityScroll: {
  gap: spacing.md,
  paddingRight: spacing.lg,
},
cityCard: {
  width: 180,
  borderRadius: radius.card,
  overflow: 'hidden',
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.borderDefault,
},
cityImage: {
  width: '100%',
  height: 110,
},
cityImagePlaceholder: {
  backgroundColor: colors.borderSubtle,
},
cityBody: {
  padding: spacing.sm,
  paddingBottom: spacing.md,
},
cityName: {
  fontFamily: fonts.semiBold,
  fontSize: 16,
  color: colors.textPrimary,
},
cityCountry: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.textMuted,
  marginTop: 2,
},
cityBestFor: {
  marginTop: spacing.sm,
  backgroundColor: colors.orangeFill,
  paddingHorizontal: spacing.sm,
  paddingVertical: 3,
  borderRadius: radius.pill,
  alignSelf: 'flex-start',
},
cityBestForText: {
  fontFamily: fonts.medium,
  fontSize: 11,
  color: colors.orange,
},
cityArrowContainer: {
  position: 'absolute',
  top: spacing.sm,
  right: spacing.sm,
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.9)',
  alignItems: 'center',
  justifyContent: 'center',
},
```

**Step 3: Run and verify**

Run: `npx expo start`
Expected: City cards are wider, show "Best for" tag, have arrow indicator

**Step 4: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: enhance city cards with best-for tags and navigation hint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Improve Country Page City Cards

**Files:**
- Modify: `app/(tabs)/explore/country/[slug].tsx`

**Step 1: Update CityCard to show vibe and improve visual**

The current CityCard (lines 110-154) is already decent. Update the "Tap to explore places" text to be more actionable.

Change line 148-150 from:
```typescript
<Text style={styles.cityExploreHint}>
  Tap to explore places
</Text>
```

To:
```typescript
<View style={styles.cityExploreRow}>
  <Text style={styles.cityExploreHint}>Plan your days here</Text>
  <Ionicons name="arrow-forward" size={14} color={colors.orange} />
</View>
```

**Step 2: Add the cityExploreRow style**

Add after `cityExploreHint` style (around line 632):

```typescript
cityExploreRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  marginTop: spacing.sm,
},
```

**Step 3: Update section header for cities**

Change lines 281-287 to emphasize the call to action:

```typescript
<Text style={styles.sectionTitle}>
  {cities.length > 0 ? 'Where do you want to go?' : 'Cities coming soon'}
</Text>
{cities.length > 0 && (
  <Text style={styles.sectionHint}>
    {cities.length} {cities.length === 1 ? 'city' : 'cities'} to explore
  </Text>
)}
```

**Step 4: Run and verify**

Run: `npx expo start`
Navigate to a country page.
Expected: Cities section asks "Where do you want to go?", city cards show "Plan your days here →"

**Step 5: Commit**

```bash
git add app/(tabs)/explore/country/[slug].tsx
git commit -m "feat: improve country page city cards with better CTA

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Enhance City Page - "Plan Your Days" Framing

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add section header before time-based sections**

After the area pills section (around line 462), before the time-based sections, add a header:

Find this code (around line 464):
```typescript
{/* Time-based sections */}
{hasPlaces ? (
```

Add before it:
```typescript
{/* Plan your days header */}
{hasPlaces && (
  <View style={styles.planHeader}>
    <Text style={styles.planTitle}>Plan your days</Text>
    <Text style={styles.planSubtitle}>Everything you need for your trip</Text>
  </View>
)}
```

**Step 2: Add styles for plan header**

Add these styles (before the emptyState styles):

```typescript
// Plan header
planHeader: {
  marginTop: spacing.xl,
  marginBottom: spacing.md,
},
planTitle: {
  fontFamily: fonts.semiBold,
  fontSize: 22,
  color: colors.textPrimary,
},
planSubtitle: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textMuted,
  marginTop: 2,
},
```

**Step 3: Run and verify**

Run: `npx expo start`
Navigate to a city page with places.
Expected: "Plan your days" header appears above the time sections

**Step 4: Commit**

```bash
git add app/(tabs)/explore/city/[slug].tsx
git commit -m "feat: add 'Plan your days' header to city page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Enhance Full Day Section with Better Cards

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Create an enhanced FullDayCard component**

Add this new component after the PlaceCard component (around line 227):

```typescript
// ---------------------------------------------------------------------------
// Full Day Activity Card (larger, shows duration + transport)
// ---------------------------------------------------------------------------

function FullDayCard({ place }: { place: Place }) {
  const router = useRouter();
  const posthog = usePostHog();
  const { data: imageUrl } = useData(() => getPlaceFirstImage(place.id), [place.id]);
  const { userId } = useAuth();
  const { data: isSaved } = useData(
    () => userId ? isPlaceSaved(userId, place.id) : Promise.resolve(false),
    [userId, place.id],
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isSaved !== null) setSaved(isSaved);
  }, [isSaved]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    const newSaved = !saved;
    setSaved(newSaved);
    posthog.capture(newSaved ? 'place_saved' : 'place_unsaved', { place_id: place.id, place_name: place.name });
    await toggleSavePlace(userId, place.id);
  }, [userId, place.id, saved, posthog]);

  return (
    <Pressable
      onPress={() => {
        posthog.capture('fullday_card_tapped', { place_id: place.id, place_name: place.name });
        router.push(`/explore/place-detail/${place.id}`);
      }}
      style={styles.fullDayCard}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.fullDayImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.fullDayImage, styles.fullDayImagePlaceholder]} />
      )}
      <View style={styles.fullDayBody}>
        <Text style={styles.fullDayName} numberOfLines={2}>{place.name}</Text>
        {place.whySelected && (
          <Text style={styles.fullDayDesc} numberOfLines={2}>{place.whySelected}</Text>
        )}
        <View style={styles.fullDayMeta}>
          {place.estimatedDuration && (
            <View style={styles.fullDayMetaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.fullDayMetaText}>{place.estimatedDuration}</Text>
            </View>
          )}
          {place.physicalLevel && (
            <View style={styles.fullDayMetaItem}>
              <Ionicons name="walk-outline" size={14} color={colors.textMuted} />
              <Text style={styles.fullDayMetaText}>{place.physicalLevel}</Text>
            </View>
          )}
        </View>
        <Pressable onPress={handleSave} style={styles.fullDaySave} hitSlop={8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? colors.orange : colors.textMuted}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
```

**Step 2: Update TimeBasedSection to use FullDayCard for fullDay section**

Modify the TimeBasedSection component (around line 233) to use the special card:

Replace lines 252-255:
```typescript
{places.slice(0, 6).map((place) => (
  <PlaceCard key={place.id} place={place} showDuration={showDuration} />
))}
```

With:
```typescript
{places.slice(0, 6).map((place) => (
  section.key === 'fullDay' ? (
    <FullDayCard key={place.id} place={place} />
  ) : (
    <PlaceCard key={place.id} place={place} showDuration={showDuration} />
  )
))}
```

**Step 3: Add FullDayCard styles**

Add these styles (after the card styles):

```typescript
// Full day card (larger format)
fullDayCard: {
  borderWidth: 1,
  borderColor: colors.borderDefault,
  borderRadius: radius.card,
  overflow: 'hidden',
  marginBottom: spacing.md,
  backgroundColor: colors.background,
},
fullDayImage: {
  width: '100%',
  height: 140,
},
fullDayImagePlaceholder: {
  backgroundColor: colors.borderSubtle,
},
fullDayBody: {
  padding: spacing.md,
},
fullDayName: {
  fontFamily: fonts.semiBold,
  fontSize: 17,
  color: colors.textPrimary,
  marginBottom: 4,
},
fullDayDesc: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textMuted,
  lineHeight: 20,
  marginBottom: spacing.sm,
},
fullDayMeta: {
  flexDirection: 'row',
  gap: spacing.lg,
},
fullDayMetaItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
fullDayMetaText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: colors.textMuted,
  textTransform: 'capitalize',
},
fullDaySave: {
  position: 'absolute',
  top: spacing.md,
  right: spacing.md,
},
```

**Step 4: Update the Full Day section subtitle**

In TIME_SECTIONS (around line 65), update the fullDay entry:

```typescript
{
  key: 'fullDay',
  title: 'If You Have a Full Day',
  subtitle: 'Day trips and activities worth the time',
  icon: '🗺️',
},
```

**Step 5: Run and verify**

Run: `npx expo start`
Navigate to a city page with full-day activities.
Expected: Full Day section shows larger cards with duration and physical level info

**Step 6: Commit**

```bash
git add app/(tabs)/explore/city/[slug].tsx
git commit -m "feat: add enhanced full-day activity cards with duration info

- Larger cards for day trips and activities
- Show estimated duration and physical level
- Better visual hierarchy for planning

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Improve Empty States with Personality

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Update the empty state in city page**

Replace the empty state (lines 474-480) with:

```typescript
<View style={styles.emptyState}>
  <Text style={styles.emptyIcon}>🗺️</Text>
  <Text style={styles.emptyTitle}>We're still exploring here</Text>
  <Text style={styles.emptyText}>
    Our team is adding places to {city.name}. Check back soon!
  </Text>
  <Pressable
    style={styles.emptyButton}
    onPress={() => router.push('/(tabs)/explore' as any)}
  >
    <Text style={styles.emptyButtonText}>Browse other cities</Text>
  </Pressable>
</View>
```

**Step 2: Add empty button styles**

Add after emptyText style:

```typescript
emptyButton: {
  marginTop: spacing.lg,
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
  backgroundColor: colors.orangeFill,
  borderRadius: radius.pill,
},
emptyButtonText: {
  fontFamily: fonts.semiBold,
  fontSize: 14,
  color: colors.orange,
},
```

**Step 3: Run and verify**

Run: `npx expo start`
Navigate to a city without places.
Expected: Friendly empty state with action button

**Step 4: Commit**

```bash
git add app/(tabs)/explore/city/[slug].tsx
git commit -m "feat: improve empty state with personality and action button

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Final Polish - Consistent Spacing and Typography

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`
- Modify: `app/(tabs)/explore/country/[slug].tsx`
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Ensure consistent section spacing across all three files**

Verify all section margins use `spacing.xl` for consistency.

**Step 2: Run full navigation test**

Run: `npx expo start`

Test the complete flow:
1. Explore → Featured country hero is prominent
2. Explore → Tap city card → City page loads
3. Explore → Tap country → Country page loads
4. Country → Tap city → City page loads with breadcrumb
5. City → Time sections visible
6. City → Full day section has larger cards
7. City → Empty state shows friendly message

**Step 3: Commit all final changes**

```bash
git add -A
git commit -m "feat: complete explore phase 1 redesign

- Featured country hero on explore landing
- Enhanced city cards with best-for tags
- Improved country page with 'Where do you want to go?' framing
- City page with 'Plan your days' header
- Enhanced full-day activity cards
- Friendly empty states

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

After completing these tasks:

| Screen | Improvement |
|--------|-------------|
| **Explore landing** | Featured hero, better city cards, improved headers |
| **Country page** | "Where do you want to go?" framing, actionable city cards |
| **City page** | "Plan your days" header, enhanced full-day cards, friendly empty state |

The flow now feels more like a trip planner than a directory.

---

## Next Phase (Phase 2 - Polish)

After Phase 1 is complete, Phase 2 will add:
- Page transitions (shared element animations)
- Micro-interactions (tap feedback, save animation)
- Skeleton loading states
- Haptic feedback
