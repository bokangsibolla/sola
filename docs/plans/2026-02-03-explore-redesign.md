# Explore Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Explore experience from a flat country list into a curated, magazine-style layout with tabs, themed sections, editorial country portraits, and destination-level tags — while removing all safety ratings, solo-friendly badges, and anything that scores or ranks destinations.

**Architecture:** Add a `destination_tags` table in Supabase for country/city-level tags. Redesign the Explore index as a tabbed, sectioned layout with a featured hero card and horizontal collection scrolls. Replace the country page safety rating with a rich editorial portrait pulled from `safety_women_md`. Add a `portrait_md` column to `geo_content` for the full narrative.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres), TypeScript

---

## Task 1: Supabase migration — destination_tags table + portrait_md column

**Files:**
- Create: `supabase/migrations/00009_destination_tags.sql`
- Modify: `data/types.ts`

**Step 1: Write the migration SQL**

Create `supabase/migrations/00009_destination_tags.sql`:

```sql
-- Destination-level tags for countries, cities, and neighborhoods
create type destination_entity_type as enum ('country', 'city', 'neighborhood');

create table destination_tags (
  id uuid primary key default gen_random_uuid(),
  entity_type destination_entity_type not null,
  entity_id uuid not null,
  tag_category text not null,
  tag_slug text not null,
  tag_label text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, tag_slug)
);

create index idx_destination_tags_entity on destination_tags (entity_type, entity_id);
create index idx_destination_tags_category on destination_tags (tag_category);

-- Enable RLS
alter table destination_tags enable row level security;
create policy "Anyone can read destination_tags"
  on destination_tags for select using (true);

-- Add portrait_md to geo_content for rich editorial narratives
alter table geo_content add column if not exists portrait_md text;

-- Add best_for line to geo_content
alter table geo_content add column if not exists best_for text;
```

**Step 2: Run the migration**

Run: `npx supabase db push` (or apply via Supabase dashboard)

**Step 3: Add TypeScript types**

Add to `data/types.ts`:

```typescript
export interface DestinationTag {
  id: string;
  entityType: 'country' | 'city' | 'neighborhood';
  entityId: string;
  tagCategory: string;
  tagSlug: string;
  tagLabel: string;
  orderIndex: number;
  createdAt: string;
}
```

Update `GeoContent` interface — add:

```typescript
  portraitMd: string | null;
  bestFor: string | null;
```

**Step 4: Commit**

```bash
git add supabase/migrations/00009_destination_tags.sql data/types.ts
git commit -m "feat: add destination_tags table and portrait_md column"
```

---

## Task 2: Seed destination tags for existing countries

**Files:**
- Create: `supabase/migrations/00010_seed_destination_tags.sql`

**Step 1: Write the seed migration**

This inserts tags for each country currently in the database. The tag categories are:

- `travel_style`: beach_islands, city_culture, nature_outdoors, wellness_retreat, nightlife_social, foodie, adventure
- `solo_context`: first_solo_trip, easy_to_navigate, english_widely_spoken, strong_solo_community, great_public_transport
- `vibe`: lively, relaxed, adventurous, spiritual
- `budget`: budget_friendly, mid_range, splurge_worthy
- `pace`: slow_travel, fast_paced, mix_of_both

Create `supabase/migrations/00010_seed_destination_tags.sql`:

```sql
-- Seed destination tags for countries
-- Each country gets tags based on its character

-- Thailand
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('travel_style', 'wellness_retreat', 'Wellness', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'thailand'
on conflict do nothing;

-- Philippines
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 3),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 1),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 2),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'philippines'
on conflict do nothing;

-- Indonesia (Bali focus)
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'wellness_retreat', 'Wellness', 1),
  ('travel_style', 'beach_islands', 'Beach & islands', 2),
  ('travel_style', 'city_culture', 'Culture', 3),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'indonesia'
on conflict do nothing;

-- Portugal
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('travel_style', 'beach_islands', 'Beach & islands', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'great_public_transport', 'Great public transport', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'portugal'
on conflict do nothing;

-- Japan
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 3),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 1),
  ('solo_context', 'great_public_transport', 'Great public transport', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'japan'
on conflict do nothing;

-- NOTE: Add more countries as they're added to the platform.
-- For countries not yet seeded, the Explore page gracefully shows them in "All" without tags.
```

**Step 2: Commit**

```bash
git add supabase/migrations/00010_seed_destination_tags.sql
git commit -m "feat: seed destination tags for initial countries"
```

---

## Task 3: API functions for destination tags

**Files:**
- Modify: `data/api.ts`

**Step 1: Add the API functions**

Add to the Geography section of `data/api.ts`:

```typescript
// ---------------------------------------------------------------------------
// Destination Tags
// ---------------------------------------------------------------------------

export async function getDestinationTags(
  entityType: 'country' | 'city' | 'neighborhood',
  entityId: string,
): Promise<DestinationTag[]> {
  const { data, error } = await supabase
    .from('destination_tags')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<DestinationTag>(data ?? []);
}

export async function getCountriesByTag(tagSlug: string): Promise<Country[]> {
  const { data, error } = await supabase
    .from('destination_tags')
    .select('entity_id')
    .eq('entity_type', 'country')
    .eq('tag_slug', tagSlug);
  if (error) throw error;
  const ids = (data ?? []).map((r) => r.entity_id);
  if (ids.length === 0) return [];
  const { data: countries, error: cError } = await supabase
    .from('countries')
    .select('*')
    .in('id', ids)
    .eq('is_active', true)
    .order('order_index');
  if (cError) throw cError;
  return rowsToCamel<Country>(countries ?? []);
}

export async function getCountriesByTags(tagSlugs: string[]): Promise<Country[]> {
  if (tagSlugs.length === 0) return getCountries();
  const { data, error } = await supabase
    .from('destination_tags')
    .select('entity_id')
    .eq('entity_type', 'country')
    .in('tag_slug', tagSlugs);
  if (error) throw error;
  // Countries that match ANY of the selected tags
  const ids = [...new Set((data ?? []).map((r) => r.entity_id))];
  if (ids.length === 0) return [];
  const { data: countries, error: cError } = await supabase
    .from('countries')
    .select('*')
    .in('id', ids)
    .eq('is_active', true)
    .order('order_index');
  if (cError) throw cError;
  return rowsToCamel<Country>(countries ?? []);
}
```

Also add the import for `DestinationTag` at the top of api.ts.

**Step 2: Commit**

```bash
git add data/api.ts
git commit -m "feat: add destination tag query functions"
```

---

## Task 4: Remove safety badges and solo-friendly from Explore index

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Clean up the country cards**

Remove:
- The entire `SAFETY_COLORS` constant (lines 14-19)
- The `guideMeta` view containing safety badge and solo-friendly badge (lines 120-134)
- The `guideMeta`, `badge`, `badgeText` styles

The country card should now only show: hero image, country name, and subtitle. Clean and calm.

**Step 2: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "fix: remove safety ratings and solo-friendly badge from country cards"
```

---

## Task 5: Redesign Explore index — tabbed magazine layout

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`
- Modify: `data/api.ts` (add imports)

This is the main visual redesign. The Explore page becomes:

1. Search bar (kept)
2. Tab row: "For you", "Beach & nature", "City & culture", "First solo trip"
3. Below tabs, the content is sectioned:
   - A **featured hero card** (large, full-width, one destination)
   - **Themed horizontal scrolls** of country cards (smaller, different sections)

**Step 1: Rewrite the Explore screen**

Replace the entire `ExploreScreen` component and styles in `app/(tabs)/explore/index.tsx` with:

```typescript
import { useState, useMemo } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { getCountries, getCountryContent, searchDestinations, getCountriesByTags } from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import type { Country, GeoContent } from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SMALL_CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2.3;

// Tab definitions — each maps to destination tag slugs
const TABS = [
  { key: 'all', label: 'For you', tags: [] as string[] },
  { key: 'beach', label: 'Beach & nature', tags: ['beach_islands', 'nature_outdoors'] },
  { key: 'city', label: 'City & culture', tags: ['city_culture', 'foodie'] },
  { key: 'first', label: 'First solo trip', tags: ['first_solo_trip'] },
] as const;

// Section definitions for the "For you" tab
const SECTIONS = [
  { title: 'Perfect for a first solo trip', tags: ['first_solo_trip'] },
  { title: 'Beach & island escapes', tags: ['beach_islands'] },
  { title: 'City & culture', tags: ['city_culture'] },
  { title: 'Wellness retreats', tags: ['wellness_retreat'] },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: countries, loading, error, refetch } = useData(() => getCountries());

  const { data: countriesWithContent } = useData(
    async () => {
      const list = countries ?? [];
      const contents = await Promise.all(list.map((c) => getCountryContent(c.id)));
      return list.map((c, i) => ({ country: c, content: contents[i] }));
    },
    [countries],
  );

  // Filtered countries for non-"all" tabs
  const selectedTab = TABS.find((t) => t.key === activeTab)!;
  const { data: filteredCountries } = useData(
    () => selectedTab.tags.length > 0 ? getCountriesByTags(selectedTab.tags) : Promise.resolve(null),
    [activeTab],
  );

  const debouncedSearch = search.trim();
  const { data: searchResults, loading: searchLoading } = useData(
    () => (debouncedSearch ? searchDestinations(debouncedSearch) : Promise.resolve(null)),
    [debouncedSearch],
  );

  const isSearching = debouncedSearch.length > 0;

  // Build section data for "For you" tab
  const sectionData = useMemo(() => {
    if (!countriesWithContent) return [];
    return SECTIONS.map((section) => {
      // For now, match using goodForInterests in content or show all
      const items = countriesWithContent.filter(({ content }) => {
        if (!content?.goodForInterests) return false;
        return section.tags.some((tag) =>
          content.goodForInterests.some((interest: string) =>
            interest.toLowerCase().includes(tag.replace('_', ' ').replace('_', ' '))
          )
        );
      });
      return { ...section, items };
    }).filter((s) => s.items.length > 0);
  }, [countriesWithContent]);

  // For filtered tabs, get the content-paired list
  const filteredWithContent = useMemo(() => {
    if (!filteredCountries || !countriesWithContent) return [];
    const idSet = new Set(filteredCountries.map((c) => c.id));
    return countriesWithContent.filter(({ country }) => idSet.has(country.id));
  }, [filteredCountries, countriesWithContent]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const allItems = countriesWithContent ?? [];
  const featured = allItems[0]; // First country as featured

  return (
    <AppScreen>
      <AppHeader title="Explore" subtitle="Find your next destination" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries or cities..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {isSearching ? (
          /* Search results */
          searchLoading ? (
            <LoadingScreen />
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((result) => (
              <Pressable
                key={`${result.type}-${result.id}`}
                style={styles.searchItem}
                onPress={() => {
                  if (result.type === 'country') {
                    router.push(`/(tabs)/explore/country/${result.slug}`);
                  } else {
                    router.push(`/(tabs)/explore/place/${result.slug}`);
                  }
                }}
              >
                <View style={styles.searchItemIcon}>
                  <Ionicons
                    name={result.type === 'country' ? 'flag' : 'location'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.searchItemText}>
                  <Text style={styles.searchItemName}>{result.name}</Text>
                  {result.parentName && (
                    <Text style={styles.searchItemParent}>{result.parentName}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))
          ) : (
            <Text style={styles.noResults}>No results for "{search}"</Text>
          )
        ) : (
          <>
            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabRow}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[styles.tab, active && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {activeTab === 'all' ? (
              <>
                {/* Featured hero card */}
                {featured && (
                  <Pressable
                    style={styles.featuredCard}
                    onPress={() => router.push(`/(tabs)/explore/country/${featured.country.slug}`)}
                  >
                    {featured.country.heroImageUrl && (
                      <Image
                        source={{ uri: featured.country.heroImageUrl }}
                        style={styles.featuredImage}
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                    <View style={styles.featuredOverlay}>
                      <Text style={styles.featuredName}>{featured.country.name}</Text>
                      {featured.content?.subtitle && (
                        <Text style={styles.featuredSubtitle}>{featured.content.subtitle}</Text>
                      )}
                    </View>
                  </Pressable>
                )}

                {/* Themed sections */}
                {sectionData.map((section) => (
                  <View key={section.title} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.sectionScroll}
                    >
                      {section.items.map(({ country, content }) => (
                        <Pressable
                          key={country.slug}
                          style={styles.smallCard}
                          onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                        >
                          {country.heroImageUrl && (
                            <Image
                              source={{ uri: country.heroImageUrl }}
                              style={styles.smallCardImage}
                              contentFit="cover"
                              transition={200}
                            />
                          )}
                          <Text style={styles.smallCardName}>{country.name}</Text>
                          {content?.subtitle && (
                            <Text style={styles.smallCardSub} numberOfLines={2}>
                              {content.subtitle}
                            </Text>
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ))}

                {/* Remaining countries as standard cards (fallback for countries without tags) */}
                {allItems.slice(1).map(({ country, content }) => (
                  <Pressable
                    key={country.slug}
                    style={styles.guideCard}
                    onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                  >
                    {country.heroImageUrl && (
                      <Image source={{ uri: country.heroImageUrl }} style={styles.guideImage} contentFit="cover" transition={200} />
                    )}
                    <View style={styles.guideOverlay}>
                      <Text style={styles.guideName}>{country.name}</Text>
                      {content?.subtitle && (
                        <Text style={styles.guideSubtitle}>{content.subtitle}</Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </>
            ) : (
              /* Filtered tab view */
              filteredWithContent.length > 0 ? (
                filteredWithContent.map(({ country, content }) => (
                  <Pressable
                    key={country.slug}
                    style={styles.guideCard}
                    onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                  >
                    {country.heroImageUrl && (
                      <Image source={{ uri: country.heroImageUrl }} style={styles.guideImage} contentFit="cover" transition={200} />
                    )}
                    <View style={styles.guideOverlay}>
                      <Text style={styles.guideName}>{country.name}</Text>
                      {content?.subtitle && (
                        <Text style={styles.guideSubtitle}>{content.subtitle}</Text>
                      )}
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noResults}>No destinations yet for this category</Text>
              )
            )}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}
```

With these styles (replace the entire `styles` block):

```typescript
const styles = StyleSheet.create({
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Tabs
  tabRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.background,
  },

  // Featured hero card
  featuredCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    height: 260,
    backgroundColor: colors.borderSubtle,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: colors.overlayDark,
  },
  featuredName: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  featuredSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },

  // Themed sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionScroll: {
    gap: spacing.md,
  },

  // Small horizontal cards
  smallCard: {
    width: SMALL_CARD_WIDTH,
  },
  smallCardImage: {
    width: SMALL_CARD_WIDTH,
    height: SMALL_CARD_WIDTH * 0.75,
    borderRadius: radius.card,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  smallCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  smallCardSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Standard country cards (reused from before, minus badges)
  guideCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    height: 200,
    backgroundColor: colors.borderSubtle,
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.overlayDark,
  },
  guideName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  guideSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Search results
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.md,
  },
  searchItemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchItemText: {
    flex: 1,
  },
  searchItemName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchItemParent: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  noResults: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
```

**Step 2: Verify the app compiles and renders**

Run: `npx expo start` and navigate to the Explore tab. Verify:
- Tabs render and are tappable
- Featured card is large and prominent
- Themed sections scroll horizontally
- Filtered tabs show correct countries
- Search still works
- No safety badges or solo-friendly tags appear

**Step 3: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: redesign Explore as curated magazine layout with tabs"
```

---

## Task 6: Redesign country page — replace safety rating with editorial portrait

**Files:**
- Modify: `app/(tabs)/explore/country/[slug].tsx`

**Step 1: Update the country page**

Changes:
1. Remove `formatSafetyRating` function
2. Replace the Safety fact with a "Best for" line (from `content.bestFor` or `content.goodForInterests`)
3. Add editorial portrait section below quick facts (from `content.portraitMd` or fallback to `content.safetyWomenMd`)
4. Move emergency numbers into a collapsible or de-emphasized position

Replace the quick facts grid and add the portrait:

```typescript
{/* Quick facts */}
<View style={styles.factsGrid}>
  <Fact icon="calendar-outline" label="Best time" value={content?.bestMonths ?? '—'} />
  <Fact icon="cash-outline" label="Currency" value={content?.currency ?? '—'} />
  <Fact icon="language-outline" label="Language" value={content?.language ?? '—'} />
  <Fact
    icon="heart-outline"
    label="Best for"
    value={content?.bestFor ?? content?.goodForInterests?.slice(0, 3).join(', ') ?? '—'}
  />
</View>

{/* Editorial portrait */}
{(content?.portraitMd || content?.safetyWomenMd) && (
  <>
    <Text style={styles.sectionTitle}>What it's like</Text>
    <Text style={styles.portraitText}>
      {content.portraitMd ?? content.safetyWomenMd}
    </Text>
  </>
)}
```

Add portrait text style:

```typescript
portraitText: {
  fontFamily: fonts.regular,
  fontSize: 15,
  lineHeight: 24,
  color: colors.textPrimary,
  marginBottom: spacing.xl,
},
```

**Step 2: Verify**

Navigate to a country page. Confirm:
- No safety rating displayed
- "Best for" line shows instead
- Editorial portrait renders below quick facts
- Emergency numbers still accessible at bottom

**Step 3: Commit**

```bash
git add app/(tabs)/explore/country/[slug].tsx
git commit -m "feat: replace safety rating with editorial portrait on country page"
```

---

## Task 7: Ensure Country → City → Neighborhood navigation structure

**Files:**
- Verify: `app/(tabs)/explore/place/[slug].tsx` (city page — already exists)
- Verify: `app/(tabs)/explore/country/[slug].tsx` (country → city navigation)

The current flow already works: Country → City (via `place/[slug]`) → Place detail. Neighborhoods (city_areas) are used as filter pills within the city page.

**Step 1: Verify the hierarchy is clear in UI**

The city page already shows area pills. The country page already shows city cards. No structural changes needed — the hierarchy exists. The only gap is that there's no dedicated neighborhood *page*, but neighborhoods are accessible as filters within city pages, which is the right UX for now.

**Step 2: Add a "Cities" section header improvement on country page**

The country page already has a "Cities" section. Ensure it says "Cities to explore" for better editorial feel:

Change in country/[slug].tsx:
```typescript
<Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Cities to explore</Text>
```

**Step 3: Commit**

```bash
git add app/(tabs)/explore/country/[slug].tsx
git commit -m "chore: improve cities section label on country page"
```

---

## Priority Checklist

### High Priority
- [x] Task 1: Supabase migration (destination_tags + portrait_md)
- [x] Task 4: Remove safety badges and solo-friendly from Explore
- [x] Task 5: Redesign Explore index with tabs + magazine layout
- [x] Task 6: Replace safety rating with editorial portrait on country page

### Medium Priority
- [x] Task 2: Seed destination tags for existing countries
- [x] Task 3: API functions for destination tags

### Low Priority
- [x] Task 7: Navigation hierarchy polish

---

## Supabase Schema Changes Summary

| Change | Type | Details |
|--------|------|---------|
| `destination_tags` table | New table | Entity-level tags for countries/cities/neighborhoods |
| `geo_content.portrait_md` | New column | Rich editorial narrative (replaces safety_women_md usage) |
| `geo_content.best_for` | New column | Short "what it's best for" line |

---

## Files Modified

| File | Change |
|------|--------|
| `supabase/migrations/00009_destination_tags.sql` | New migration |
| `supabase/migrations/00010_seed_destination_tags.sql` | New seed data |
| `data/types.ts` | Add DestinationTag interface, update GeoContent |
| `data/api.ts` | Add getDestinationTags, getCountriesByTag, getCountriesByTags |
| `app/(tabs)/explore/index.tsx` | Full redesign — tabs, sections, magazine layout |
| `app/(tabs)/explore/country/[slug].tsx` | Remove safety rating, add portrait, update facts |

---

## Test Plan (manual)

1. **Explore page loads** — Open the app, go to Explore tab. You should see tabs at the top and a large featured card below.
2. **Tabs work** — Tap "Beach & nature". The country list should filter. Tap "For you" to go back.
3. **No badges** — Confirm zero safety badges or "Solo-friendly" labels appear on any country card.
4. **Country page** — Tap a country. Quick facts should show: Best time, Currency, Language, Best for. No safety rating.
5. **Editorial portrait** — Below quick facts, a "What it's like" section should appear with the editorial narrative (if populated in Supabase).
6. **Cities navigation** — Scroll down to "Cities to explore" and tap a city. You should land on the city page with area pills and place cards.
7. **Search** — Go back to Explore, type a country or city name. Search results should still work and navigate correctly.
8. **Empty states** — Tap a filtered tab that has no matching countries. Should show "No destinations yet for this category" gracefully.
