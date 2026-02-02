# Onboarding Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the entire onboarding flow (9 screens, 5 progress stages) with a premium design system using Instrument Serif + Plus Jakarta Sans fonts, replacing the current 7-screen flow.

**Architecture:** Delete all existing onboarding + auth screens and components. Build new shared components (ProgressBar, Pill, OptionCard, OnboardingScreen shell), then build each screen sequentially. The onboardingStore gets a new data model. Fonts swap from Inter/Playfair to Plus Jakarta Sans/Instrument Serif. Navigation changes from split (onboarding)/(auth) groups to a single (onboarding) group containing all 9 screens.

**Tech Stack:** React Native, Expo Router (Stack), TypeScript, Reanimated (spring animations), expo-image-picker, Plus Jakarta Sans + Instrument Serif fonts

**Design doc:** `/Users/bokangsibolla/sola_backup/docs/plans/2026-02-02-onboarding-redesign-design.md`

---

## Task 1: Add new fonts

**Files:**
- Create: `assets/fonts/PlusJakartaSans-Regular.ttf`
- Create: `assets/fonts/PlusJakartaSans-Medium.ttf`
- Create: `assets/fonts/PlusJakartaSans-SemiBold.ttf`
- Create: `assets/fonts/InstrumentSerif-Regular.ttf`
- Modify: `app/_layout.tsx`

**Step 1: Download fonts**

Run:
```bash
# Plus Jakarta Sans
curl -L "https://github.com/nicholasgillespie/plus-jakarta-sans/raw/main/fonts/ttf/PlusJakartaSans-Regular.ttf" -o assets/fonts/PlusJakartaSans-Regular.ttf
curl -L "https://github.com/nicholasgillespie/plus-jakarta-sans/raw/main/fonts/ttf/PlusJakartaSans-Medium.ttf" -o assets/fonts/PlusJakartaSans-Medium.ttf
curl -L "https://github.com/nicholasgillespie/plus-jakarta-sans/raw/main/fonts/ttf/PlusJakartaSans-SemiBold.ttf" -o assets/fonts/PlusJakartaSans-SemiBold.ttf

# Instrument Serif
curl -L "https://github.com/google/fonts/raw/main/ofl/instrumentserif/InstrumentSerif-Regular.ttf" -o assets/fonts/InstrumentSerif-Regular.ttf
```

If those URLs don't work, download manually from Google Fonts:
- https://fonts.google.com/specimen/Plus+Jakarta+Sans
- https://fonts.google.com/specimen/Instrument+Serif

**Step 2: Update font loading in `app/_layout.tsx`**

Replace the `useFonts` call:

```typescript
const [fontsLoaded, fontError] = useFonts({
  'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
  'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
});
```

Delete the old Inter and PlayfairDisplay font files from `assets/fonts/` since they won't be used.

**Step 3: Verify fonts load**

Run: `npx expo start` — app should launch without font errors.

**Step 4: Commit**

```bash
git add assets/fonts/ app/_layout.tsx
git commit -m "feat: add Plus Jakarta Sans and Instrument Serif fonts, remove old fonts"
```

---

## Task 2: Update design tokens

**Files:**
- Modify: `constants/design.ts`
- Delete: `constants/theme.ts`

**Step 1: Rewrite `constants/design.ts`**

```typescript
export const colors = {
  background: '#FFFFFF',
  textPrimary: '#0E0E0E',
  textMuted: '#9A9A9A',
  orange: '#E5653A',
  orangeFill: '#FFF5F1',
  borderDefault: '#E8E8E8',
  overlayDark: 'rgba(0,0,0,0.45)',
};

export const spacing = {
  screenX: 24,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
};

export const radius = {
  pill: 12,
  input: 14,
  card: 14,
  button: 16,
  full: 999,
};

export const fonts = {
  serif: 'InstrumentSerif-Regular',
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
};

export const typography = {
  h1: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 36 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  label: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  captionSmall: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  pillLabel: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  pillSubtitle: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14, color: colors.textMuted },
  button: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
};
```

**Step 2: Delete `constants/theme.ts`**

**Step 3: Fix all imports of `theme` across the codebase**

Search for `from '@/constants/theme'` — update any remaining references in components that will survive (like `PrimaryButton.tsx`, tab bar, etc.) to import from `@/constants/design` instead. Components being deleted in Task 4 don't need fixing.

Files likely needing the import fix:
- `components/ui/PrimaryButton.tsx` — update to use `colors`, `radius`, `fonts`, `typography` from design.ts and adjust style values
- `components/ui/SecondaryButton.tsx` — same
- `components/ui/SolaText.tsx` — same
- `components/ui/TextField.tsx` — same
- `app/(tabs)/_layout.tsx` — if it references theme

**Step 4: Commit**

```bash
git add constants/ components/ app/
git commit -m "feat: update design tokens for onboarding redesign"
```

---

## Task 3: Rewrite onboardingStore

**Files:**
- Modify: `state/onboardingStore.ts`

**Step 1: Replace entire file**

```typescript
interface OnboardingData {
  onboardingCompleted: boolean;
  email: string;
  password: string;
  firstName: string;
  photoUri: string | null;
  countryIso2: string;
  countryName: string;
  tripIntent: 'planning' | 'exploring' | '';
  dayStyle: string[];
  priorities: string[];
  stayPreference: string;
  spendingStyle: string;
}

const store: OnboardingData = {
  onboardingCompleted: false,
  email: '',
  password: '',
  firstName: '',
  photoUri: null,
  countryIso2: '',
  countryName: '',
  tripIntent: '',
  dayStyle: [],
  priorities: [],
  stayPreference: '',
  spendingStyle: '',
};

export const onboardingStore = {
  get: <K extends keyof OnboardingData>(key: K): OnboardingData[K] => store[key],
  set: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    store[key] = value;
  },
  getData: () => ({ ...store }),
  reset: () => {
    Object.assign(store, {
      onboardingCompleted: false,
      email: '',
      password: '',
      firstName: '',
      photoUri: null,
      countryIso2: '',
      countryName: '',
      tripIntent: '',
      dayStyle: [],
      priorities: [],
      stayPreference: '',
      spendingStyle: '',
    });
  },
};
```

**Step 2: Update the root layout**

In `app/_layout.tsx`, change `onboardingStore.getOnboardingCompleted()` to `onboardingStore.get('onboardingCompleted')`.

**Step 3: Commit**

```bash
git add state/onboardingStore.ts app/_layout.tsx
git commit -m "feat: rewrite onboarding store with new data model"
```

---

## Task 4: Delete old screens and components

**Files to delete:**
- `app/(onboarding)/splash.tsx`
- `app/(onboarding)/welcome.tsx`
- `app/(onboarding)/profile.tsx`
- `app/(onboarding)/intent.tsx`
- `app/(onboarding)/destination.tsx`
- `app/(onboarding)/trip-dates.tsx`
- `app/(onboarding)/privacy.tsx`
- `app/(auth)/create-account.tsx`
- `app/(auth)/creating-account.tsx`
- `app/(auth)/verify.tsx`
- `app/(auth)/account-created.tsx`
- `app/(auth)/_layout.tsx`
- `components/onboarding/PolarstepsShell.tsx`
- `components/onboarding/PolarstepsCard.tsx`
- `components/onboarding/CheckboxRow.tsx`
- `components/onboarding/CountryAutocompleteInput.tsx`
- `components/onboarding/DestinationSearchInput.tsx`
- `components/onboarding/QuestionScreen.tsx`

**Files to keep (will be reused/modified):**
- `app/(onboarding)/_layout.tsx`
- `components/onboarding/AnimatedBackground.tsx`
- `components/onboarding/ProgressIndicator.tsx`

**Step 1: Delete files**

```bash
rm app/\(auth\)/*.tsx
rmdir app/\(auth\)
rm app/\(onboarding\)/splash.tsx app/\(onboarding\)/welcome.tsx app/\(onboarding\)/profile.tsx app/\(onboarding\)/intent.tsx app/\(onboarding\)/destination.tsx app/\(onboarding\)/trip-dates.tsx app/\(onboarding\)/privacy.tsx
rm components/onboarding/PolarstepsShell.tsx components/onboarding/PolarstepsCard.tsx components/onboarding/CheckboxRow.tsx components/onboarding/CountryAutocompleteInput.tsx components/onboarding/DestinationSearchInput.tsx components/onboarding/QuestionScreen.tsx
```

**Step 2: Remove `(auth)` group from root layout**

In `app/_layout.tsx`, remove this line:
```
<Stack.Screen name="(auth)" options={{ headerShown: false }} />
```

**Step 3: Update `app/(onboarding)/_layout.tsx`**

```typescript
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="day-style" />
      <Stack.Screen name="priorities" />
      <Stack.Screen name="stay-preference" />
      <Stack.Screen name="spending-style" />
      <Stack.Screen name="youre-in" />
    </Stack>
  );
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete old onboarding and auth screens, update layout"
```

---

## Task 5: Add greetings data

**Files:**
- Create: `data/greetings.ts`

**Step 1: Create greetings file**

```typescript
// Native feminine greetings for countries with a single dominant language.
// Used on country pills (profile screen) and the "you're in" final screen.
const greetings: Record<string, string> = {
  JP: 'ようこそ',
  TH: 'ยินดีต้อนรับ',
  PT: 'Bem-vinda',
  ES: 'Bienvenida',
  IT: 'Benvenuta',
  MX: 'Bienvenida',
  FR: 'Bienvenue',
  KR: '환영합니다',
  VN: 'Chào mừng',
  GR: 'Καλώς ήρθες',
  ID: 'Selamat datang',
  DE: 'Willkommen',
  NL: 'Welkom',
  TR: 'Hoş geldin',
  PL: 'Witaj',
  SE: 'Välkommen',
  NO: 'Velkommen',
  DK: 'Velkommen',
  FI: 'Tervetuloa',
  CZ: 'Vítej',
  RO: 'Bine ai venit',
  HU: 'Üdvözöllek',
  HR: 'Dobrodošla',
  BG: 'Добре дошла',
  RS: 'Добродошла',
  UA: 'Ласкаво просимо',
  RU: 'Добро пожаловать',
  BR: 'Bem-vinda',
  AR: 'Bienvenida',
  CL: 'Bienvenida',
  CO: 'Bienvenida',
  PE: 'Bienvenida',
  PH: 'Maligayang pagdating',
  EG: 'أهلاً وسهلاً',
  MA: 'مرحبا',
  CN: '欢迎',
  TW: '歡迎',
};

export function getGreeting(iso2: string): string | null {
  return greetings[iso2] ?? null;
}
```

**Step 2: Commit**

```bash
git add data/greetings.ts
git commit -m "feat: add native greeting data for onboarding"
```

---

## Task 6: Build shared components — ProgressBar, OptionCard, Pill, OnboardingScreen

**Files:**
- Modify: `components/onboarding/ProgressIndicator.tsx` (rewrite)
- Create: `components/onboarding/OptionCard.tsx`
- Create: `components/onboarding/Pill.tsx`
- Create: `components/onboarding/OnboardingScreen.tsx`
- Modify: `components/onboarding/AnimatedBackground.tsx` (minor: remove border radius)

**Step 1: Rewrite `ProgressIndicator.tsx`**

5 fixed-width segments (48px each), 4px gaps, 4px height, 2px radius. Filled = orange, unfilled = `#E8E8E8`.

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/design';

interface ProgressBarProps {
  /** Current stage 1-5 */
  stage: number;
}

export default function ProgressBar({ stage }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          style={[styles.segment, s <= stage && styles.segmentFilled]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 16,
  },
  segment: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
  },
  segmentFilled: {
    backgroundColor: colors.orange,
  },
});
```

**Step 2: Create `OptionCard.tsx`**

72px height, 14px radius, full width, 1px border. Selected: 2px orange border + `#FFF5F1` fill. Optional subtitle. Spring animation on select.

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, radius } from '@/constants/design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export default function OptionCard({ title, subtitle, selected, onPress }: OptionCardProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1 : 1, { damping: 15, stiffness: 150 }) }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.card,
        selected && styles.cardSelected,
        animatedStyle,
      ]}
      onPress={onPress}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 72,
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
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
```

**Step 3: Create `Pill.tsx`**

40px height, 12px radius, 12px horizontal padding, 8px gap. Selected = orange border + light fill. Optional subtitle (for greetings).

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';

interface PillProps {
  label: string;
  subtitle?: string | null;
  selected: boolean;
  onPress: () => void;
}

export default function Pill({ label, subtitle, selected, onPress }: PillProps) {
  return (
    <Pressable
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.orange,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
```

**Step 4: Create `OnboardingScreen.tsx`**

Shell component used by all white-background screens (2-8). Provides: safe area, progress bar, centered headline + optional subtitle, scrollable content area, pinned CTA at bottom.

```typescript
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import ProgressBar from './ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing, typography } from '@/constants/design';

interface OnboardingScreenProps {
  stage: number;
  headline: string;
  subtitle?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCtaPress: () => void;
  showBack?: boolean;
  children: React.ReactNode;
}

export default function OnboardingScreen({
  stage,
  headline,
  subtitle,
  ctaLabel,
  ctaDisabled = false,
  onCtaPress,
  showBack = true,
  children,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <ProgressBar stage={stage} />
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>{headline}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.content}>{children}</View>

      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} disabled={ctaDisabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingTop: 8,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  backPlaceholder: {
    width: 32,
  },
  headlineBlock: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 32,
    alignItems: 'center',
  },
  headline: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 32,
  },
  ctaContainer: {
    paddingHorizontal: spacing.screenX,
  },
});
```

**Step 5: Update `AnimatedBackground.tsx`**

Remove the `borderBottomLeftRadius` and `borderBottomRightRadius` from both `imageContainer` and `overlay` styles (the redesign uses true full-bleed, no rounded corners).

**Step 6: Update `PrimaryButton.tsx`**

Update to use new design tokens from `@/constants/design` instead of `theme`:

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function PrimaryButton({
  label,
  onPress,
  style,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.orange,
    height: 56,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    opacity: 0.8,
  },
});
```

**Step 7: Verify the app compiles**

Run: `npx expo start` — should launch without errors (screens won't exist yet, but components compile).

**Step 8: Commit**

```bash
git add components/ constants/
git commit -m "feat: build shared onboarding components (ProgressBar, OptionCard, Pill, OnboardingScreen)"
```

---

## Task 7: Screen 1 — Welcome

**Files:**
- Create: `app/(onboarding)/welcome.tsx`

**Step 1: Build the screen**

Full-bleed hero with rotating background images (7 pexels images, 2.5s interval), dark overlay, SOLA logo centered in top third, tagline below, orange CTA pinned to bottom, "Log in" text button above CTA.

```typescript
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '@/components/onboarding/AnimatedBackground';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing } from '@/constants/design';

const heroImages = [
  require('@/assets/images/pexels-driving.png'),
  require('@/assets/images/pexels-hiking.png'),
  require('@/assets/images/pexels-mountain-cliff.png'),
  require('@/assets/images/pexels-mountain-hiking.png'),
  require('@/assets/images/pexels-paddleboarding.png'),
  require('@/assets/images/pexels-sailing.png'),
  require('@/assets/images/welcome-background.png'),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <AnimatedBackground images={heroImages} delay={2500} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.logoBlock}>
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Because women travel differently.</Text>
        </View>

        <View style={[styles.bottomBlock, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable onPress={() => router.push('/(onboarding)/create-account')}>
            <Text style={styles.loginText}>Log in</Text>
          </Pressable>
          <PrimaryButton
            label="Create account"
            onPress={() => router.push('/(onboarding)/create-account')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  logoBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  logo: {
    width: 180,
    height: 80,
    tintColor: '#FFFFFF',
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomBlock: {
    paddingHorizontal: spacing.screenX,
    gap: 16,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
```

**Step 2: Verify — run app, confirm welcome screen shows with rotating images**

**Step 3: Commit**

```bash
git add app/\(onboarding\)/welcome.tsx
git commit -m "feat: build welcome screen with rotating hero images"
```

---

## Task 8: Screen 2 — Create Account

**Files:**
- Create: `app/(onboarding)/create-account.tsx`

**Step 1: Build the screen**

White background, stage 1, Instrument Serif headline, email + password fields, orange CTA, "Already have an account? Log in" at bottom.

```typescript
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts, radius, spacing } from '@/constants/design';

export default function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canContinue = email.includes('@') && password.length >= 6;

  const handleContinue = () => {
    onboardingStore.set('email', email);
    onboardingStore.set('password', password);
    router.push('/(onboarding)/profile');
  };

  return (
    <OnboardingScreen
      stage={1}
      headline="Let's get you in."
      subtitle="Travel information designed for how women travel."
      ctaLabel="Create account"
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
      showBack={true}
    >
      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoFocus={false}
        />
      </View>
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Pressable>
          <Text style={styles.loginLink}>Log in</Text>
        </Pressable>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
  },
  input: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  loginLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
```

**Step 2: Verify — navigate from welcome to create-account**

**Step 3: Commit**

```bash
git add app/\(onboarding\)/create-account.tsx
git commit -m "feat: build create account screen"
```

---

## Task 9: Screen 3 — Profile

**Files:**
- Create: `app/(onboarding)/profile.tsx`

This is the most complex screen. Photo circle (104px, camera icon, bottom sheet for pick/take), first name field, popular country pills with native greetings, country search field.

**Step 1: Build the screen**

```typescript
import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { countries } from '@/data/geo';
import { getGreeting } from '@/data/greetings';
import { colors, fonts, radius, spacing } from '@/constants/design';

const POPULAR_COUNTRIES = ['TH', 'JP', 'ID', 'PT', 'IT', 'ES', 'MX', 'KR', 'VN', 'GR'];

export default function ProfileScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const photoScale = useSharedValue(1);

  const filteredCountries = countrySearch.length >= 2
    ? countries.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : [];

  const canContinue = firstName.trim().length > 0 && selectedCountry.length > 0;

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      photoScale.value = withSequence(
        withSpring(0.8, { damping: 15, stiffness: 150 }),
        withSpring(1.05, { damping: 15, stiffness: 150 }),
        withSpring(1, { damping: 15, stiffness: 150 }),
      );
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }
  };

  const handlePhotoPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take photo', 'Choose from library'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) pickImage(true);
          if (index === 2) pickImage(false);
        },
      );
    } else {
      // On Android, default to library
      pickImage(false);
    }
  };

  const handleCountrySelect = (iso2: string) => {
    setSelectedCountry(iso2);
    setCountrySearch('');
  };

  const handleContinue = () => {
    const country = countries.find((c) => c.iso2 === selectedCountry);
    onboardingStore.set('firstName', firstName.trim());
    onboardingStore.set('photoUri', photoUri);
    onboardingStore.set('countryIso2', selectedCountry);
    onboardingStore.set('countryName', country?.name ?? '');
    router.push('/(onboarding)/intent');
  };

  const photoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
  }));

  return (
    <OnboardingScreen
      stage={2}
      headline="Tell us about you"
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
    >
      {/* Photo circle */}
      <View style={styles.photoSection}>
        <Pressable onPress={handlePhotoPress}>
          <Animated.View style={[styles.photoCircle, photoAnimatedStyle]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
            ) : (
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
            )}
          </Animated.View>
        </Pressable>
        {showConfirmation && (
          <Text style={styles.confirmText}>Looking great</Text>
        )}
      </View>

      {/* First name */}
      <TextInput
        style={styles.input}
        placeholder="First name"
        placeholderTextColor={colors.textMuted}
        value={firstName}
        onChangeText={setFirstName}
        autoFocus={false}
      />

      {/* Country section */}
      <Text style={styles.sectionLabel}>Where are you based?</Text>

      {/* Popular country pills */}
      <View style={styles.pillGrid}>
        {POPULAR_COUNTRIES.map((iso2) => {
          const country = countries.find((c) => c.iso2 === iso2);
          if (!country) return null;
          const greeting = getGreeting(iso2);
          return (
            <Pill
              key={iso2}
              label={`${country.flag ?? ''} ${country.name}`}
              subtitle={greeting}
              selected={selectedCountry === iso2}
              onPress={() => handleCountrySelect(iso2)}
            />
          );
        })}
      </View>

      {/* Country search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries..."
          placeholderTextColor={colors.textMuted}
          value={countrySearch}
          onChangeText={setCountrySearch}
          autoFocus={false}
        />
      </View>

      {/* Search results */}
      {filteredCountries.length > 0 && (
        <View style={styles.searchResults}>
          {filteredCountries.slice(0, 6).map((country) => (
            <Pressable
              key={country.iso2}
              style={styles.searchResultItem}
              onPress={() => handleCountrySelect(country.iso2)}
            >
              <Text style={styles.searchResultText}>
                {country.flag ?? ''} {country.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 104,
    height: 104,
  },
  confirmText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  input: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  searchResultText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
```

Note: The content area may need to scroll on this screen due to pills + search. Wrap the `OnboardingScreen` children in a `ScrollView` if content overflows — but try without first since the design says "no screen scrolls". The `OnboardingScreen` shell's content area can be made scrollable if needed by changing the `content` View to a ScrollView.

**Step 2: Install expo-image-picker if not already installed**

Run: `npx expo install expo-image-picker`

**Step 3: Verify — navigate from create-account to profile, test photo pick and country selection**

**Step 4: Commit**

```bash
git add app/\(onboarding\)/profile.tsx package.json package-lock.json
git commit -m "feat: build profile screen with photo upload and country pills"
```

---

## Task 10: Screen 4 — Intent

**Files:**
- Create: `app/(onboarding)/intent.tsx`

**Step 1: Build the screen**

Two option cards, single-select.

```typescript
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

export default function IntentScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'planning' | 'exploring' | ''>('');

  const handleContinue = () => {
    if (!selected) return;
    onboardingStore.set('tripIntent', selected);
    router.push('/(onboarding)/day-style');
  };

  return (
    <OnboardingScreen
      stage={3}
      headline="What brings you to Sola?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        <OptionCard
          title="I'm planning a trip"
          selected={selected === 'planning'}
          onPress={() => setSelected('planning')}
        />
        <OptionCard
          title="Just exploring for now"
          selected={selected === 'exploring'}
          onPress={() => setSelected('exploring')}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
  },
});
```

**Step 2: Commit**

```bash
git add app/\(onboarding\)/intent.tsx
git commit -m "feat: build intent screen"
```

---

## Task 11: Screen 5 — Day Style

**Files:**
- Create: `app/(onboarding)/day-style.tsx`

**Step 1: Build the screen**

Pill grid, multi-select max 2.

```typescript
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  '🏛️ Culture & history',
  '🌿 Nature & outdoors',
  '🍜 Food & markets',
  '🌙 Nightlife & social',
  '🧘 Wellness & relaxation',
  '🧗 Adventure & sports',
  '🛍️ Shopping & fashion',
  '🎨 Art & creativity',
];

export default function DayStyleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (option: string) => {
    setSelected((prev) => {
      if (prev.includes(option)) return prev.filter((o) => o !== option);
      if (prev.length >= 2) return prev;
      return [...prev, option];
    });
  };

  const handleContinue = () => {
    onboardingStore.set('dayStyle', selected);
    router.push('/(onboarding)/priorities');
  };

  return (
    <OnboardingScreen
      stage={3}
      headline="How do you like to spend your days?"
      subtitle="Pick up to 2"
      ctaLabel="Continue"
      ctaDisabled={selected.length === 0}
      onCtaPress={handleContinue}
    >
      <View style={styles.pillGrid}>
        {OPTIONS.map((option) => (
          <Pill
            key={option}
            label={option}
            selected={selected.includes(option)}
            onPress={() => toggle(option)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add app/\(onboarding\)/day-style.tsx
git commit -m "feat: build day style screen"
```

---

## Task 12: Screen 6 — Priorities

**Files:**
- Create: `app/(onboarding)/priorities.tsx`

**Step 1: Build the screen**

Same pattern as day-style, different options.

```typescript
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  '🛡️ Safety & comfort',
  '🤝 Meeting locals',
  '🗺️ Off the beaten path',
  '📸 Great photo spots',
  '💰 Budget-friendly',
  '✨ Luxury experiences',
  '🚶‍♀️ Solo-friendly',
  '👩 Female-friendly spaces',
];

export default function PrioritiesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (option: string) => {
    setSelected((prev) => {
      if (prev.includes(option)) return prev.filter((o) => o !== option);
      if (prev.length >= 2) return prev;
      return [...prev, option];
    });
  };

  const handleContinue = () => {
    onboardingStore.set('priorities', selected);
    router.push('/(onboarding)/stay-preference');
  };

  return (
    <OnboardingScreen
      stage={3}
      headline="What matters most when you travel?"
      subtitle="Pick up to 2"
      ctaLabel="Continue"
      ctaDisabled={selected.length === 0}
      onCtaPress={handleContinue}
    >
      <View style={styles.pillGrid}>
        {OPTIONS.map((option) => (
          <Pill
            key={option}
            label={option}
            selected={selected.includes(option)}
            onPress={() => toggle(option)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add app/\(onboarding\)/priorities.tsx
git commit -m "feat: build priorities screen"
```

---

## Task 13: Screen 7 — Stay Preference

**Files:**
- Create: `app/(onboarding)/stay-preference.tsx`

**Step 1: Build the screen**

Four option cards, single-select.

```typescript
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  'Hostels & social stays',
  'Boutique hotels & B&Bs',
  'Apartments & homestays',
  'Luxury hotels & resorts',
];

export default function StayPreferenceScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    onboardingStore.set('stayPreference', selected);
    router.push('/(onboarding)/spending-style');
  };

  return (
    <OnboardingScreen
      stage={4}
      headline="Where do you like to stay?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option}
            title={option}
            selected={selected === option}
            onPress={() => setSelected(option)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
  },
});
```

**Step 2: Commit**

```bash
git add app/\(onboarding\)/stay-preference.tsx
git commit -m "feat: build stay preference screen"
```

---

## Task 14: Screen 8 — Spending Style

**Files:**
- Create: `app/(onboarding)/spending-style.tsx`

**Step 1: Build the screen**

Three option cards with subtitles, single-select.

```typescript
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  { title: 'Budget', subtitle: 'I stretch every dollar', value: 'budget' },
  { title: 'Mid-range', subtitle: 'Comfortable but not flashy', value: 'mid-range' },
  { title: 'Luxury', subtitle: 'I treat myself', value: 'luxury' },
];

export default function SpendingStyleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    onboardingStore.set('spendingStyle', selected);
    router.push('/(onboarding)/youre-in');
  };

  return (
    <OnboardingScreen
      stage={4}
      headline="What's your travel budget?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={selected === opt.value}
            onPress={() => setSelected(opt.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
  },
});
```

**Step 2: Commit**

```bash
git add app/\(onboarding\)/spending-style.tsx
git commit -m "feat: build spending style screen"
```

---

## Task 15: Screen 9 — You're In

**Files:**
- Create: `app/(onboarding)/youre-in.tsx`

**Step 1: Build the screen**

Full-bleed hero image with dark overlay, all 5 progress segments filled, personalized headline with first name, native greeting if available, orange CTA navigates to tabs.

```typescript
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ProgressBar from '@/components/onboarding/ProgressIndicator';
import { onboardingStore } from '@/state/onboardingStore';
import { getGreeting } from '@/data/greetings';
import { colors, fonts, spacing } from '@/constants/design';

export default function YoureInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const firstName = onboardingStore.get('firstName') || '';
  const countryIso2 = onboardingStore.get('countryIso2');
  const greeting = countryIso2 ? getGreeting(countryIso2) : null;

  const handleFinish = () => {
    onboardingStore.set('onboardingCompleted', true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/pexels-sailing.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.progressRow}>
          <ProgressBar stage={5} />
        </View>

        <View style={styles.center}>
          <Text style={styles.headline}>
            You're in, {firstName}.
          </Text>
          {greeting && (
            <Text style={styles.greeting}>{greeting}</Text>
          )}
          <Text style={styles.subtitle}>Your travel world starts here.</Text>
        </View>

        <View style={[styles.bottomBlock, { paddingBottom: insets.bottom + 24 }]}>
          <PrimaryButton label="Let's go" onPress={handleFinish} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    backgroundColor: colors.overlayDark,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressRow: {
    paddingTop: 16,
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomBlock: {
    paddingHorizontal: spacing.screenX,
  },
});
```

**Step 2: Verify the full flow end-to-end: welcome → create-account → profile → intent → day-style → priorities → stay-preference → spending-style → youre-in → tabs**

**Step 3: Commit**

```bash
git add app/\(onboarding\)/youre-in.tsx
git commit -m "feat: build you're in final screen with personalized greeting"
```

---

## Task 16: Final cleanup and polish

**Files:**
- Possibly modify: multiple files for visual tweaks

**Step 1: Delete unused old font files**

```bash
rm assets/fonts/Inter_18pt-Regular.ttf assets/fonts/Inter_18pt-Medium.ttf assets/fonts/Inter_18pt-SemiBold.ttf assets/fonts/PlayfairDisplay-Bold.ttf
```

**Step 2: Delete any remaining unused components**

If `SecondaryButton.tsx`, `SolaText.tsx`, or `TextField.tsx` are no longer imported anywhere, delete them.

**Step 3: Run the full app and verify**

- All 9 screens render correctly
- Progress bar fills correctly per stage
- Photo upload works with spring animation
- Country pills show native greetings
- Selection states (pills, cards) use orange border + fill
- CTA buttons are disabled until required fields are filled
- Back navigation works on screens 2-8
- "You're in" screen shows personalized name + greeting
- "Let's go" navigates to tabs

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: final cleanup — remove unused fonts and components"
```

---

## Summary

| Task | What | Screens |
|------|------|---------|
| 1 | Add new fonts | — |
| 2 | Update design tokens | — |
| 3 | Rewrite onboardingStore | — |
| 4 | Delete old screens/components | — |
| 5 | Add greetings data | — |
| 6 | Build shared components | — |
| 7 | Welcome screen | Screen 1 |
| 8 | Create Account screen | Screen 2 |
| 9 | Profile screen | Screen 3 |
| 10 | Intent screen | Screen 4 |
| 11 | Day Style screen | Screen 5 |
| 12 | Priorities screen | Screen 6 |
| 13 | Stay Preference screen | Screen 7 |
| 14 | Spending Style screen | Screen 8 |
| 15 | You're In screen | Screen 9 |
| 16 | Final cleanup | — |
