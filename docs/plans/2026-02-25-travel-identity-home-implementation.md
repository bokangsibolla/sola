# Travel Identity & Smart Home Feed — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Home tab into a context-aware card feed, rebuild interests to connect to the tag system, replace FlagGrid with a continent-grouped Travel Map, and enforce username at signup.

**Architecture:** State-driven card engine on the Home tab, `profile_tags` junction table for interests, continent utility for travel map grouping, username field added to onboarding profile screen.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres + RLS), React Query, StyleSheet, react-native-svg (already installed)

**Design doc:** `docs/plans/2026-02-25-travel-identity-home-redesign.md`

---

## Task 1: Database Migration — `profile_tags` Table

**Files:**
- Create: `supabase/migrations/20260225_profile_tags.sql`

**Step 1: Write the migration**

```sql
-- Profile tags: connects user interests to the tag system
CREATE TABLE IF NOT EXISTS profile_tags (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_slug   text NOT NULL,
  tag_label  text NOT NULL,
  tag_group  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, tag_slug)
);

CREATE INDEX IF NOT EXISTS idx_profile_tags_slug ON profile_tags(tag_slug);
CREATE INDEX IF NOT EXISTS idx_profile_tags_group ON profile_tags(tag_group);

ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read (for profile viewing + matching)
CREATE POLICY "profile_tags_select"
  ON profile_tags FOR SELECT
  TO authenticated
  USING (true);

-- Only owner can manage their tags
CREATE POLICY "profile_tags_insert"
  ON profile_tags FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_tags_delete"
  ON profile_tags FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());
```

**Step 2: Apply the migration**

```bash
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
source .env
DB_URL="postgresql://postgres.bfyewxgdfkmkviajmfzp:${SUPABASE_DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260225_profile_tags.sql
```

Expected: `CREATE TABLE`, `CREATE INDEX` ×2, `CREATE POLICY` ×3

**Step 3: Commit**

```bash
git add supabase/migrations/20260225_profile_tags.sql
git commit -m "feat: add profile_tags table for interest system"
```

---

## Task 2: API Functions for Profile Tags

**Files:**
- Modify: `data/api.ts` — add `getProfileTags`, `setProfileTags`
- Modify: `data/types.ts` — add `ProfileTag` interface

**Step 1: Add ProfileTag type to `data/types.ts`**

Add after the existing `Tag` interface:

```typescript
export interface ProfileTag {
  profileId: string;
  tagSlug: string;
  tagLabel: string;
  tagGroup: string;
  createdAt: string;
}
```

**Step 2: Add API functions to `data/api.ts`**

Add near the existing profile functions (around line 2065):

```typescript
/** Fetch all profile tags for a user */
export async function getProfileTags(userId: string): Promise<ProfileTag[]> {
  const { data, error } = await supabase
    .from('profile_tags')
    .select('profile_id, tag_slug, tag_label, tag_group, created_at')
    .eq('profile_id', userId)
    .order('tag_group')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map((row) => ({
    profileId: row.profile_id,
    tagSlug: row.tag_slug,
    tagLabel: row.tag_label,
    tagGroup: row.tag_group,
    createdAt: row.created_at,
  }));
}

/** Replace all profile tags for the current user */
export async function setProfileTags(
  userId: string,
  tags: { tagSlug: string; tagLabel: string; tagGroup: string }[],
): Promise<void> {
  // Delete existing tags
  const { error: deleteError } = await supabase
    .from('profile_tags')
    .delete()
    .eq('profile_id', userId);

  if (deleteError) throw deleteError;

  if (tags.length === 0) return;

  // Insert new tags
  const rows = tags.map((t) => ({
    profile_id: userId,
    tag_slug: t.tagSlug,
    tag_label: t.tagLabel,
    tag_group: t.tagGroup,
  }));

  const { error: insertError } = await supabase
    .from('profile_tags')
    .insert(rows);

  if (insertError) throw insertError;
}
```

**Step 3: Add ProfileTag to the exports in `data/types.ts`**

Ensure `ProfileTag` is exported (it should be by virtue of being `export interface`).

**Step 4: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

Expected: No new errors.

**Step 5: Commit**

```bash
git add data/api.ts data/types.ts
git commit -m "feat: add getProfileTags and setProfileTags API functions"
```

---

## Task 3: Interest Data Constants + Continent Mapping Utility

**Files:**
- Create: `constants/interests.ts` — interest group definitions
- Create: `constants/continents.ts` — ISO2 → continent mapping

**Step 1: Create interest groups**

```typescript
// constants/interests.ts
export interface InterestOption {
  slug: string;
  label: string;
  group: string;
}

export interface InterestGroup {
  key: string;
  question: string;
  options: InterestOption[];
}

export const INTEREST_GROUPS: InterestGroup[] = [
  {
    key: 'travel_draw',
    question: 'What draws you to a place?',
    options: [
      { slug: 'history-culture', label: 'History & culture', group: 'travel_draw' },
      { slug: 'nature-outdoors', label: 'Nature & outdoors', group: 'travel_draw' },
      { slug: 'beach-coast', label: 'Beach & coast', group: 'travel_draw' },
      { slug: 'city-life', label: 'City life', group: 'travel_draw' },
      { slug: 'wellness-spiritual', label: 'Wellness & spiritual', group: 'travel_draw' },
      { slug: 'adventure-adrenaline', label: 'Adventure & adrenaline', group: 'travel_draw' },
      { slug: 'art-design', label: 'Art & design', group: 'travel_draw' },
      { slug: 'nightlife-social', label: 'Nightlife & social', group: 'travel_draw' },
    ],
  },
  {
    key: 'cuisine_pref',
    question: 'What do you love eating?',
    options: [
      { slug: 'street-food', label: 'Street food', group: 'cuisine_pref' },
      { slug: 'local-cuisine', label: 'Local cuisine', group: 'cuisine_pref' },
      { slug: 'fine-dining', label: 'Fine dining', group: 'cuisine_pref' },
      { slug: 'vegetarian-vegan', label: 'Vegetarian & vegan', group: 'cuisine_pref' },
      { slug: 'seafood', label: 'Seafood', group: 'cuisine_pref' },
      { slug: 'coffee-cafe', label: 'Coffee & cafe culture', group: 'cuisine_pref' },
      { slug: 'market-food', label: 'Market food', group: 'cuisine_pref' },
      { slug: 'cooking-classes', label: 'Cooking classes', group: 'cuisine_pref' },
    ],
  },
  {
    key: 'travel_vibe',
    question: 'Your travel vibe?',
    options: [
      { slug: 'slow-intentional', label: 'Slow & intentional', group: 'travel_vibe' },
      { slug: 'packed-itinerary', label: 'Packed itinerary', group: 'travel_vibe' },
      { slug: 'spontaneous', label: 'Spontaneous', group: 'travel_vibe' },
      { slug: 'photography-driven', label: 'Photography-driven', group: 'travel_vibe' },
      { slug: 'budget-backpacker', label: 'Budget backpacker', group: 'travel_vibe' },
      { slug: 'comfort-luxury', label: 'Comfort & luxury', group: 'travel_vibe' },
      { slug: 'solo-by-choice', label: 'Solo by choice', group: 'travel_vibe' },
      { slug: 'open-to-connections', label: 'Open to connections', group: 'travel_vibe' },
    ],
  },
];

/** Flat list of all interest options */
export const ALL_INTERESTS: InterestOption[] = INTEREST_GROUPS.flatMap((g) => g.options);

/** Map old text[] interest values to new slugs */
export const LEGACY_INTEREST_MAP: Record<string, string> = {
  '🏛️ History & culture': 'history-culture',
  '🌿 Being outdoors': 'nature-outdoors',
  '🍜 Trying the food': 'local-cuisine',
  '🌙 Going out at night': 'nightlife-social',
  '🧘 Rest & wellness': 'wellness-spiritual',
  '🧗 Adventure & sports': 'adventure-adrenaline',
  '🛍️ Shopping & markets': 'market-food',
  '🎨 Art & creativity': 'art-design',
};
```

**Step 2: Create continent mapping**

```typescript
// constants/continents.ts

/** Map ISO2 country code to a human-readable continent/region name */
export const CONTINENT_MAP: Record<string, string> = {
  // Southeast Asia
  TH: 'Southeast Asia', VN: 'Southeast Asia', KH: 'Southeast Asia',
  LA: 'Southeast Asia', MM: 'Southeast Asia', MY: 'Southeast Asia',
  SG: 'Southeast Asia', ID: 'Southeast Asia', PH: 'Southeast Asia',
  BN: 'Southeast Asia', TL: 'Southeast Asia',
  // East Asia
  JP: 'East Asia', KR: 'East Asia', CN: 'East Asia',
  TW: 'East Asia', MN: 'East Asia', HK: 'East Asia', MO: 'East Asia',
  // South Asia
  IN: 'South Asia', LK: 'South Asia', NP: 'South Asia',
  BD: 'South Asia', PK: 'South Asia', MV: 'South Asia', BT: 'South Asia',
  // Middle East
  AE: 'Middle East', TR: 'Middle East', IL: 'Middle East',
  JO: 'Middle East', OM: 'Middle East', QA: 'Middle East',
  SA: 'Middle East', LB: 'Middle East', BH: 'Middle East', KW: 'Middle East',
  // Europe
  PT: 'Europe', ES: 'Europe', FR: 'Europe', IT: 'Europe',
  DE: 'Europe', GB: 'Europe', NL: 'Europe', BE: 'Europe',
  AT: 'Europe', CH: 'Europe', GR: 'Europe', HR: 'Europe',
  CZ: 'Europe', PL: 'Europe', SE: 'Europe', NO: 'Europe',
  DK: 'Europe', FI: 'Europe', IE: 'Europe', HU: 'Europe',
  RO: 'Europe', BG: 'Europe', SK: 'Europe', SI: 'Europe',
  EE: 'Europe', LV: 'Europe', LT: 'Europe', IS: 'Europe',
  MT: 'Europe', CY: 'Europe', LU: 'Europe', ME: 'Europe',
  RS: 'Europe', BA: 'Europe', MK: 'Europe', AL: 'Europe',
  XK: 'Europe', MD: 'Europe', UA: 'Europe', BY: 'Europe',
  // Africa
  ZA: 'Africa', NA: 'Africa', TZ: 'Africa', KE: 'Africa',
  MA: 'Africa', EG: 'Africa', ET: 'Africa', GH: 'Africa',
  NG: 'Africa', SN: 'Africa', RW: 'Africa', UG: 'Africa',
  MZ: 'Africa', MU: 'Africa', MG: 'Africa', BW: 'Africa',
  ZM: 'Africa', ZW: 'Africa', CM: 'Africa', CI: 'Africa',
  TN: 'Africa', DZ: 'Africa', AO: 'Africa', CV: 'Africa',
  SC: 'Africa', RE: 'Africa',
  // North America
  US: 'North America', CA: 'North America', MX: 'North America',
  // Central America & Caribbean
  CR: 'Central America', PA: 'Central America', GT: 'Central America',
  BZ: 'Central America', HN: 'Central America', SV: 'Central America',
  NI: 'Central America', CU: 'Caribbean', JM: 'Caribbean',
  DO: 'Caribbean', HT: 'Caribbean', PR: 'Caribbean',
  TT: 'Caribbean', BB: 'Caribbean', BS: 'Caribbean',
  // South America
  BR: 'South America', AR: 'South America', CL: 'South America',
  CO: 'South America', PE: 'South America', EC: 'South America',
  BO: 'South America', UY: 'South America', PY: 'South America',
  VE: 'South America', GY: 'South America', SR: 'South America',
  // Oceania
  AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania', PG: 'Oceania',
  WS: 'Oceania', TO: 'Oceania', VU: 'Oceania', NC: 'Oceania',
  PF: 'Oceania',
  // Central Asia
  GE: 'Central Asia', AM: 'Central Asia', AZ: 'Central Asia',
  KZ: 'Central Asia', UZ: 'Central Asia', KG: 'Central Asia',
  TJ: 'Central Asia', TM: 'Central Asia',
};

/** Preferred continent display order */
export const CONTINENT_ORDER = [
  'Southeast Asia', 'East Asia', 'South Asia', 'Middle East',
  'Europe', 'Africa', 'North America', 'Central America', 'Caribbean',
  'South America', 'Oceania', 'Central Asia',
];

/** Get continent for an ISO2 code. Falls back to 'Other'. */
export function getContinent(iso2: string): string {
  return CONTINENT_MAP[iso2?.toUpperCase()] ?? 'Other';
}

/**
 * Group an array of ISO2 codes by continent.
 * Returns entries sorted by CONTINENT_ORDER.
 */
export function groupByContinent(
  iso2Codes: string[],
): { continent: string; countries: string[] }[] {
  const map = new Map<string, string[]>();

  for (const iso of iso2Codes) {
    const continent = getContinent(iso);
    const list = map.get(continent);
    if (list) {
      list.push(iso);
    } else {
      map.set(continent, [iso]);
    }
  }

  return CONTINENT_ORDER
    .filter((c) => map.has(c))
    .map((c) => ({ continent: c, countries: map.get(c)! }))
    .concat(
      map.has('Other') ? [{ continent: 'Other', countries: map.get('Other')! }] : [],
    );
}
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 4: Commit**

```bash
git add constants/interests.ts constants/continents.ts
git commit -m "feat: add interest groups and continent mapping constants"
```

---

## Task 4: InterestPicker Component

Shared between onboarding and edit-profile. Full-screen grouped chip picker.

**Files:**
- Create: `components/profile/InterestPicker.tsx`

**Step 1: Build the component**

```typescript
// components/profile/InterestPicker.tsx
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { INTEREST_GROUPS, type InterestOption } from '@/constants/interests';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface InterestPickerProps {
  /** Currently selected tag slugs */
  selected: string[];
  /** Called when selection changes */
  onChange: (slugs: string[]) => void;
  /** If true, renders compact (no questions, just chips). Default false. */
  compact?: boolean;
}

export function InterestPicker({ selected, onChange, compact }: InterestPickerProps) {
  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <View style={styles.container}>
      {INTEREST_GROUPS.map((group) => (
        <View key={group.key} style={styles.group}>
          {!compact && (
            <Text style={styles.question}>{group.question}</Text>
          )}
          <View style={styles.chipGrid}>
            {group.options.map((option) => {
              const isSelected = selected.includes(option.slug);
              return (
                <Pressable
                  key={option.slug}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggle(option.slug)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  question: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.orange,
  },
});
```

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 3: Commit**

```bash
git add components/profile/InterestPicker.tsx
git commit -m "feat: add InterestPicker component with grouped chips"
```

---

## Task 5: TravelMap Component (Continent-Grouped List)

Replaces FlagGrid on the profile page. Shows countries grouped by continent.

**Files:**
- Create: `components/profile/TravelMap.tsx`

**Step 1: Build the component**

```typescript
// components/profile/TravelMap.tsx
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { groupByContinent } from '@/constants/continents';
import { getFlag } from '@/data/trips/helpers';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface TravelMapProps {
  /** ISO2 country codes */
  countries: string[];
  /** Show "Add a country" link at bottom */
  onAddCountry?: () => void;
}

export function TravelMap({ countries, onAddCountry }: TravelMapProps) {
  const [expanded, setExpanded] = useState(false);

  if (countries.length === 0) return null;

  const grouped = groupByContinent(countries);
  const continentCount = grouped.length;

  return (
    <View>
      {/* Summary card — always visible */}
      <Pressable
        style={styles.summaryCard}
        onPress={() => setExpanded(!expanded)}
      >
        {/* Flag preview row */}
        <View style={styles.flagPreview}>
          {countries.slice(0, 8).map((iso) => (
            <Text key={iso} style={styles.previewFlag}>{getFlag(iso)}</Text>
          ))}
          {countries.length > 8 && (
            <Text style={styles.moreCount}>+{countries.length - 8}</Text>
          )}
        </View>
        <Text style={styles.statLine}>
          {countries.length} {countries.length === 1 ? 'country' : 'countries'} · {continentCount} {continentCount === 1 ? 'continent' : 'continents'}
        </Text>
      </Pressable>

      {/* Expanded continent list */}
      {expanded && (
        <View style={styles.expandedList}>
          {grouped.map(({ continent, countries: codes }) => (
            <View key={continent} style={styles.continentSection}>
              <Text style={styles.continentTitle}>
                {continent} ({codes.length})
              </Text>
              <View style={styles.countryRow}>
                {codes.map((iso, i) => (
                  <Text key={iso} style={styles.countryItem}>
                    {getFlag(iso)}{i < codes.length - 1 ? '  ·  ' : ''}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          {onAddCountry && (
            <Pressable onPress={onAddCountry} style={styles.addLink}>
              <Text style={styles.addLinkText}>+ Add a country</Text>
            </Pressable>
          )}

          <Pressable onPress={() => setExpanded(false)}>
            <Text style={styles.collapseText}>Show less</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  flagPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  previewFlag: {
    fontSize: 28,
  },
  moreCount: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  statLine: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  expandedList: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  continentSection: {
    gap: spacing.xs,
  },
  continentTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  countryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  countryItem: {
    fontSize: 22,
    lineHeight: 32,
  },
  addLink: {
    paddingVertical: spacing.sm,
  },
  addLinkText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  collapseText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
```

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 3: Commit**

```bash
git add components/profile/TravelMap.tsx
git commit -m "feat: add TravelMap component with continent grouping"
```

---

## Task 6: InterestPills Display Component

Display-only pills for the profile page, grouped by category with shared interest highlighting.

**Files:**
- Create: `components/profile/InterestPills.tsx`

**Step 1: Build the component**

```typescript
// components/profile/InterestPills.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { INTEREST_GROUPS } from '@/constants/interests';
import type { ProfileTag } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface InterestPillsProps {
  tags: ProfileTag[];
  /** Slugs of the viewer's interests — shared ones get highlighted */
  viewerTagSlugs?: string[];
}

export function InterestPills({ tags, viewerTagSlugs }: InterestPillsProps) {
  if (tags.length === 0) return null;

  // Group tags by their group key
  const grouped = INTEREST_GROUPS
    .map((group) => ({
      ...group,
      tags: tags.filter((t) => t.tagGroup === group.key),
    }))
    .filter((g) => g.tags.length > 0);

  return (
    <View style={styles.container}>
      {grouped.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupLabel}>{group.question.replace('?', '')}</Text>
          <View style={styles.pillRow}>
            {group.tags.map((tag) => {
              const isShared = viewerTagSlugs?.includes(tag.tagSlug);
              return (
                <View
                  key={tag.tagSlug}
                  style={[styles.pill, isShared && styles.pillShared]}
                >
                  <Text style={[styles.pillText, isShared && styles.pillTextShared]}>
                    {tag.tagLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralFill,
  },
  pillShared: {
    backgroundColor: colors.orangeFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextShared: {
    color: colors.orange,
  },
});
```

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 3: Commit**

```bash
git add components/profile/InterestPills.tsx
git commit -m "feat: add InterestPills display component with shared highlighting"
```

---

## Task 7: Update Profile Page — TravelMap + InterestPills

Replace FlagGrid with TravelMap and flat interests chips with InterestPills on the profile page.

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx`
- Modify: `data/travelers/useTravelerProfile.ts` — add profile tags fetching

**Step 1: Add profile tags to the traveler profile hook**

In `data/travelers/useTravelerProfile.ts`, add:
- Import `getProfileTags` from `@/data/api`
- Import `ProfileTag` from `@/data/types`
- Add a `useData` call for `getProfileTags(id)`
- Return `profileTags` in the hook result

**Step 2: Update profile page imports**

In `app/(tabs)/travelers/user/[id].tsx`:
- Replace `import { FlagGrid } from '@/components/profile/FlagGrid'` with `import { TravelMap } from '@/components/profile/TravelMap'`
- Add `import { InterestPills } from '@/components/profile/InterestPills'`
- Add `import { getProfileTags } from '@/data/api'`

**Step 3: Replace FlagGrid usage**

Find the Countries Visited section (around line 400–420) and replace:
```jsx
<FlagGrid countries={allCountryIso2s} />
```
with:
```jsx
<TravelMap
  countries={allCountryIso2s}
  onAddCountry={isOwn ? () => router.push('/(tabs)/home/edit-profile') : undefined}
/>
```

**Step 4: Replace interests display**

Find the Interests section and replace the flat chip rendering with:
```jsx
<InterestPills
  tags={profileTags}
  viewerTagSlugs={isOwn ? undefined : viewerProfileTagSlugs}
/>
```

Where `profileTags` comes from the updated hook, and `viewerProfileTagSlugs` is fetched for the viewing user (to highlight shared interests).

**Step 5: Fetch viewer's profile tags for shared highlighting**

Add a `useData` call for the current user's profile tags when viewing someone else's profile:
```typescript
const { data: viewerTags } = useData(
  () => (!isOwn && userId ? getProfileTags(userId) : Promise.resolve([])),
  [isOwn, userId],
);
const viewerProfileTagSlugs = (viewerTags ?? []).map((t) => t.tagSlug);
```

**Step 6: Handle backward compatibility**

If `profileTags` is empty but the profile has legacy `interests` array, show the old-style flat chips as fallback (the existing rendering). This ensures profiles that haven't migrated still display something.

**Step 7: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 8: Commit**

```bash
git add 'app/(tabs)/travelers/user/[id].tsx' data/travelers/useTravelerProfile.ts
git commit -m "feat: replace FlagGrid with TravelMap and add InterestPills on profile"
```

---

## Task 8: Update Edit Profile — InterestPicker + profile_tags

Replace the hardcoded 8-pill interests section in edit-profile with InterestPicker backed by `profile_tags`.

**Files:**
- Modify: `app/(tabs)/home/edit-profile.tsx`

**Step 1: Add imports**

```typescript
import { InterestPicker } from '@/components/profile/InterestPicker';
import { getProfileTags, setProfileTags } from '@/data/api';
import { ALL_INTERESTS } from '@/constants/interests';
```

**Step 2: Add profile tags state**

Replace the current `interests` state (which is a `string[]` of labels) with:
```typescript
const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
```

Fetch initial tags in useEffect or useData:
```typescript
const { data: existingTags } = useData(
  () => (userId ? getProfileTags(userId) : Promise.resolve([])),
  [userId],
);

useEffect(() => {
  if (existingTags && existingTags.length > 0) {
    setSelectedTagSlugs(existingTags.map((t) => t.tagSlug));
  }
}, [existingTags]);
```

**Step 3: Replace the interests pill grid**

Find the current 8-option interest pills section and replace with:
```jsx
<InterestPicker
  selected={selectedTagSlugs}
  onChange={setSelectedTagSlugs}
/>
```

**Step 4: Update the save handler**

In the save function, after updating the profile, also save profile tags:
```typescript
// Save profile tags
const tagsToSave = selectedTagSlugs.map((slug) => {
  const option = ALL_INTERESTS.find((o) => o.slug === slug);
  return {
    tagSlug: slug,
    tagLabel: option?.label ?? slug,
    tagGroup: option?.group ?? '',
  };
});
await setProfileTags(userId, tagsToSave);
```

Remove the old `interests` field from the profile upsert payload (or keep it for backward compat but stop reading from it).

**Step 5: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 6: Commit**

```bash
git add 'app/(tabs)/home/edit-profile.tsx'
git commit -m "feat: wire InterestPicker into edit-profile with profile_tags backend"
```

---

## Task 9: Onboarding — Add Username + Save Interests to DB

Fix two bugs: username is never collected, and interests are never saved to the database.

**Files:**
- Modify: `app/(onboarding)/profile.tsx` — add username field
- Modify: `app/(onboarding)/day-style.tsx` — use new interest groups
- Modify: `app/(onboarding)/youre-in.tsx` — save username + interests to DB
- Modify: `state/onboardingStore.ts` — add `username` field

**Step 1: Add `username` to onboarding store**

In `state/onboardingStore.ts`, add `username: ''` to the `OnboardingData` interface and defaults.

**Step 2: Add username field to profile.tsx**

After the "First name" field, add a username input:
- Auto-generate suggestion from first name when firstName changes (lowercase + 3-digit random suffix)
- Show inline validation: idle → checking → available ✓ → taken (suggest alternative)
- Use existing `validateUsernameFormat` and `checkUsernameAvailability` from `data/api`
- Add `username` to `canContinue` check: `username.trim().length >= 3 && usernameStatus === 'available'`
- Store in `onboardingStore.set('username', username)` on continue

**Step 3: Rebuild day-style.tsx with new interest groups**

Replace the hardcoded INTERESTS and PRIORITIES arrays with imports from `constants/interests.ts`:
```typescript
import { INTEREST_GROUPS } from '@/constants/interests';
```

Render three grouped sections instead of two. Remove the "pick up to 2" limit — allow unlimited selection. Store selected slugs (not emoji labels) in `onboardingStore.set('dayStyle', selectedSlugs)`.

**Step 4: Update youre-in.tsx to save username + interests**

In the `handleFinish` function, add to the profile upsert:
```typescript
username: data.username || null,
```

After the profile upsert, save interests to `profile_tags`:
```typescript
const dayStyleSlugs = data.dayStyle; // now slug strings
if (dayStyleSlugs.length > 0) {
  const tags = dayStyleSlugs.map((slug) => {
    const option = ALL_INTERESTS.find((o) => o.slug === slug);
    return {
      tagSlug: slug,
      tagLabel: option?.label ?? slug,
      tagGroup: option?.group ?? '',
    };
  });
  await setProfileTags(activeUserId, tags).catch(() => {
    // Don't block onboarding if tags fail
  });
}
```

**Step 5: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 6: Commit**

```bash
git add 'app/(onboarding)/profile.tsx' 'app/(onboarding)/day-style.tsx' 'app/(onboarding)/youre-in.tsx' state/onboardingStore.ts
git commit -m "feat: collect username in onboarding and save interests to profile_tags"
```

---

## Task 10: Card Engine — User State Detection + Feed Assembly

The core state machine that drives the Home feed.

**Files:**
- Create: `data/home/cardEngine.ts` — state detection + card definitions
- Create: `data/home/useCardFeed.ts` — hook that assembles the feed

**Step 1: Create card engine**

```typescript
// data/home/cardEngine.ts
import type { TripWithStops } from '@/data/trips/types';
import type { Profile } from '@/data/types';

export type UserState = 'new' | 'planning' | 'traveling' | 'returned' | 'idle';

export type CardType =
  | 'active_trip'
  | 'upcoming_trip'
  | 'trip_recap'
  | 'travel_map'
  | 'profile_progress'
  | 'stats_snapshot'
  | 'recommended_city'
  | 'activity_spotlight'
  | 'collection'
  | 'trending_thread'
  | 'destination_thread'
  | 'avatar_nudge'
  | 'interests_nudge'
  | 'first_trip_nudge'
  | 'verification_nudge';

export interface FeedCard {
  type: CardType;
  key: string;
  data?: any;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUserState(profile: Profile, trips: TripWithStops[]): UserState {
  const now = new Date();
  const signupDate = new Date(profile.createdAt);
  const daysSinceSignup = diffDays(now, signupDate);

  const activeTrip = trips.find((t) => t.status === 'active');
  if (activeTrip) return 'traveling';

  const recentCompleted = trips.find(
    (t) =>
      t.status === 'completed' &&
      t.leaving &&
      diffDays(now, new Date(t.leaving)) <= 14,
  );
  if (recentCompleted) return 'returned';

  const plannedTrip = trips.find((t) => t.status === 'planned');
  if (plannedTrip) return 'planning';

  if (daysSinceSignup <= 7 && trips.length === 0) return 'new';

  return 'idle';
}
```

**Step 2: Create `useCardFeed` hook**

```typescript
// data/home/useCardFeed.ts
import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { getProfileById, getProfileTags } from '@/data/api';
import { getTripsGrouped } from '@/data/trips/tripApi';
import { getUserState, type FeedCard, type UserState } from './cardEngine';

export function useCardFeed() {
  const { userId } = useAuth();

  const { data: profile, loading: profileLoading } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(undefined)),
    [userId],
  );

  const { data: grouped, loading: tripsLoading, refetch: refetchTrips } = useData(
    () => (userId ? getTripsGrouped(userId) : Promise.resolve(null)),
    [userId],
  );

  const { data: profileTags } = useData(
    () => (userId ? getProfileTags(userId) : Promise.resolve([])),
    [userId],
  );

  const allTrips = useMemo(() => {
    if (!grouped) return [];
    const trips = [];
    if (grouped.current) trips.push(grouped.current);
    trips.push(...(grouped.upcoming ?? []));
    trips.push(...(grouped.past ?? []));
    return trips;
  }, [grouped]);

  const userState: UserState = useMemo(
    () => (profile ? getUserState(profile, allTrips) : 'new'),
    [profile, allTrips],
  );

  const cards: FeedCard[] = useMemo(() => {
    if (!profile) return [];
    return assembleCards(userState, profile, allTrips, grouped, profileTags ?? []);
  }, [userState, profile, allTrips, grouped, profileTags]);

  const loading = profileLoading || tripsLoading;

  return { cards, userState, loading, refetch: refetchTrips };
}

function assembleCards(
  state: UserState,
  profile: any,
  allTrips: any[],
  grouped: any,
  profileTags: any[],
): FeedCard[] {
  const cards: FeedCard[] = [];

  // Identity cards based on profile completeness
  const hasAvatar = !!profile.avatarUrl;
  const hasInterests = profileTags.length > 0;
  const hasBio = !!profile.bio;

  // State-specific cards
  switch (state) {
    case 'new':
      if (!hasAvatar || !hasInterests || !hasBio) {
        cards.push({ type: 'profile_progress', key: 'profile_progress', data: { hasAvatar, hasInterests, hasBio } });
      }
      if (!hasAvatar) cards.push({ type: 'avatar_nudge', key: 'avatar_nudge' });
      if (!hasInterests) cards.push({ type: 'interests_nudge', key: 'interests_nudge' });
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      cards.push({ type: 'collection', key: 'collection_1' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'first_trip_nudge', key: 'first_trip_nudge' });
      break;

    case 'planning': {
      const upcoming = grouped?.upcoming?.[0] ?? grouped?.current;
      if (upcoming) cards.push({ type: 'upcoming_trip', key: 'upcoming_trip', data: upcoming });
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'collection', key: 'collection_1' });
      break;
    }

    case 'traveling': {
      if (grouped?.current) cards.push({ type: 'active_trip', key: 'active_trip', data: grouped.current });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      break;
    }

    case 'returned': {
      const recent = allTrips.find((t) => t.status === 'completed');
      if (recent) cards.push({ type: 'trip_recap', key: 'trip_recap', data: recent });
      cards.push({ type: 'stats_snapshot', key: 'stats', data: { tripCount: allTrips.length } });
      cards.push({ type: 'travel_map', key: 'travel_map' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      break;
    }

    case 'idle':
    default:
      cards.push({ type: 'travel_map', key: 'travel_map' });
      cards.push({ type: 'stats_snapshot', key: 'stats', data: { tripCount: allTrips.length } });
      cards.push({ type: 'recommended_city', key: 'rec_city_1' });
      cards.push({ type: 'recommended_city', key: 'rec_city_2' });
      cards.push({ type: 'collection', key: 'collection_1' });
      cards.push({ type: 'trending_thread', key: 'trending_1' });
      // Rotate nudges
      if (!hasAvatar) cards.push({ type: 'avatar_nudge', key: 'avatar_nudge' });
      else if (!hasInterests) cards.push({ type: 'interests_nudge', key: 'interests_nudge' });
      break;
  }

  // Enforce max 8 cards
  return cards.slice(0, 8);
}
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 4: Commit**

```bash
git add data/home/cardEngine.ts data/home/useCardFeed.ts
git commit -m "feat: add card engine with user state detection and feed assembly"
```

---

## Task 11: Home Feed Card Components

Build the card components rendered by the card engine.

**Files:**
- Create: `components/home/cards/TripCard.tsx` — active/upcoming/recap trip card
- Create: `components/home/cards/TravelMapCard.tsx` — compact travel map for home
- Create: `components/home/cards/StatsCard.tsx` — stats snapshot
- Create: `components/home/cards/ProfileProgressCard.tsx` — completeness card
- Create: `components/home/cards/NudgeCard.tsx` — generic nudge card (interests, first trip)
- Create: `components/home/cards/CommunityCard.tsx` — trending thread card
- Create: `components/home/cards/DiscoveryCard.tsx` — recommended city card

**Design rules for all cards (from design doc Section 7):**
- All use `radius.cardLg` (16px)
- Image cards: full-bleed + LinearGradient overlay
- Text cards: `neutralFill` or `orangeFill` background
- Press state: `pressedState` from design tokens
- Card spacing handled by parent (not internal margin)

**Step 1: Create each card component**

Each card is a self-contained component that receives its data as props and renders with the shared visual system. Key card implementations:

**TripCard** — shows cover image, destination, date/countdown, status. Taps to trip detail. Three modes via `variant` prop: `'active' | 'upcoming' | 'recap'`.

**TravelMapCard** — compact version: flag preview row + stat line ("12 countries · 3 continents"). Taps to profile. Uses `groupByContinent` from `constants/continents.ts`.

**StatsCard** — neutralFill background, centered stat text: "12 countries · 8 trips". Clean typography only.

**ProfileProgressCard** — orangeFill background, progress text ("Complete your profile"), lists missing items (avatar, bio, interests), CTA to edit-profile.

**NudgeCard** — generic orangeFill card with title, subtitle, optional action. Dismissible via AsyncStorage (7-day cycle, same pattern as `AvatarNudge`).

**CommunityCard** — neutralFill background, thread title, reply count, author name. Taps to thread.

**DiscoveryCard** — full-bleed city hero image + gradient, city name + country, solo rating pill. Taps to city page.

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 3: Commit**

```bash
git add components/home/cards/
git commit -m "feat: add card components for Home feed (trip, map, stats, nudge, discovery, community)"
```

---

## Task 12: Rebuild Home Tab with Card Feed

Wire the card engine into the Home tab, replacing the current static layout.

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Add card feed hook**

Replace `useHomeData` with `useCardFeed`:
```typescript
import { useCardFeed } from '@/data/home/useCardFeed';
```

**Step 2: Build a card renderer**

```typescript
function renderCard(card: FeedCard): React.ReactElement | null {
  switch (card.type) {
    case 'active_trip':
    case 'upcoming_trip':
    case 'trip_recap':
      return <HomeTripCard key={card.key} trip={card.data} variant={card.type.replace('_trip', '') as any} />;
    case 'travel_map':
      return <TravelMapCard key={card.key} />;
    case 'stats_snapshot':
      return <StatsCard key={card.key} {...card.data} />;
    case 'profile_progress':
      return <ProfileProgressCard key={card.key} {...card.data} />;
    case 'avatar_nudge':
      return <AvatarNudge key={card.key} />;
    case 'interests_nudge':
    case 'first_trip_nudge':
      return <NudgeCard key={card.key} type={card.type} />;
    case 'recommended_city':
      return <DiscoveryCard key={card.key} />;
    case 'trending_thread':
      return <CommunityCard key={card.key} />;
    case 'collection':
      return <DiscoveryCard key={card.key} variant="collection" />;
    case 'verification_nudge':
      return <VerificationNudge key={card.key} />;
    default:
      return null;
  }
}
```

**Step 3: Replace ScrollView contents**

Keep the NavigationHeader, replace the ScrollView body:
```jsx
<ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.scrollContent}
  refreshControl={...}
>
  <VerificationNudge />
  {cards.map((card) => (
    <View key={card.key} style={styles.cardWrapper}>
      {renderCard(card)}
    </View>
  ))}
</ScrollView>
```

Keep `VerificationNudge` as always-first (it self-hides when not needed). The card engine handles everything else.

**Step 4: Clean up old imports**

Remove unused imports: `HeroModule`, `ForYouRow`, `CommunityBannerCard`, `TripModeCard` (these are now handled by card components). Keep `HomeSkeleton` for loading state.

**Step 5: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 6: Test on device**

```bash
npx expo start --dev-client
```

Verify:
- Home feed renders different cards based on user state
- Pull-to-refresh rebuilds the feed
- All card taps navigate correctly
- Nudge cards dismiss and reappear after 7 days

**Step 7: Commit**

```bash
git add 'app/(tabs)/home/index.tsx'
git commit -m "feat: rebuild Home tab with card engine feed"
```

---

## Task 13: TypeScript Check + Final Cleanup

**Files:**
- Various — fix any remaining type errors

**Step 1: Full type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

**Step 2: Fix any errors**

Address all new errors. Common issues:
- Missing imports
- Type mismatches between card data and component props
- Unused imports from removed components

**Step 3: Verify no regressions on other tabs**

Check that Discover, Trips, Travelers tabs still work — we should not have touched their code.

**Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: resolve TypeScript errors from travel identity implementation"
```
