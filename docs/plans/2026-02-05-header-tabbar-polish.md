# Header & Tab Bar Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a consistent, premium header system and polished bottom tab bar that feels like one cohesive product instead of pages stitched together.

**Architecture:** Replace default React Navigation tab bar with a custom `TabBar` component for full control over sizing, separation, and icon rendering. Upgrade from Feather icons (thin stroke, generic) to Ionicons outline/filled pairs (modern, consistent stroke weight, filled-when-active pattern used by Instagram/Airbnb). Standardize the `AppHeader` to support two modes: "brand" (logo + right action, for main tabs) and "screen" (title + optional back/right, for sub-screens).

**Tech Stack:** React Native, Expo Router, `@expo/vector-icons` (Ionicons already available), `react-native-safe-area-context`

---

## Audit Summary

### Current Problems

**Tab Bar:**
- Uses default React Navigation tab bar with no custom styling beyond tint colors
- Feather icons at size 22 are thin and generic - don't convey a premium travel product
- No visual separation from content (no border, no background differentiation)
- Default height (~49pt) + safe area, but no explicit control over padding/sizing
- Label font is system default, not the app's Plus Jakarta Sans

**Headers:**
- Explore: shows `AppHeader title="Explore"` using `typography.h1` (32px semiBold) - feels like a billboard, not a navigation header
- Travelers (home): shows Sola logo left + inbox icon right - the best pattern in the app
- Trips: shows "Trips" title + subtitle + add button
- Profile: shows just "Profile" title
- Every screen looks different: different font sizes, different layouts, different patterns

### What Good Looks Like

The **Travelers (home) screen** already has the right pattern: logo left, action icon right. The plan extends this to the Explore screen and standardizes other screens.

---

## Task 1: Add tab bar design tokens to the design system

**Files:**
- Modify: `constants/design.ts`

**Step 1: Add new tokens**

Add these to `constants/design.ts`:

```typescript
// After the existing colors object, add:
export const colors = {
  // ... existing colors ...
  tabBarBackground: '#FAFAFA',
  tabBarBorder: '#EBEBEB',
};

// After the existing typography object, add:
export const typography = {
  // ... existing typography ...
  tabLabel: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 12 },
  screenTitle: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 22 },
};
```

**Step 2: Commit**

```bash
git add constants/design.ts
git commit -m "feat: add tab bar and header design tokens"
```

---

## Task 2: Create the custom TabBar component

**Files:**
- Create: `components/TabBar.tsx`

**Step 1: Create the custom tab bar**

Create `components/TabBar.tsx`:

```tsx
import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts } from '@/constants/design';

// Icon mapping: route name -> [outline, filled]
const TAB_ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  explore: ['compass-outline', 'compass'],
  home: ['people-outline', 'people'],
  trips: ['map-outline', 'map'],
  profile: ['person-outline', 'person'],
};

const TAB_ICON_SIZE = 24;
const TAB_BAR_HEIGHT = 50;

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.border} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        // Skip hidden tabs (href: null)
        if (options.href === null) return null;

        const isFocused = state.index === index;
        const label = options.title ?? route.name;
        const iconPair = TAB_ICONS[route.name];
        const iconName = iconPair
          ? (isFocused ? iconPair[1] : iconPair[0])
          : 'ellipse-outline';
        const tintColor = isFocused ? colors.orange : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <Ionicons name={iconName} size={TAB_ICON_SIZE} color={tintColor} />
            <Text style={[styles.label, { color: tintColor }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackground,
    paddingTop: 8,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.tabBarBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: TAB_BAR_HEIGHT,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
  },
});
```

**Design rationale:**
- `TAB_ICON_SIZE = 24` - iOS HIG standard for tab bar icons
- `TAB_BAR_HEIGHT = 50` - standard iOS tab bar content height (49pt rounded up)
- `gap: 3` between icon and label - tight but readable
- `hairlineWidth` border - subtle separation that doesn't compete
- `#FAFAFA` background - barely off-white, creates layer separation without heavy contrast
- Ionicons outline/filled pairs - modern, consistent 2px stroke weight, filled-when-active follows iOS and Instagram convention
- `compass` for Explore (travel-themed, more premium than magnifying glass)
- `people` for Travelers (matches the social purpose)
- `map` for Trips (clear intent)
- `person` for Profile (standard)
- Safe area insets handled properly with `Math.max(insets.bottom, 8)` fallback

**Step 2: Commit**

```bash
git add components/TabBar.tsx
git commit -m "feat: add custom premium TabBar component"
```

---

## Task 3: Wire up the custom TabBar in tab layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Replace default tab bar with custom component**

Replace the entire file contents of `app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import React from 'react';
import TabBar from '@/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="home" options={{ title: 'Travelers' }} />
      <Tabs.Screen name="sos" options={{ href: null, title: 'SOS' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

**Step 2: Verify the app launches and tab navigation works**

Run: `npx expo start` and confirm all 4 visible tabs render, navigate correctly, and show correct active/inactive states.

**Step 3: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: wire custom TabBar into tab navigator"
```

---

## Task 4: Update AppHeader for two-mode system

**Files:**
- Modify: `components/AppHeader.tsx`

**Step 1: Refine AppHeader styles for consistency**

The current AppHeader already supports both patterns (logo+right and title+right). The main fix is the title style - `typography.h1` (32px) is too large for a navigation header. When used as a screen title (Trips, Profile), it should use a smaller size. However, the "Explore" screen will switch to logo mode, so we mainly need to ensure non-Explore screens look good.

Replace the styles in `components/AppHeader.tsx` with updated values:

```tsx
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    minHeight: 44,
  },
  leftContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  textContainerWithLeft: {
    marginLeft: 0,
  },
  rightContainer: {},
  spacer: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 0,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionText: {
    ...typography.body,
    color: colors.orange,
    fontWeight: '500',
  },
});
```

Key changes:
- `paddingTop: spacing.sm` (8) instead of `spacing.md` (12) - tighter top
- `paddingBottom: spacing.md` (12) instead of `spacing.lg` (16) - more compact
- `minHeight: 44` - ensures accessible tap target height
- Title `marginBottom: 0` instead of `spacing.xs` (4) - removes unnecessary gap when no subtitle
- Subtitle uses `typography.caption` (14px) instead of `typography.body` (16px) - less visual weight

**Step 2: Commit**

```bash
git add components/AppHeader.tsx
git commit -m "fix: refine AppHeader spacing and typography for consistency"
```

---

## Task 5: Update Explore screen header to logo + inbox pattern

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Replace the "Explore" text header with logo + inbox**

In `app/(tabs)/explore/index.tsx`, update the imports and AppHeader usage.

Add to imports:
```tsx
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
```

Replace:
```tsx
<AppHeader title="Explore" />
```

With:
```tsx
<AppHeader
  title=""
  leftComponent={
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  }
  rightComponent={
    <Pressable
      onPress={() => router.push('/home/dm')}
      hitSlop={12}
      style={styles.headerAction}
      accessibilityRole="button"
      accessibilityLabel="Messages"
    >
      <Ionicons name="chatbubble-outline" size={22} color={colors.textPrimary} />
    </Pressable>
  }
/>
```

Add to the StyleSheet:
```tsx
headerLogo: {
  height: 28,
  width: 84,
},
headerAction: {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
},
```

**Design rationale:**
- Logo at 84x28 (3:1 ratio matching the Sola logo proportions) - large enough to read clearly but not oversized
- `chatbubble-outline` from Ionicons - cleaner and more standard than Feather's `message-circle`, matches the Ionicons family now used in the tab bar
- Icon color is `textPrimary` (not orange) - the header action should be subtle, not a competing accent
- 36x36 hit area on the action icon - exceeds 44pt minimum when combined with hitSlop

**Step 2: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: replace Explore text header with logo + inbox icon"
```

---

## Task 6: Standardize the Travelers (home) screen header

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Align home screen header with the new system**

Update the header in `app/(tabs)/home/index.tsx` to match the same logo size and icon style as Explore:

Replace the current AppHeader block (lines 51-68) with:

```tsx
<AppHeader
  title=""
  leftComponent={
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
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
      style={styles.headerAction}
      accessibilityRole="button"
      accessibilityLabel="Messages"
    >
      <Ionicons name="chatbubble-outline" size={22} color={colors.textPrimary} />
    </Pressable>
  }
/>
```

Add Ionicons import (replace or supplement Feather import):
```tsx
import { Ionicons } from '@expo/vector-icons';
```

Update/add styles:
```tsx
headerLogo: {
  height: 28,
  width: 84,
},
headerAction: {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
},
```

Replace the old `logo` style (height: 30, width: 90) and `inboxBtn` style with these.

**Step 2: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "fix: standardize Travelers header to match new header system"
```

---

## Task 7: Standardize Trips and Profile screen headers

**Files:**
- Modify: `app/(tabs)/trips/index.tsx`
- Modify: `app/(tabs)/profile/index.tsx`

**Step 1: Update Trips header**

In `app/(tabs)/trips/index.tsx`, the header already uses `AppHeader` with title + right component. Ensure the right component icon uses Ionicons consistently:

The existing code already uses Ionicons for the add button - no icon change needed. The `AppHeader` style updates from Task 4 will automatically apply the tighter spacing.

No code changes needed for Trips beyond what Task 4 provides.

**Step 2: Update Profile header to include settings gear**

In `app/(tabs)/profile/index.tsx`, update:

Replace:
```tsx
<AppHeader title="Profile" />
```

With:
```tsx
<AppHeader
  title="Profile"
  rightComponent={
    <Pressable
      onPress={() => router.push('/profile/settings')}
      hitSlop={12}
      style={styles.headerAction}
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
    </Pressable>
  }
/>
```

Add to styles:
```tsx
headerAction: {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
},
```

This gives the Profile screen a right action matching the pattern used by Explore and Travelers, and provides a discoverable path to settings.

**Step 3: Commit**

```bash
git add app/(tabs)/trips/index.tsx app/(tabs)/profile/index.tsx
git commit -m "fix: standardize Trips and Profile headers"
```

---

## Task 8: Visual verification and cleanup

**Step 1: Run the app and verify all screens**

Run: `npx expo start`

Check each tab:
- [ ] **Explore**: Logo left, inbox icon right, no "Explore" text, content starts below header
- [ ] **Travelers**: Logo left, inbox icon right, matches Explore header exactly
- [ ] **Trips**: "Trips" title left, "+" button right, subtitle visible
- [ ] **Profile**: "Profile" title left, gear icon right
- [ ] **Tab bar**: All 4 tabs show outline icons, active tab shows filled icon + orange tint, subtle grey background and hairline border visible, labels readable in Plus Jakarta Sans

**Step 2: Check sub-screens**

Navigate into:
- [ ] Country detail (from Explore) - no header change needed (full-screen hero)
- [ ] Messages (from inbox icon) - "Messages" title + back arrow (unchanged)
- [ ] Settings (from Profile gear) - existing settings nav unchanged

**Step 3: Remove any unused Feather imports from modified files**

If any modified file still imports Feather but no longer uses it, remove the import.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: cleanup unused imports after header/tab bar polish"
```

---

## Summary of the New System

### Header System (2 modes)

| Screen Type | Left | Center | Right |
|---|---|---|---|
| Main tabs (Explore, Travelers) | Sola logo (84x28) | - | Inbox icon (chatbubble-outline, 22px) |
| Section tabs (Trips) | Title (h1) | - | Action button (contextual) |
| Section tabs (Profile) | Title (h1) | - | Settings gear |
| Sub-screens | Back arrow | Title (center) | Optional action |

### Tab Bar System

| Property | Value | Rationale |
|---|---|---|
| Icon library | Ionicons | Consistent 2px stroke, filled variants, modern |
| Icon size | 24px | iOS HIG standard |
| Label font | Plus Jakarta Sans Medium, 10px | Matches app font, standard iOS tab label size |
| Active state | Filled icon + orange tint | Clear, premium active indication |
| Inactive state | Outline icon + grey (#9A9A9A) | Subtle, doesn't compete |
| Background | #FAFAFA | Barely off-white, creates layer separation |
| Border | hairlineWidth, #EBEBEB | Minimal separation, not heavy |
| Content height | 50px | Standard iOS tab bar |
| Bottom padding | safe area inset (min 8px) | Proper safe area handling |

### Why This Is Better

1. **Consistent brand presence** - Logo appears on the two main screens, reinforcing brand identity
2. **Discoverable inbox** - Inbox icon on main screens means users don't have to navigate to Travelers first
3. **Visual hierarchy** - Tab bar reads as its own layer, not floating text
4. **Premium feel** - Ionicons with filled/outline pairs is the same pattern used by Instagram, Airbnb, and Apple's own apps
5. **Typography consistency** - Tab labels use the app's font family, not system default
6. **Predictable header pattern** - Users know what to expect: main screens = logo, section screens = title
