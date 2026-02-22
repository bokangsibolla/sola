# Tab Bar Auto-Hide + Blur Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the floating tab bar hide on scroll-down and reappear with a frosted glass effect on scroll-up, eliminating content obstruction.

**Architecture:** A React context provides scroll-direction tracking. Each tab screen reports scroll events via a lightweight hook. The TabBar component consumes visibility state and animates translateY with Reanimated, swapping between BlurView (reappearing) and solid white (idle). No Animated.ScrollView needed — regular onScroll callbacks are sufficient since the animation is decoupled in the TabBar via Reanimated shared values.

**Tech Stack:** react-native-reanimated (already installed), expo-blur (in package.json, needs npm install), React Context

---

### Task 1: Install expo-blur dependency

**Files:**
- None (dependency install only)

**Step 1: Run npm install to ensure expo-blur is available**

Run: `npm install`

**Step 2: Verify expo-blur resolves**

Run: `npx expo install expo-blur --check`
Expected: No errors about expo-blur missing

**Step 3: Commit**

```bash
git add package-lock.json
git commit -m "chore: install expo-blur dependency"
```

---

### Task 2: Create TabBarScrollContext — context + provider + hook

**Files:**
- Create: `components/TabBarScrollContext.tsx`

**Step 1: Create the context file**

```tsx
// components/TabBarScrollContext.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface TabBarScrollContextValue {
  /** Whether the tab bar should be visible */
  visible: boolean;
  /** Whether the bar just reappeared (for blur state) */
  isReappearing: boolean;
  /** Call this from onScroll of any ScrollView/FlatList */
  reportScrollY: (y: number) => void;
  /** Force-show the bar (e.g. on tab switch) */
  forceShow: () => void;
}

const TabBarScrollContext = createContext<TabBarScrollContextValue>({
  visible: true,
  isReappearing: false,
  reportScrollY: () => {},
  forceShow: () => {},
});

const DEAD_ZONE = 10; // px — ignore tiny scroll movements
const IDLE_DELAY = 1500; // ms before blur → solid transition

export function TabBarScrollProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [isReappearing, setIsReappearing] = useState(false);
  const lastY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIsReappearing(false);
    }, IDLE_DELAY);
  }, []);

  const reportScrollY = useCallback(
    (y: number) => {
      const diff = y - lastY.current;
      lastY.current = y;

      if (y <= 0) {
        // At top — always show, no blur
        setVisible(true);
        setIsReappearing(false);
        if (idleTimer.current) clearTimeout(idleTimer.current);
        return;
      }

      if (diff > DEAD_ZONE) {
        // Scrolling down — hide
        setVisible(false);
        setIsReappearing(false);
        if (idleTimer.current) clearTimeout(idleTimer.current);
      } else if (diff < -DEAD_ZONE) {
        // Scrolling up — show with blur
        setVisible((prev) => {
          if (!prev) {
            // Was hidden, now reappearing
            setIsReappearing(true);
            startIdleTimer();
          }
          return true;
        });
      }
    },
    [startIdleTimer],
  );

  const forceShow = useCallback(() => {
    setVisible(true);
    setIsReappearing(false);
    lastY.current = 0;
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  return (
    <TabBarScrollContext.Provider value={{ visible, isReappearing, reportScrollY, forceShow }}>
      {children}
    </TabBarScrollContext.Provider>
  );
}

export function useTabBarVisibility() {
  return useContext(TabBarScrollContext);
}

/**
 * Hook for scroll views — returns onScroll + scrollEventThrottle props.
 * Spread these on any ScrollView, FlatList, or SectionList.
 */
export function useHideTabBarOnScroll() {
  const { reportScrollY } = useContext(TabBarScrollContext);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      reportScrollY(event.nativeEvent.contentOffset.y);
    },
    [reportScrollY],
  );

  return { onScroll, scrollEventThrottle: 16 } as const;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/TabBarScrollContext)' | head -5`
Expected: No errors from this file

**Step 3: Commit**

```bash
git add components/TabBarScrollContext.tsx
git commit -m "feat: add TabBarScrollContext for auto-hide scroll tracking"
```

---

### Task 3: Modify TabBar to animate hide/show + blur

**Files:**
- Modify: `components/TabBar.tsx`

**Step 1: Update TabBar to consume context and animate**

Key changes:
1. Import `useTabBarVisibility` from context
2. Import `BlurView` from `expo-blur`
3. Add `translateY` animation driven by `visible` state
4. Add `forceShow()` call when active tab changes
5. Swap `floatingBar` background between `BlurView` (reappearing) and solid white (idle/at-top)
6. The wrapper needs `pointerEvents="box-none"` so touches pass through when bar is hidden

Replace the entire TabBar component function and styles with:

```tsx
// Top-level imports to add:
import { BlurView } from 'expo-blur';
import { useTabBarVisibility } from '@/components/TabBarScrollContext';

// In the TabBar component:
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm) + spacing.lg;
  const { userId } = useAuth();
  const [connectHasNew, setConnectHasNew] = useState(false);
  const { visible, isReappearing, forceShow } = useTabBarVisibility();

  // Slide-out distance: bar height + bottom padding
  const slideDistance = ACTIVE_CIRCLE_SIZE + spacing.xxl + bottomPadding;
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animate on visibility changes
  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : slideDistance, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, slideDistance, translateY, opacity]);

  // Force-show bar when switching tabs
  useEffect(() => {
    forceShow();
  }, [state.index, forceShow]);

  // ... existing community badge logic stays unchanged ...

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.wrapper, { paddingBottom: bottomPadding }, wrapperAnimatedStyle]}
      pointerEvents="box-none"
    >
      {isReappearing ? (
        <BlurView intensity={80} tint="light" style={styles.floatingBarBlur}>
          <View style={styles.blurInner}>
            {/* ... tab items ... */}
          </View>
        </BlurView>
      ) : (
        <View style={styles.floatingBar}>
          {/* ... tab items ... */}
        </View>
      )}
    </Animated.View>
  );
}

// New styles to add:
// floatingBarBlur — same shape as floatingBar but transparent bg for BlurView
// blurInner — the flex row inside BlurView
```

The blur branch and solid branch render the same tab items — extract the items into a variable to avoid duplication:
```tsx
const tabItems = state.routes.map((route, index) => {
  // ... existing TabItem rendering logic ...
});

// Then in JSX:
{isReappearing ? (
  <BlurView intensity={80} tint="light" style={styles.floatingBarBlur}>
    <View style={styles.blurInner}>{tabItems}</View>
  </BlurView>
) : (
  <View style={styles.floatingBar}>{tabItems}</View>
)}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/TabBar)' | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add components/TabBar.tsx
git commit -m "feat: tab bar auto-hide animation + frosted glass blur on reappear"
```

---

### Task 4: Wrap tab layout with TabBarScrollProvider

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Add provider**

```tsx
import { TabBarScrollProvider } from '@/components/TabBarScrollContext';

export default function TabLayout() {
  return (
    <TabBarScrollProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="connect" options={{ title: 'Connect' }} />
        <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      </Tabs>
    </TabBarScrollProvider>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/_layout)' | head -5`
Expected: No errors

**Step 3: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "feat: wrap tab navigator with TabBarScrollProvider"
```

---

### Task 5: Wire up Home screen scroll tracking

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Add hook to ScrollView**

```tsx
import { useHideTabBarOnScroll } from '@/components/TabBarScrollContext';

// Inside HomeScreen:
const scrollProps = useHideTabBarOnScroll();

// On the ScrollView, add:
<ScrollView
  {...scrollProps}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.scrollContent}
  refreshControl={...}
>
```

Note: `{...scrollProps}` spreads `onScroll` and `scrollEventThrottle={16}`.

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/home)' | head -5`

**Step 3: Commit**

```bash
git add app/\(tabs\)/home/index.tsx
git commit -m "feat: wire Home tab scroll tracking for auto-hide tab bar"
```

---

### Task 6: Wire up Discover screen scroll tracking

**Files:**
- Modify: `app/(tabs)/discover/index.tsx`

**Step 1: Add hook to ScrollView**

Same pattern as Home — import `useHideTabBarOnScroll`, spread on the main `<ScrollView>`.

**Step 2: Verify TypeScript compiles**

**Step 3: Commit**

```bash
git add app/\(tabs\)/discover/index.tsx
git commit -m "feat: wire Discover tab scroll tracking for auto-hide tab bar"
```

---

### Task 7: Wire up Connect screen scroll tracking

**Files:**
- Modify: `app/(tabs)/connect/index.tsx`

**Step 1: Add hook to DiscussionsView FlatList and TravelersView SectionList**

The Connect screen has two sub-views with their own scroll containers:

In `DiscussionsView`:
```tsx
const scrollProps = useHideTabBarOnScroll();

<FlatList
  {...scrollProps}
  data={displayThreads}
  // ... rest unchanged
/>
```

In `TravelersView`:
```tsx
const scrollProps = useHideTabBarOnScroll();

<SectionList
  {...scrollProps}
  sections={sections}
  // ... rest unchanged
/>
```

Import `useHideTabBarOnScroll` at the top of the file.

**Step 2: Verify TypeScript compiles**

**Step 3: Commit**

```bash
git add app/\(tabs\)/connect/index.tsx
git commit -m "feat: wire Connect tab scroll tracking for auto-hide tab bar"
```

---

### Task 8: Wire up Trips screen scroll tracking

**Files:**
- Modify: `app/(tabs)/trips/index.tsx`

**Step 1: Add hook to both ScrollViews**

The Trips screen has two ScrollViews (travelling mode + normal mode). Add the hook to both:

```tsx
const scrollProps = useHideTabBarOnScroll();

// Both ScrollViews:
<ScrollView {...scrollProps} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
```

**Step 2: Verify TypeScript compiles**

**Step 3: Commit**

```bash
git add app/\(tabs\)/trips/index.tsx
git commit -m "feat: wire Trips tab scroll tracking for auto-hide tab bar"
```

---

### Task 9: Final verification + type check

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -20`
Expected: No new errors

**Step 2: Visual test**

Run the app and verify:
- [ ] Tab bar visible when at top of any screen
- [ ] Scrolling down hides the bar (slides down, 300ms)
- [ ] Scrolling up brings it back with frosted glass background
- [ ] After 1.5s idle, bar transitions to solid white
- [ ] Switching tabs always shows the bar
- [ ] Pull-to-refresh still works on all screens
- [ ] Badge on Connect tab still works
- [ ] FAB on Connect screen still positioned correctly (above tab bar)

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: tab bar auto-hide on scroll with frosted glass reappear effect"
```
