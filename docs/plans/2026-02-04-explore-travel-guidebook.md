# Explore Page: Travel Guidebook Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Explore page into a premium travel guidebook/inspiration board that feels editorial, clean, and uses Sola's orange brand color as an accent throughout.

**Architecture:** Replace the current utilitarian grid layout with a magazine-style layout featuring editorial typography, strategic orange accents, varied card sizes, and curated sections. Add inbox button to header since Explore is now the home screen. Remove visual clutter and create breathing room.

**Tech Stack:** React Native, Expo Router, Supabase, existing design system (`constants/design.ts`)

---

## Design Principles

1. **Editorial feel** - Like flipping through a beautiful travel magazine, not scrolling a database
2. **Strategic orange** - Use `colors.orange` and `colors.orangeFill` as accents, not decoration
3. **Breathing room** - More whitespace, less density
4. **Typography hierarchy** - Clear visual hierarchy with serif headlines for sections
5. **Varied rhythm** - Mix of card sizes creates visual interest
6. **Premium touches** - Subtle shadows, refined corners, considered spacing

---

### Task 1: Add Inbox Button to Explore Header

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Add inbox button to AppHeader**

Update the explore screen to include the inbox button (same as Home screen):

```tsx
// app/(tabs)/explore/index.tsx
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { colors, spacing } from '@/constants/design';
import { IconTabs } from '@/components/explore';
import { CountriesTab, PlacesTab, ActivitiesTab } from '@/components/explore/tabs';

// ... rest of imports and types stay same

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [selectedTab, setSelectedTab] = useState<SegmentKey>('countries');

  // ... handlers stay same

  return (
    <AppScreen style={styles.screen}>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        }
        rightComponent={
          <Pressable
            onPress={() => {
              posthog.capture('inbox_opened');
              router.push('/home/dm');
            }}
            hitSlop={12}
            style={styles.inboxBtn}
          >
            <Feather name="message-circle" size={20} color={colors.orange} />
          </Pressable>
        }
      />
      {/* rest stays same */}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  logo: {
    height: 30,
    width: 90,
  },
  inboxBtn: {
    backgroundColor: colors.orangeFill,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flex: 1,
  },
});
```

**Step 2: Test**

Run app, verify inbox button appears in header and navigates to DM screen.

**Step 3: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: add inbox button to explore header"
```

---

### Task 2: Add Orange Accent to Selected Tab

**Files:**
- Modify: `components/explore/IconTabs.tsx`

**Step 1: Update IconTabs with orange underline**

Change the selected state to use orange for the underline and icon:

```tsx
// components/explore/IconTabs.tsx
// ... imports stay same

export default function IconTabs({ tabs, selectedKey, onSelect }: IconTabsProps) {
  // ... animation code stays same

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = tab.key === selectedKey;

        return (
          <Animated.View
            key={tab.key}
            style={[styles.tabWrapper, { transform: [{ scale: scales[index] }] }]}
          >
            <Pressable
              style={styles.tab}
              onPress={() => onSelect(tab.key)}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <Ionicons
                  name={tab.icon}
                  size={22}
                  color={isSelected ? colors.orange : colors.textMuted}
                />
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {tab.label}
              </Text>
              {isSelected && <View style={styles.underline} />}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerSelected: {
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  labelSelected: {
    color: colors.orange,
    fontFamily: fonts.semiBold,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
});
```

**Step 2: Test**

Run app, verify selected tab has orange icon in orangeFill circle, orange text, orange underline.

**Step 3: Commit**

```bash
git add components/explore/IconTabs.tsx
git commit -m "feat: add orange accent to selected tab"
```

---

### Task 3: Create Editorial Section Header

**Files:**
- Modify: `components/explore/SectionHeader.tsx`

**Step 1: Update SectionHeader with serif font and orange accent**

Create a more editorial feel with serif font option:

```tsx
// components/explore/SectionHeader.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  variant?: 'default' | 'editorial';
}

export default function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  variant = 'default',
}: SectionHeaderProps) {
  const isEditorial = variant === 'editorial';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isEditorial && styles.titleEditorial]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {onSeeAll && (
        <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.orange} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  titleEditorial: {
    fontFamily: fonts.serif,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
  seeAllText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
```

**Step 2: Test**

Run app, verify section headers look cleaner with "See all" text link in orange.

**Step 3: Commit**

```bash
git add components/explore/SectionHeader.tsx
git commit -m "feat: update section header with orange see-all link"
```

---

### Task 4: Add Orange Accent to Featured Card Badge

**Files:**
- Modify: `components/explore/FeaturedCard.tsx`

**Step 1: Update FeaturedCard with orange badge option**

Add option for orange-tinted badge for featured items:

```tsx
// components/explore/FeaturedCard.tsx
// Update badge styles and add premium feel

// In the FeaturedCardProps interface, add:
interface FeaturedCardProps {
  imageUrl: string;
  title: string;
  blurb?: string | null;
  badge?: string | null;
  badgeVariant?: 'default' | 'highlight';
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
}

// In the component, update badge rendering:
{badge && badge.trim().length > 0 && (
  <View style={[
    styles.badge,
    badgeVariant === 'highlight' && styles.badgeHighlight
  ]}>
    <Text style={[
      styles.badgeText,
      badgeVariant === 'highlight' && styles.badgeTextHighlight
    ]}>
      {badge}
    </Text>
  </View>
)}

// Update styles:
const styles = StyleSheet.create({
  // ... existing styles
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  badgeHighlight: {
    backgroundColor: colors.orange,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textPrimary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  badgeTextHighlight: {
    color: '#FFFFFF',
  },
  // ... rest of styles
});
```

**Step 2: Test**

Run app, pass `badgeVariant="highlight"` to a FeaturedCard to see orange badge.

**Step 3: Commit**

```bash
git add components/explore/FeaturedCard.tsx
git commit -m "feat: add orange badge variant to featured card"
```

---

### Task 5: Add Orange Accent to GridCard

**Files:**
- Modify: `components/explore/GridCard.tsx`

**Step 1: Update GridCard with subtle orange touches**

Add orange accent when favorited and for highlighted badges:

```tsx
// components/explore/GridCard.tsx

// In styles, update favoriteButton for when favorited:
favoriteButton: {
  position: 'absolute',
  top: spacing.sm,
  right: spacing.sm,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  alignItems: 'center',
  justifyContent: 'center',
},
favoriteButtonActive: {
  backgroundColor: colors.orangeFill,
},

// In the component, apply conditional style:
<Pressable
  style={[
    styles.favoriteButton,
    localFavorited && styles.favoriteButtonActive
  ]}
  onPress={handleFavoritePress}
>
  <Ionicons
    name={localFavorited ? 'heart' : 'heart-outline'}
    size={16}
    color={localFavorited ? colors.orange : colors.textMuted}
  />
</Pressable>
```

**Step 2: Test**

Run app, favorite a card, verify orange fill appears behind heart.

**Step 3: Commit**

```bash
git add components/explore/GridCard.tsx
git commit -m "feat: add orange accent to favorited grid cards"
```

---

### Task 6: Create Welcome/Inspiration Header

**Files:**
- Create: `components/explore/WelcomeHeader.tsx`
- Modify: `components/explore/index.ts`

**Step 1: Create WelcomeHeader component**

Add an editorial welcome header for the top of each tab:

```tsx
// components/explore/WelcomeHeader.tsx
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface WelcomeHeaderProps {
  title: string;
  subtitle?: string;
}

export default function WelcomeHeader({ title, subtitle }: WelcomeHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  accent: {
    width: 40,
    height: 3,
    backgroundColor: colors.orange,
    borderRadius: 2,
    marginTop: spacing.md,
  },
});
```

**Step 2: Export from index**

```tsx
// components/explore/index.ts
// Add export:
export { default as WelcomeHeader } from './WelcomeHeader';
```

**Step 3: Commit**

```bash
git add components/explore/WelcomeHeader.tsx components/explore/index.ts
git commit -m "feat: create welcome header component with orange accent"
```

---

### Task 7: Update CountriesTab with Editorial Layout

**Files:**
- Modify: `components/explore/tabs/CountriesTab.tsx`

**Step 1: Add WelcomeHeader and refine layout**

```tsx
// components/explore/tabs/CountriesTab.tsx
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FeaturedCard, GridCard, SectionHeader, WelcomeHeader, GRID_GAP } from '@/components/explore';
// ... rest of imports

export default function CountriesTab({ onNavigateToSeeAll }: CountriesTabProps) {
  // ... data fetching stays same

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Editorial welcome */}
      <WelcomeHeader
        title="Where to next?"
        subtitle="Curated destinations for solo women travelers"
      />

      {/* Featured country */}
      <FeaturedCard
        imageUrl={featured.heroImageUrl || '...'}
        title={featured.name}
        blurb={featured.blurb}
        badge={featured.badgeLabel}
        badgeVariant={featured.isFeatured ? 'highlight' : 'default'}
        onPress={() => handleCountryPress(featured)}
      />

      {/* Grid with editorial header */}
      {gridCountries.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Explore countries"
            onSeeAll={() => onNavigateToSeeAll('all-countries', 'All Countries')}
          />
          <View style={styles.grid}>
            {/* ... grid cards */}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxxl,
  },
  section: {
    marginTop: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenX,
    gap: GRID_GAP,
  },
  // ... rest
});
```

**Step 2: Test**

Run app, verify Countries tab has editorial welcome header with orange accent bar.

**Step 3: Commit**

```bash
git add components/explore/tabs/CountriesTab.tsx
git commit -m "feat: add editorial layout to countries tab"
```

---

### Task 8: Update PlacesTab with Editorial Layout

**Files:**
- Modify: `components/explore/tabs/PlacesTab.tsx`

**Step 1: Add WelcomeHeader**

Same pattern as CountriesTab:

```tsx
<WelcomeHeader
  title="Discover places"
  subtitle="Cities, islands, and hidden gems waiting for you"
/>
```

**Step 2: Commit**

```bash
git add components/explore/tabs/PlacesTab.tsx
git commit -m "feat: add editorial layout to places tab"
```

---

### Task 9: Update ActivitiesTab with Editorial Layout

**Files:**
- Modify: `components/explore/tabs/ActivitiesTab.tsx`

**Step 1: Add WelcomeHeader**

```tsx
<WelcomeHeader
  title="Things to do"
  subtitle="Experiences curated for solo adventurers"
/>
```

**Step 2: Commit**

```bash
git add components/explore/tabs/ActivitiesTab.tsx
git commit -m "feat: add editorial layout to activities tab"
```

---

### Task 10: Final Polish - Spacing and Typography

**Files:**
- Modify: `components/explore/FeaturedCard.tsx`
- Modify: `components/explore/GridCard.tsx`

**Step 1: Refine card spacing and shadows**

Update FeaturedCard:
```tsx
// Increase card height for more impact
const CARD_HEIGHT = 220;

// Add subtle shadow
imageContainer: {
  // ... existing
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 4,
},
```

Update GridCard:
```tsx
// Softer corners, refined spacing
imageContainer: {
  // ...
  borderRadius: 14,
},
contentContainer: {
  paddingTop: spacing.sm,
  paddingBottom: spacing.md,
},
```

**Step 2: Test entire flow**

1. Open app fresh
2. Land on Explore (verify it's default)
3. See inbox button in header (tap to verify navigation)
4. See orange accents in tabs
5. See editorial welcome headers
6. See orange "See all" links
7. Favorite a card (verify orange fill)
8. Switch tabs (verify orange selection state)

**Step 3: Commit**

```bash
git add components/explore/FeaturedCard.tsx components/explore/GridCard.tsx
git commit -m "feat: polish card spacing and shadows"
```

---

## Summary

This plan transforms Explore into a premium travel guidebook through:

1. **Header**: Logo + inbox button (orange accent)
2. **Tabs**: Orange selected state with orangeFill background
3. **Welcome headers**: Serif typography + orange accent bar
4. **Section headers**: Orange "See all" links
5. **Cards**: Orange badges for featured, orange heart fill when favorited
6. **Overall**: More whitespace, refined shadows, editorial feel

The orange accent is used strategically:
- Interactive elements (buttons, links, selection states)
- Brand moments (accent bars, featured badges)
- Feedback (favorited state)

NOT used for:
- Backgrounds (keeps it clean)
- Text except links
- Decoration
