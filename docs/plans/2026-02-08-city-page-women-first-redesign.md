# City Page Women-First Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the city detail page from an itinerary builder into a women-first intelligence brief that foregrounds real signals from solo female travelers.

**Architecture:** Add 3 new data-fetching functions (community threads for city, trip count for city, city destination tags). Create 5 new inline sections in the existing `city/[slug].tsx` file. Reorder the page to put women's signals above the fold, push time-based planning sections lower. No new files except API additions — everything stays in the single screen file following existing patterns.

**Tech Stack:** React Native, Supabase, React Query (via `useData` hook), existing design system tokens from `constants/design.ts`.

---

## Overview of Changes

**Current page order:**
1. Nav + Breadcrumb → 2. Hero image → 3. City name + tagline → 4. CityEditorial (summary + bestFor) → 5. CityContext (budget/timing) → 6. CityHighlights (what to expect bullets) → 7. Neighborhood pills → 8. "Your day in [City]" plan header → 9. Time-based place sections → 10. Community link card

**New page order:**
1. Nav (simplified) → 2. Hero image with overlay name → 3. Women-first positioning line → 4. **"From women who've been here"** insights block → 5. **Credibility sourcing line** → 6. **"What women mention most"** signal pills → 7. "At a glance" context (budget/timing/solo level) → 8. "What to expect" editorial → 9. **Community thread previews** (inline, not link card) → 10. Neighborhood pills → 11. Time-based place sections → 12. **"Good to know"** cultural context → 13. Traveler presence signal

**Key data gaps to fill:**
- `getCityThreads(cityId, limit)` — fetch community threads for a city (new function in communityApi.ts)
- `getCityTripCount(cityId)` — count trips with this destination (new function in tripApi.ts)
- `getCityTravelerCount(cityName)` — count discoverable travelers in city (new function in api.ts)

---

## Task 1: Add Data-Fetching Functions

**Files:**
- Modify: `data/community/communityApi.ts` (add `getCityThreadPreviews`)
- Modify: `data/api.ts` (add `getCityTripCount`, `getCityTravelerCount`)

**Step 1: Add `getCityThreadPreviews` to communityApi.ts**

Add this function at the end of the file, before the Place Lookups section (around line 338):

```typescript
// ---------------------------------------------------------------------------
// City Thread Previews (for city detail page)
// ---------------------------------------------------------------------------

/**
 * Fetch a small number of community threads for a specific city,
 * sorted by most relevant (pinned first, then vote_score + recency).
 * Returns lightweight thread data — no user votes needed.
 */
export async function getCityThreadPreviews(
  cityId: string,
  limit: number = 3,
): Promise<{ threads: ThreadWithAuthor[]; totalCount: number }> {
  // Get total count
  const { count, error: countError } = await supabase
    .from('community_threads')
    .select('id', { count: 'exact', head: true })
    .eq('city_id', cityId)
    .eq('status', 'active')
    .eq('visibility', 'public');
  if (countError) throw countError;

  // Get top threads
  const { data, error } = await supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_author_profile_fkey(id, first_name, avatar_url),
      countries(name),
      cities(name, hero_image_url),
      community_topics(label)
    `)
    .eq('city_id', cityId)
    .eq('status', 'active')
    .eq('visibility', 'public')
    .order('pinned', { ascending: false })
    .order('vote_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  const threads = (data ?? []).map((row: any) => ({
    ...toCamel<CommunityThread>(row),
    author: {
      id: row.profiles?.id ?? row.author_id,
      firstName: row.profiles?.first_name ?? '',
      avatarUrl: row.profiles?.avatar_url ?? null,
    },
    countryName: row.countries?.name ?? null,
    cityName: row.cities?.name ?? null,
    cityImageUrl: row.cities?.hero_image_url ?? null,
    topicLabel: row.community_topics?.label ?? null,
    userVote: null,
  }));

  return { threads, totalCount: count ?? 0 };
}
```

**Step 2: Add `getCityTripCount` to api.ts**

Add near the existing trip functions (search for "trip" functions in the file). Place it after the place-related exports:

```typescript
/**
 * Count how many trips have this city as a destination.
 * Used on city detail page for credibility sourcing.
 */
export async function getCityTripCount(cityId: string): Promise<number> {
  const { count, error } = await supabase
    .from('trips')
    .select('id', { count: 'exact', head: true })
    .eq('destination_city_id', cityId);
  if (error) throw error;
  return count ?? 0;
}
```

**Step 3: Add `getCityTravelerCount` to api.ts**

Add near the existing `getNearbyTravelers` function (around line 2117):

```typescript
/**
 * Count discoverable travelers currently in a city.
 * Used on city detail page for traveler presence signal.
 */
export async function getCityTravelerCount(
  cityName: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('location_city_name', cityName)
    .eq('location_sharing_enabled', true)
    .eq('is_discoverable', true);
  if (error) throw error;
  return count ?? 0;
}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(communityApi|api\.ts)' | head -20`
Expected: No errors from our new functions.

**Step 5: Commit**

```
feat(data): add city thread previews, trip count, and traveler count queries
```

---

## Task 2: Redesign Hero + Navigation Section

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

This task simplifies the navigation, moves the city name onto the hero image as an overlay, and adds the women-first positioning line.

**Step 1: Add `expo-linear-gradient` import at top of file**

```typescript
import { LinearGradient } from 'expo-linear-gradient';
```

**Step 2: Replace the nav, breadcrumb, hero, and city name/tagline sections**

Replace everything from `{/* Navigation */}` through the `tagline` Text element (lines ~542-581) with:

```tsx
{/* Simplified navigation */}
<View style={styles.nav}>
  <Pressable
    onPress={() => router.back()}
    hitSlop={12}
    style={styles.backButton}
  >
    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
    <Text style={styles.backText}>
      {country?.name ?? 'Explore'}
    </Text>
  </Pressable>
</View>

<ScrollView showsVerticalScrollIndicator={false}>
  {/* Hero with overlay */}
  <View style={styles.heroContainer}>
    {heroUrl ? (
      <Image source={{ uri: heroUrl }} style={styles.hero} contentFit="cover" transition={200} />
    ) : (
      <View style={[styles.hero, { backgroundColor: colors.neutralFill }]} />
    )}
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.55)']}
      style={styles.heroGradient}
    />
    <View style={styles.heroOverlay}>
      <Text style={styles.heroCity}>{city.name}</Text>
      {country && (
        <Text style={styles.heroCountry}>{country.name}</Text>
      )}
    </View>
  </View>

  <View style={styles.content}>
    {/* Women-first positioning line */}
    {city.bestFor && (
      <Text style={styles.positioningLine}>{city.bestFor}</Text>
    )}
```

**Step 3: Update/add styles for new hero**

Remove old styles: `backToExplore`, `backToExploreText`, `breadcrumb`, `breadcrumbLink`, `breadcrumbChevron`, `breadcrumbCurrent`, `cityName`, `tagline`.

Add new styles:

```typescript
backButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
},
backText: {
  fontFamily: fonts.medium,
  fontSize: 15,
  color: colors.textPrimary,
},
heroContainer: {
  position: 'relative',
  height: 240,
},
hero: {
  width: '100%',
  height: 240,
},
heroGradient: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 120,
},
heroOverlay: {
  position: 'absolute',
  bottom: spacing.xl,
  left: spacing.screenX,
  right: spacing.screenX,
},
heroCity: {
  fontFamily: fonts.serif,
  fontSize: 32,
  color: '#FFFFFF',
  lineHeight: 36,
},
heroCountry: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: 'rgba(255,255,255,0.8)',
  marginTop: spacing.xs,
},
positioningLine: {
  fontFamily: fonts.regular,
  fontSize: 16,
  lineHeight: 24,
  color: colors.textPrimary,
  marginBottom: spacing.xxl,
},
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'city/\[slug\]' | head -20`
Expected: No errors.

**Step 5: Commit**

```
redesign(city): hero overlay with women-first positioning line
```

---

## Task 3: "From Women Who've Been Here" Section

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

This is the core value section. It extracts short insights from community thread titles and the city's `safetyWomenMd` field.

**Step 1: Add imports and data fetching**

Add to the imports at top:

```typescript
import { getCityThreadPreviews } from '@/data/community/communityApi';
```

Inside the `PlaceScreen` component, add after the `groupedPlaces` data fetch:

```typescript
// Women-first signals — community threads for this city
const { data: cityThreadData } = useData(
  () => city?.id ? getCityThreadPreviews(city.id, 5) : Promise.resolve(null),
  ['cityThreadPreviews', city?.id],
);
```

**Step 2: Create the `WomenInsights` component**

Add this component above the `PlaceScreen` function:

```tsx
// ---------------------------------------------------------------------------
// Women's Insights — editorial distillation of community signals
// ---------------------------------------------------------------------------

function WomenInsights({
  threads,
  safetyWomenMd,
}: {
  threads: ThreadWithAuthor[];
  safetyWomenMd: string | null;
}) {
  // Build insights from thread titles (real questions women asked)
  // and safetyWomenMd content (editorial safety notes)
  const insights: string[] = [];

  // Thread titles are real questions/insights from women
  for (const thread of threads.slice(0, 3)) {
    if (thread.title && thread.title.length > 10) {
      insights.push(thread.title);
    }
  }

  // If we have safety markdown, extract first 2 sentences as insights
  if (safetyWomenMd && insights.length < 4) {
    const sentences = safetyWomenMd
      .replace(/^#+\s.*/gm, '') // strip markdown headers
      .replace(/\*\*/g, '')     // strip bold markers
      .split(/[.!?]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 120);
    for (const s of sentences.slice(0, 2)) {
      if (insights.length >= 5) break;
      insights.push(s);
    }
  }

  if (insights.length === 0) return null;

  return (
    <View style={styles.insightsSection}>
      <Text style={styles.sectionLabel}>FROM WOMEN WHO'VE BEEN HERE</Text>
      {insights.map((insight, i) => (
        <View key={i} style={styles.insightRow}>
          <View style={styles.insightAccent} />
          <Text style={styles.insightText}>
            {insight.endsWith('?') || insight.endsWith('.') || insight.endsWith('!')
              ? insight
              : insight + '.'}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

**Step 3: Add the import for ThreadWithAuthor type**

At the top of the file, add:

```typescript
import type { ThreadWithAuthor } from '@/data/community/types';
```

**Step 4: Place it in the render tree**

After the positioning line and before the old `CityEditorial`, insert:

```tsx
{/* Women-first insights — the core value block */}
{cityThreadData && (
  <WomenInsights
    threads={cityThreadData.threads}
    safetyWomenMd={city.safetyWomenMd ?? null}
  />
)}
```

**Step 5: Add styles**

```typescript
// Women's insights
insightsSection: {
  marginBottom: spacing.xl,
},
sectionLabel: {
  fontFamily: fonts.medium,
  fontSize: 11,
  letterSpacing: 1.5,
  color: colors.textMuted,
  marginBottom: spacing.lg,
},
insightRow: {
  flexDirection: 'row',
  marginBottom: spacing.md,
},
insightAccent: {
  width: 2,
  backgroundColor: colors.orange,
  opacity: 0.3,
  borderRadius: 1,
  marginRight: spacing.md,
  marginTop: 2,
  marginBottom: 2,
},
insightText: {
  fontFamily: fonts.regular,
  fontSize: 15,
  lineHeight: 22,
  color: colors.textPrimary,
  flex: 1,
},
```

**Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'city/\[slug\]' | head -20`

**Step 7: Commit**

```
feat(city): add "From women who've been here" insights section
```

---

## Task 4: Credibility Line + "What Women Mention Most" Signal Pills

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add trip count and traveler count data fetching**

Add to imports:

```typescript
import { getCityTripCount, getCityTravelerCount, getDestinationTags } from '@/data/api';
```

Inside `PlaceScreen`, add:

```typescript
// Credibility signals
const { data: tripCount } = useData(
  () => city?.id ? getCityTripCount(city.id) : Promise.resolve(0),
  ['cityTripCount', city?.id],
);
const { data: travelerCount } = useData(
  () => city?.name ? getCityTravelerCount(city.name) : Promise.resolve(0),
  ['cityTravelerCount', city?.name],
);
const { data: cityTags } = useData(
  () => city?.id ? getDestinationTags('city', city.id) : Promise.resolve([]),
  ['cityDestTags', city?.id],
);
```

**Step 2: Create `CredibilityLine` component**

```tsx
// ---------------------------------------------------------------------------
// Credibility Sourcing Line
// ---------------------------------------------------------------------------

function CredibilityLine({
  threadCount,
  tripCount,
}: {
  threadCount: number;
  tripCount: number;
}) {
  const parts: string[] = [];
  if (threadCount > 0) {
    parts.push(`${threadCount} discussion${threadCount === 1 ? '' : 's'}`);
  }
  if (tripCount > 0) {
    parts.push(`${tripCount} traveler${tripCount === 1 ? '' : 's'}\u2019 experiences`);
  }

  if (parts.length === 0) return null;

  return (
    <Text style={styles.credibilityLine}>
      Based on {parts.join(' and ')}
    </Text>
  );
}
```

**Step 3: Create `SignalPills` component**

```tsx
// ---------------------------------------------------------------------------
// "What Women Mention Most" — aggregated signal pills
// ---------------------------------------------------------------------------

function SignalPills({
  city,
  cityTags,
}: {
  city: City;
  cityTags: DestinationTag[];
}) {
  // Build signal labels from multiple sources
  const signals: string[] = [];

  // From destination tags (editorial tags on the city itself)
  for (const tag of cityTags.slice(0, 3)) {
    signals.push(tag.tagLabel);
  }

  // From city interests
  const interests = city.goodForInterests ?? [];
  for (const interest of interests.slice(0, 2)) {
    const label = INTEREST_LABELS[interest.toLowerCase()];
    if (label && !signals.includes(label)) {
      signals.push(label);
    }
  }

  // From highlights
  const highlights = city.highlights ?? [];
  for (const h of highlights.slice(0, 2)) {
    // Only use short highlights as pills
    if (h.length <= 25 && signals.length < 6) {
      signals.push(h);
    }
  }

  // Deduplicate
  const unique = Array.from(new Set(signals)).slice(0, 5);
  if (unique.length === 0) return null;

  return (
    <View style={styles.signalSection}>
      <Text style={styles.sectionLabel}>WHAT WOMEN MENTION MOST</Text>
      <View style={styles.signalRow}>
        {unique.map((signal, i) => (
          <View key={i} style={styles.signalPill}>
            <Text style={styles.signalDiamond}>◇</Text>
            <Text style={styles.signalText}>{signal}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
```

**Step 4: Add DestinationTag import to the type imports**

```typescript
import type { City, Country, Place, Tag, DestinationTag } from '@/data/types';
```

**Step 5: Place both in render tree**

After the `WomenInsights` block, before the old `CityEditorial`:

```tsx
{/* Credibility sourcing */}
{cityThreadData && (
  <CredibilityLine
    threadCount={cityThreadData.totalCount}
    tripCount={tripCount ?? 0}
  />
)}

{/* Signal pills */}
<SignalPills city={city} cityTags={cityTags ?? []} />
```

**Step 6: Add styles**

```typescript
// Credibility line
credibilityLine: {
  fontFamily: fonts.regular,
  fontSize: 13,
  lineHeight: 18,
  color: colors.textMuted,
  marginBottom: spacing.xxl,
},
// Signal pills
signalSection: {
  marginBottom: spacing.xxl,
},
signalRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.sm,
},
signalPill: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.neutralFill,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: radius.sm,
  gap: spacing.xs,
},
signalDiamond: {
  fontSize: 10,
  color: colors.textMuted,
},
signalText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: colors.textPrimary,
},
```

**Step 7: Verify + Commit**

```
feat(city): credibility line and "What women mention most" signal pills
```

---

## Task 5: Inline Community Thread Previews

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

Replace the old community link card (orange card at bottom) with inline thread preview cards positioned mid-page, between the editorial section and the place planning section.

**Step 1: Create `ThreadPreviewSection` component**

```tsx
// ---------------------------------------------------------------------------
// Inline Community Thread Previews
// ---------------------------------------------------------------------------

function ThreadPreviewSection({
  threads,
  totalCount,
  cityId,
  countryId,
  cityName,
  countryName,
}: {
  threads: ThreadWithAuthor[];
  totalCount: number;
  cityId: string;
  countryId: string;
  cityName: string;
  countryName: string | null;
}) {
  const router = useRouter();

  if (threads.length === 0) return null;

  const placeName = cityName + (countryName ? `, ${countryName}` : '');

  return (
    <View style={styles.threadPreviewSection}>
      <View style={styles.threadPreviewHeader}>
        <Text style={styles.sectionLabel}>COMMUNITY DISCUSSIONS</Text>
        {totalCount > threads.length && (
          <Pressable
            onPress={() => router.push({
              pathname: '/(tabs)/community',
              params: { countryId, cityId, placeName },
            } as any)}
            hitSlop={8}
          >
            <Text style={styles.seeAllLink}>See all</Text>
          </Pressable>
        )}
      </View>
      {threads.map((thread) => (
        <Pressable
          key={thread.id}
          onPress={() => router.push(`/(tabs)/community/thread/${thread.id}` as any)}
          style={({ pressed }) => [styles.threadCard, pressed && styles.threadCardPressed]}
        >
          <Feather name="message-circle" size={16} color={colors.textMuted} style={styles.threadIcon} />
          <View style={styles.threadCardBody}>
            <Text style={styles.threadTitle} numberOfLines={2}>{thread.title}</Text>
            <Text style={styles.threadMeta}>
              {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              {thread.topicLabel ? `  ·  ${thread.topicLabel}` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.borderDefault} />
        </Pressable>
      ))}
    </View>
  );
}
```

**Step 2: Place in render tree**

After the `CityEditorial` and `CityContext` sections, before the neighborhood pills. Remove the old community section entirely (the orange card block near line 667-704).

```tsx
{/* Community thread previews */}
{cityThreadData && cityThreadData.threads.length > 0 && city?.id && (
  <ThreadPreviewSection
    threads={cityThreadData.threads}
    totalCount={cityThreadData.totalCount}
    cityId={city.id}
    countryId={city.countryId}
    cityName={city.name}
    countryName={country?.name ?? null}
  />
)}
```

**Step 3: Remove old community section**

Delete the entire block from `{/* Community discussions — after places */}` through the closing `</View>` of the `communitySection` (approximately lines 667-704).

Remove old styles: `communitySection`, `communitySectionHeader`, `communitySeeAll`, `communitySubtitle`, `communityCard`, `communityCardTitle`, `communityCardSubtitle`.

**Step 4: Add styles**

```typescript
// Thread previews
threadPreviewSection: {
  marginBottom: spacing.xxl,
},
threadPreviewHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: spacing.md,
},
seeAllLink: {
  fontFamily: fonts.medium,
  fontSize: 14,
  color: colors.orange,
},
threadCard: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.borderSubtle,
},
threadCardPressed: {
  opacity: 0.7,
},
threadIcon: {
  marginRight: spacing.md,
  marginTop: 2,
},
threadCardBody: {
  flex: 1,
  marginRight: spacing.sm,
},
threadTitle: {
  fontFamily: fonts.medium,
  fontSize: 15,
  lineHeight: 20,
  color: colors.textPrimary,
},
threadMeta: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.textMuted,
  marginTop: spacing.xs,
},
```

**Step 5: Verify + Commit**

```
feat(city): replace community link card with inline thread previews
```

---

## Task 6: Reorder Sections — New Page Flow

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

This task restructures the render tree to match the new hierarchy. By now all components exist — this task wires them into the correct order.

**Step 1: Restructure the `<View style={styles.content}>` block**

The full content block should now read in this order:

```tsx
<View style={styles.content}>
  {/* 1. Women-first positioning line */}
  {city.bestFor && (
    <Text style={styles.positioningLine}>{city.bestFor}</Text>
  )}

  {/* 2. "From women who've been here" insights */}
  {cityThreadData && (
    <WomenInsights
      threads={cityThreadData.threads}
      safetyWomenMd={city.safetyWomenMd ?? null}
    />
  )}

  {/* 3. Credibility sourcing */}
  {cityThreadData && (
    <CredibilityLine
      threadCount={cityThreadData.totalCount}
      tripCount={tripCount ?? 0}
    />
  )}

  {/* 4. Signal pills */}
  <SignalPills city={city} cityTags={cityTags ?? []} />

  {/* 5. At a glance — practical context */}
  <CityContext city={city} />

  {/* 6. What to expect — editorial */}
  <CityEditorial
    summary={city.summary}
    bestFor={null}
  />
  {/* Note: bestFor already shown in positioning line, pass null */}

  {/* 7. Community thread previews */}
  {cityThreadData && cityThreadData.threads.length > 0 && city?.id && (
    <ThreadPreviewSection
      threads={cityThreadData.threads}
      totalCount={cityThreadData.totalCount}
      cityId={city.id}
      countryId={city.countryId}
      cityName={city.name}
      countryName={country?.name ?? null}
    />
  )}

  {/* 8. Neighborhood pills */}
  {(areas ?? []).length > 0 && (
    /* ... existing neighborhood pill code unchanged ... */
  )}

  {/* 9. Plan header + time-based sections */}
  {hasPlaces && (
    <>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>Your day in {city.name}</Text>
        <Text style={styles.planSubtitle}>
          Curated places, organized by time of day
        </Text>
      </View>
      {TIME_SECTIONS.map((section) => (
        <TimeBasedSection
          key={section.key}
          section={section}
          places={groupedPlaces?.[section.key] ?? []}
        />
      ))}
    </>
  )}

  {/* 10. "Good to know" — cultural context */}
  <GoodToKnow cultureEtiquetteMd={city.cultureEtiquetteMd ?? null} />

  {/* 11. Traveler presence signal */}
  <TravelerPresence
    count={travelerCount ?? 0}
    tripCount={tripCount ?? 0}
    cityName={city.name}
  />

  {/* Empty state (when no places AND no threads) */}
  {!hasPlaces && (!cityThreadData || cityThreadData.threads.length === 0) && (
    <View style={styles.emptyState}>
      {/* ... existing empty state unchanged ... */}
    </View>
  )}
</View>
```

**Step 2: Remove the old `CityHighlights` component and its styles**

The highlights bullets are now absorbed into `SignalPills`. Delete the `CityHighlights` function and styles: `cityHighlightsSection`, `cityHighlightsLabel`, `cityHighlightRow`, `cityHighlightBullet`, `cityHighlightText`.

**Step 3: Update `CityEditorial` styles**

Give it more breathing room at the top and remove the bestFor display (already shown in positioning line):

```typescript
editorial: {
  marginBottom: spacing.xxl,
  paddingVertical: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.borderSubtle,
},
```

**Step 4: Update `CityContext` section label**

Change the CityContext component's section label to match the new design. Add a label above the signals:

In `CityContext`, wrap the existing return in:

```tsx
return (
  <View style={styles.contextSection}>
    <Text style={styles.sectionLabel}>AT A GLANCE</Text>
    {signals.slice(0, 3).map((signal, i) => (
      <View key={i} style={styles.contextRow}>
        <Ionicons name={signal.icon as any} size={16} color={colors.textSecondary} />
        <Text style={styles.contextText}>{signal.label}</Text>
      </View>
    ))}
  </View>
);
```

Update `contextSection` style:

```typescript
contextSection: {
  marginBottom: spacing.xxl,
  gap: spacing.sm,
},
```

**Step 5: Verify + Commit**

```
redesign(city): reorder sections for women-first hierarchy
```

---

## Task 7: "Good to Know" + Traveler Presence Sections

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Create `GoodToKnow` component**

```tsx
// ---------------------------------------------------------------------------
// "Good to Know" — cultural context from markdown content
// ---------------------------------------------------------------------------

function GoodToKnow({ cultureEtiquetteMd }: { cultureEtiquetteMd: string | null }) {
  if (!cultureEtiquetteMd) return null;

  // Extract bullet points or sentences from markdown
  const items = cultureEtiquetteMd
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '').replace(/\*\*/g, '').trim())
    .filter(line => line.length > 10 && line.length < 150)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <View style={styles.goodToKnowSection}>
      <Text style={styles.sectionLabel}>GOOD TO KNOW</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.goodToKnowRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
          <Text style={styles.goodToKnowText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
```

**Step 2: Create `TravelerPresence` component**

```tsx
// ---------------------------------------------------------------------------
// Traveler Presence Signal
// ---------------------------------------------------------------------------

function TravelerPresence({
  count,
  tripCount,
  cityName,
}: {
  count: number;
  tripCount: number;
  cityName: string;
}) {
  if (count === 0 && tripCount === 0) return null;

  let message = '';
  if (count > 0 && tripCount > 0) {
    message = `${count} Sola traveler${count === 1 ? '' : 's'} nearby · ${tripCount} trip${tripCount === 1 ? '' : 's'} planned`;
  } else if (count > 0) {
    message = `${count} Sola traveler${count === 1 ? ' is' : 's are'} in ${cityName} now`;
  } else {
    message = `${tripCount} traveler${tripCount === 1 ? ' has' : 's have'} planned trips to ${cityName}`;
  }

  return (
    <View style={styles.travelerPresenceSection}>
      <Text style={styles.sectionLabel}>WOMEN TRAVELING HERE</Text>
      <View style={styles.travelerPresenceRow}>
        <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.travelerPresenceText}>{message}</Text>
      </View>
    </View>
  );
}
```

**Step 3: Add styles**

```typescript
// Good to know
goodToKnowSection: {
  marginTop: spacing.xxl,
  marginBottom: spacing.xl,
},
goodToKnowRow: {
  flexDirection: 'row',
  gap: spacing.sm,
  marginBottom: spacing.sm,
},
goodToKnowText: {
  fontFamily: fonts.regular,
  fontSize: 14,
  lineHeight: 20,
  color: colors.textSecondary,
  flex: 1,
},
// Traveler presence
travelerPresenceSection: {
  marginTop: spacing.lg,
  marginBottom: spacing.xxl,
  paddingTop: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.borderSubtle,
},
travelerPresenceRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
},
travelerPresenceText: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textSecondary,
},
```

**Step 4: Verify + Commit**

```
feat(city): add "Good to know" cultural context and traveler presence signal
```

---

## Task 8: Style Polish + Spacing Cleanup

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Update `content` container padding**

```typescript
content: {
  paddingHorizontal: spacing.screenX,
  paddingTop: spacing.xxl,
  paddingBottom: spacing.xxxxl,
},
```

**Step 2: Update `nav` style**

```typescript
nav: {
  paddingHorizontal: spacing.screenX,
  paddingVertical: spacing.md,
},
```

**Step 3: Update `planHeader` style for more breathing room**

```typescript
planHeader: {
  marginTop: spacing.lg,
  marginBottom: spacing.lg,
  paddingTop: spacing.xl,
  borderTopWidth: 1,
  borderTopColor: colors.borderSubtle,
},
planTitle: {
  fontFamily: fonts.semiBold,
  fontSize: 20,
  color: colors.textPrimary,
},
planSubtitle: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textMuted,
  marginTop: spacing.xs,
},
```

**Step 4: Final TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30`
Expected: No new errors from our changes.

**Step 5: Visual review in simulator**

Run: `npx expo start` and navigate to any city page. Check:
- Hero image with overlaid name renders correctly
- "From women who've been here" section shows insights (or gracefully hides if no data)
- Credibility line shows accurate counts
- Signal pills wrap cleanly
- Thread previews are tappable and navigate to thread detail
- Time-based sections still render correctly lower on the page
- "Good to know" and "Traveler presence" show at bottom

**Step 6: Commit**

```
polish(city): spacing, typography, and visual refinements
```

---

## Summary of All Files Changed

| File | Action |
|------|--------|
| `data/community/communityApi.ts` | Add `getCityThreadPreviews()` |
| `data/api.ts` | Add `getCityTripCount()`, `getCityTravelerCount()` |
| `app/(tabs)/explore/city/[slug].tsx` | Major restructure — new sections, reordered layout |

**No new files created** (all new components are inline in the city screen file, following the existing pattern where `PlaceCard`, `FullDayCard`, `CityEditorial`, `CityContext`, `CityHighlights` are all defined inline).

**No backend changes** — all data already exists in Supabase.

**No design system changes** — all styles use existing tokens from `constants/design.ts`.
