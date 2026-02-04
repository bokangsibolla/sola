# Fix Touch Events Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken touch/click events across the React Native Expo app so all buttons, cards, and interactive elements respond consistently.

**Architecture:** The app mixes two incompatible animation patterns:
1. `Animated` from `react-native` (used in FeaturedCard, GridCard, ExploreCard)
2. `Animated` from `react-native-reanimated` with `AnimatedPressable` (used in CountryCard, CitySpotlightCard, ActivityCard, OptionCard)

This mixing, combined with nested Pressables and missing gesture handler setup, causes touch responders to conflict. The fix is to standardize on ONE animation approach and ensure proper gesture handler configuration.

**Tech Stack:** react-native-reanimated ~4.1.1, react-native-gesture-handler ~2.28.0, Expo Router

---

## Root Cause Analysis

### Problem 1: Mixed Animation Libraries
- `FeaturedCard.tsx`, `GridCard.tsx`, `ExploreCard.tsx` use `Animated` from `react-native`
- `CountryCard.tsx`, `CitySpotlightCard.tsx`, `ActivityCard.tsx`, `OptionCard.tsx` use `Animated` from `react-native-reanimated`
- Mixing these causes gesture responder conflicts

### Problem 2: Nested Pressables
- `FeaturedCard.tsx:79` has a favorite Pressable nested inside main Pressable without `pointerEvents` control
- `GridCard.tsx:91` same issue
- `ExploreCard.tsx:78` same issue
- Nested Pressables compete for touch events

### Problem 3: GestureHandlerRootView
- Already added in previous fix - verify it's working

---

## Task 1: Standardize CountryCard to use react-native Animated

**Files:**
- Modify: `components/explore/cards/CountryCard.tsx`

**Step 1: Replace reanimated with react-native Animated**

Replace the entire file content with:

```tsx
// components/explore/cards/CountryCard.tsx
import { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { Country } from '@/data/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.1;

interface CountryCardProps {
  country: Country;
  onPress: () => void;
}

export function CountryCard({ country, onPress }: CountryCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const imageUrl = country.heroImageUrl ?? 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradient}
            pointerEvents="none"
          />
          <Text style={styles.name} pointerEvents="none">{country.name}</Text>
        </Pressable>
      </Animated.View>
      {country.shortBlurb && (
        <Text style={styles.blurb} numberOfLines={1}>{country.shortBlurb}</Text>
      )}
    </View>
  );
}

export { CARD_WIDTH as COUNTRY_CARD_WIDTH, GAP as COUNTRY_CARD_GAP };

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
```

**Step 2: Verify no reanimated imports remain**

Run: `grep -n "react-native-reanimated" components/explore/cards/CountryCard.tsx`
Expected: No output (no matches)

---

## Task 2: Standardize CitySpotlightCard to use react-native Animated

**Files:**
- Modify: `components/explore/cards/CitySpotlightCard.tsx`

**Step 1: Replace reanimated with react-native Animated**

Replace the entire file content with:

```tsx
// components/explore/cards/CitySpotlightCard.tsx
import { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 aspect ratio

interface CitySpotlightCardProps {
  city: CityWithCountry;
  onPress: () => void;
}

export function CitySpotlightCard({ city, onPress }: CitySpotlightCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const imageUrl = city.heroImageUrl ?? 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />
        </Pressable>
      </Animated.View>
      <View style={styles.info}>
        <Text style={styles.name}>{city.name}</Text>
        <Text style={styles.country}>{city.countryName}</Text>
      </View>
      {city.shortBlurb && (
        <Text style={styles.blurb} numberOfLines={2}>{city.shortBlurb}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  country: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Verify no reanimated imports remain**

Run: `grep -n "react-native-reanimated" components/explore/cards/CitySpotlightCard.tsx`
Expected: No output (no matches)

---

## Task 3: Standardize ActivityCard to use react-native Animated

**Files:**
- Modify: `components/explore/cards/ActivityCard.tsx`

**Step 1: Replace reanimated with react-native Animated**

Replace the entire file content with:

```tsx
// components/explore/cards/ActivityCard.tsx
import { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { ActivityWithCity } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VISIBLE_CARDS = 3.3;
const CARD_GAP = spacing.md;
const CARD_SIZE = (SCREEN_WIDTH - spacing.screenX * 2 - CARD_GAP * 2) / VISIBLE_CARDS;

interface ActivityCardProps {
  activity: ActivityWithCity;
  onPress: () => void;
}

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const imageUrl = activity.imageUrl ?? 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300';

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer} pointerEvents="none">
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </View>
        <Text style={styles.name} numberOfLines={2}>{activity.name}</Text>
      </Pressable>
    </Animated.View>
  );
}

export { CARD_SIZE as ACTIVITY_CARD_SIZE, CARD_GAP as ACTIVITY_CARD_GAP };

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
  },
  imageContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
```

**Step 2: Verify no reanimated imports remain**

Run: `grep -n "react-native-reanimated" components/explore/cards/ActivityCard.tsx`
Expected: No output (no matches)

---

## Task 4: Standardize OptionCard to use react-native Animated

**Files:**
- Modify: `components/onboarding/OptionCard.tsx`

**Step 1: Replace reanimated with react-native Animated**

Replace the entire file content with:

```tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export default function OptionCard({ title, subtitle, selected, onPress }: OptionCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();
    }
  }, [selected, scale]);

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        style={[styles.card, selected && styles.cardSelected]}
        onPress={onPress}
      >
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    paddingVertical: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  titleSelected: {
    color: colors.orange,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
```

**Step 2: Verify no reanimated imports remain**

Run: `grep -n "react-native-reanimated" components/onboarding/OptionCard.tsx`
Expected: No output (no matches)

---

## Task 5: Fix nested Pressable in FeaturedCard

**Files:**
- Modify: `components/explore/FeaturedCard.tsx`

**Step 1: Add pointerEvents="box-none" to prevent touch conflicts**

In `FeaturedCard.tsx`, find the favorite button Pressable (around line 79) and wrap it properly:

Find:
```tsx
          {/* Favorite button */}
          <Pressable style={styles.favoriteButton} onPress={handleFavoritePress}>
```

Replace with:
```tsx
          {/* Favorite button */}
          <Pressable
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={8}
          >
```

**Step 2: Add pointerEvents to image container**

Find:
```tsx
        <View style={styles.imageContainer}>
          <Image
```

Replace with:
```tsx
        <View style={styles.imageContainer} pointerEvents="box-none">
          <Image
            pointerEvents="none"
```

---

## Task 6: Fix nested Pressable in GridCard

**Files:**
- Modify: `components/explore/GridCard.tsx`

**Step 1: Add pointerEvents to image**

Find (around line 75-79):
```tsx
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
```

Replace with:
```tsx
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />
```

**Step 2: Add hitSlop to favorite button**

Find (around line 91-97):
```tsx
            <Pressable
              style={[
                styles.favoriteButton,
                localFavorited && styles.favoriteButtonActive
              ]}
              onPress={handleFavoritePress}
            >
```

Replace with:
```tsx
            <Pressable
              style={[
                styles.favoriteButton,
                localFavorited && styles.favoriteButtonActive
              ]}
              onPress={handleFavoritePress}
              hitSlop={8}
            >
```

---

## Task 7: Fix nested Pressable in ExploreCard

**Files:**
- Modify: `components/explore/ExploreCard.tsx`

**Step 1: Add pointerEvents to image**

Find (around line 71-76):
```tsx
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
```

Replace with:
```tsx
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />
```

**Step 2: Add hitSlop to favorite button**

Find (around line 78):
```tsx
            <Pressable style={styles.favoriteButton} onPress={handleFavoritePress}>
```

Replace with:
```tsx
            <Pressable style={styles.favoriteButton} onPress={handleFavoritePress} hitSlop={8}>
```

---

## Task 8: Verify GestureHandlerRootView is properly configured

**Files:**
- Verify: `app/_layout.tsx`

**Step 1: Verify import exists**

Run: `grep -n "GestureHandlerRootView" app/_layout.tsx`
Expected: Should show import line and usage

**Step 2: Verify wrapper is at root**

Run: `grep -A2 "return (" app/_layout.tsx | head -10`
Expected: Should show `<GestureHandlerRootView style={{ flex: 1 }}>` as first element

---

## Task 9: Clear cache and test

**Step 1: Clear Metro bundler cache**

Run: `cd /Users/bokangsibolla/sola_backup/sola && npx expo start -c`

**Step 2: Manual testing checklist**

Test each of these interactions:
- [ ] Explore page: Tap search button in header
- [ ] Explore page: Tap on CountryCard
- [ ] Explore page: Tap on CitySpotlightCard
- [ ] Explore page: Tap on ActivityCard
- [ ] Explore page: Scroll feed, then tap cards
- [ ] Search screen: Type in search box
- [ ] Search screen: Tap on search results
- [ ] Search screen: Tap back button
- [ ] After navigating back: Tap cards again
- [ ] Favorite buttons: Tap heart icons on cards
- [ ] Navigate through multiple screens and verify touch continues working

---

## Task 10: Commit changes

**Step 1: Stage all modified files**

```bash
git add components/explore/cards/CountryCard.tsx \
       components/explore/cards/CitySpotlightCard.tsx \
       components/explore/cards/ActivityCard.tsx \
       components/onboarding/OptionCard.tsx \
       components/explore/FeaturedCard.tsx \
       components/explore/GridCard.tsx \
       components/explore/ExploreCard.tsx \
       app/_layout.tsx
```

**Step 2: Commit**

```bash
git commit -m "fix: resolve touch event conflicts by standardizing on react-native Animated

- Replace react-native-reanimated AnimatedPressable with react-native Animated
- Add pointerEvents='none' to Image components to prevent touch blocking
- Add hitSlop to nested Pressable components
- Fixes touch events freezing after navigation"
```
