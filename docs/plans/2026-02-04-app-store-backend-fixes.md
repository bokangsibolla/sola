# App Store & Backend Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all backend issues and App Store blockers to prepare Sola for iOS submission, ordered from easiest to hardest.

**Architecture:** This plan addresses: (1) configuration/env issues, (2) EAS submission setup, (3) push notification deployment, (4) activity detail real data integration, (5) SOS tab resolution, (6) offline handling, (7) password reset deep linking.

**Tech Stack:** Expo/React Native, Supabase (Postgres + Edge Functions), EAS Build/Submit

---

## Task 1: Remove Unused Microphone Permission

**Files:**
- Modify: `app.json:17-66` (check iOS infoPlist)

**Step 1: Verify current permissions in app.json**

Check if `NSMicrophoneUsageDescription` exists. If it does, it needs removal since no audio features are implemented.

**Step 2: Check Info.plist directly if needed**

```bash
cat ios/sola/Info.plist | grep -A1 "NSMicrophoneUsageDescription"
```

If present, remove via app.json config or prebuild.

**Step 3: Run prebuild to verify**

```bash
npx expo prebuild --clean
```

**Step 4: Verify permission removed**

```bash
cat ios/sola/Info.plist | grep -A1 "NSMicrophoneUsageDescription"
```
Expected: No output (permission removed)

**Step 5: Commit**

```bash
git add app.json ios/
git commit -m "$(cat <<'EOF'
chore: remove unused microphone permission

Apple may question permissions that aren't used in the app.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Configure EAS Submit Credentials

**Files:**
- Modify: `eas.json:33-45`

**Step 1: Get Apple credentials**

You need:
- `appleId`: Your Apple ID email
- `ascAppId`: App Store Connect App ID (find in App Store Connect → App → General → App Information)
- `appleTeamId`: Your Team ID (find in Apple Developer Portal → Membership)

**Step 2: Update eas.json**

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

**Step 3: Test credentials (dry run)**

```bash
eas submit -p ios --latest --dry-run
```

Expected: Credentials are validated

**Step 4: Commit**

```bash
git add eas.json
git commit -m "$(cat <<'EOF'
chore: configure EAS submit credentials for App Store

Adds Apple ID, ASC App ID, and Team ID for automated submission.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Create Separate .env.local for Scripts

**Files:**
- Create: `.env.local`
- Modify: `.gitignore`
- Modify: `.env`

**Step 1: Create .env.local for server-side keys**

```bash
# .env.local - Server-side only keys (NEVER commit)
# Used by: scripts/, supabase/functions/

SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-key...
PEXELS_API_KEY=your-pexels-key
GOOGLE_PLACES_API_KEY=your-google-places-key
```

**Step 2: Update .env to remove server keys**

```bash
# .env - Client-side keys (safe for build)
EXPO_PUBLIC_SUPABASE_URL=https://bfyewxgdfkmkviajmfzp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon-key...
EXPO_PUBLIC_POSTHOG_KEY=phc_...
```

**Step 3: Add .env.local to .gitignore**

```bash
echo ".env.local" >> .gitignore
```

**Step 4: Update scripts to load .env.local**

Any script using service role key should load from `.env.local`:

```typescript
// At top of script files
import 'dotenv/config'; // loads .env
import { config } from 'dotenv';
config({ path: '.env.local' }); // override with .env.local
```

**Step 5: Verify .env doesn't have service key**

```bash
grep "SERVICE_ROLE" .env
```
Expected: No output

**Step 6: Commit**

```bash
git add .gitignore .env .env.example
git commit -m "$(cat <<'EOF'
security: separate server-side keys into .env.local

Moves SUPABASE_SERVICE_ROLE_KEY and API keys to .env.local
which is gitignored. Prevents accidental exposure in builds.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Deploy Push Notification Edge Function

**Files:**
- Modify: `supabase/migrations/00008_message_push_webhook.sql` (verify)
- Run: Supabase CLI commands

**Step 1: Verify edge function code**

```bash
cat supabase/functions/push-on-message/index.ts
```

Confirm it's complete (already verified - it is).

**Step 2: Deploy the edge function**

```bash
supabase functions deploy push-on-message
```

Expected: Function deployed successfully

**Step 3: Get function URL**

```bash
supabase functions list
```

Note the URL: `https://bfyewxgdfkmkviajmfzp.supabase.co/functions/v1/push-on-message`

**Step 4: Set database app settings for trigger**

The trigger uses `current_setting('app.settings.supabase_url')` and `current_setting('app.settings.service_role_key')`.

Run in Supabase SQL Editor:

```sql
-- Set the function URL base
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://bfyewxgdfkmkviajmfzp.supabase.co';

-- Set the service role key for auth
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

**Step 5: Test push notification**

1. Open app on physical device
2. Ensure push token is registered
3. Send a message from another account
4. Verify push received

**Step 6: Commit (if any migration changes)**

```bash
git add supabase/
git commit -m "$(cat <<'EOF'
feat: deploy push-on-message edge function

Enables push notifications when users receive messages.
Trigger calls edge function which sends via Expo Push API.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Connect Activity Detail to Real Data

**Files:**
- Modify: `app/(tabs)/explore/activity/[slug].tsx`
- Modify: `data/api.ts` (add getActivityBySlug if needed)

**Step 1: Write the API function (if missing)**

Check if `getPlaceBySlug` works for activities. Places with `placeType = 'activity' | 'tour'` are activities.

Add to `data/api.ts`:

```typescript
/**
 * Get an activity (tour/activity place) by slug
 */
export async function getActivityBySlug(slug: string): Promise<Place | undefined> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .in('place_type', ['activity', 'tour'])
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Place>(data) : undefined;
}

/**
 * Get activity with its media and tags
 */
export async function getActivityWithDetails(slug: string): Promise<{
  activity: Place;
  media: PlaceMedia[];
  tags: Tag[];
} | undefined> {
  const activity = await getActivityBySlug(slug);
  if (!activity) return undefined;

  const [media, tags] = await Promise.all([
    getPlaceMedia(activity.id),
    getPlaceTags(activity.id),
  ]);

  return { activity, media, tags };
}
```

**Step 2: Update activity detail screen**

Replace mock data import with real data fetching:

```typescript
// app/(tabs)/explore/activity/[slug].tsx
import { useData } from '@/hooks/useData';
import { getActivityWithDetails, getPlaceFirstImage } from '@/data/api';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, loading, error, refetch } = useData(
    () => getActivityWithDetails(slug ?? ''),
    [slug]
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFoundHeader}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Activity not found</Text>
        </View>
      </View>
    );
  }

  const { activity, media, tags } = data;
  const heroImage = media.find(m => m.mediaType === 'image')?.url;

  // ... rest of render using activity data
}
```

**Step 3: Update rendered content**

Map Place fields to UI:
- `activity.name` → title
- `activity.description` → description
- `activity.whySelected` → "About this experience"
- `activity.estimatedDuration` → duration
- `activity.priceLevel` → price indicator
- `activity.highlights` → "What's included"
- `media[0].url` → hero image

**Step 4: Handle "Check availability" button**

Either:
- A) Remove button if no booking system
- B) Link to `activity.website` if available
- C) Show "Coming soon" alert

```typescript
const handleCheckAvailability = () => {
  if (activity.website) {
    Linking.openURL(activity.website);
  } else {
    Alert.alert('Coming Soon', 'Booking will be available in a future update.');
  }
};
```

**Step 5: Test with real data**

```bash
npx expo start
```

Navigate to Explore → Activity and verify real data displays.

**Step 6: Commit**

```bash
git add app/(tabs)/explore/activity/[slug].tsx data/api.ts
git commit -m "$(cat <<'EOF'
feat(explore): connect activity detail to real Supabase data

Replaces mock data with real places data. Activities are places
with placeType = 'activity' or 'tour'. Check availability links
to website or shows coming soon alert.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Fix SOS Tab (Hide or Implement)

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Optionally modify: `app/(tabs)/sos.tsx`

**Option A: Hide the SOS tab entirely (recommended for MVP)**

**Step 1: Comment out SOS tab in layout**

```typescript
// app/(tabs)/_layout.tsx
<Tabs.Screen
  name="sos"
  options={{
    href: null, // Hide from tab bar
    title: 'SOS',
    tabBarIcon: ({ color }) => <Ionicons name="shield" size={24} color={color} />,
  }}
/>
```

**Step 2: Test tab bar**

Verify SOS tab no longer appears in bottom navigation.

**Step 3: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "$(cat <<'EOF'
chore: hide SOS tab until feature is implemented

Apple rejects apps with placeholder/non-functional tabs.
SOS will be re-enabled when the emergency modal is built.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**Option B: Implement basic SOS modal (if time permits)**

Create a modal that shows:
- Local emergency numbers (from country/city data)
- Embassy contact info
- "Share my location" quick action
- Safety tips

This is more complex and should be a separate task.

---

## Task 7: Add Offline Detection Banner

**Files:**
- Create: `components/OfflineBanner.tsx`
- Create: `hooks/useNetworkStatus.ts`
- Modify: `app/_layout.tsx`

**Step 1: Install NetInfo**

```bash
npx expo install @react-native-community/netinfo
```

**Step 2: Create network status hook**

```typescript
// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOffline: isConnected === false || isInternetReachable === false,
  };
}
```

**Step 3: Create offline banner component**

```typescript
// components/OfflineBanner.tsx
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/design';

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    zIndex: 1000,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
```

**Step 4: Add banner to root layout**

```typescript
// app/_layout.tsx
import OfflineBanner from '@/components/OfflineBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function RootLayout() {
  const { isOffline } = useNetworkStatus();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OfflineBanner visible={isOffline} />
      {/* ... rest of layout */}
    </GestureHandlerRootView>
  );
}
```

**Step 5: Test offline mode**

1. Run app
2. Enable airplane mode
3. Verify banner appears at top
4. Disable airplane mode
5. Verify banner disappears

**Step 6: Commit**

```bash
git add components/OfflineBanner.tsx hooks/useNetworkStatus.ts app/_layout.tsx package.json
git commit -m "$(cat <<'EOF'
feat: add offline detection banner

Shows red banner when device loses internet connection.
Uses @react-native-community/netinfo to monitor connectivity.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Configure Password Reset Deep Linking

**Files:**
- Modify: `app.json` or `app.config.ts`
- Create: `app/(auth)/reset-password.tsx` (if needed)
- Modify: Supabase dashboard settings

**Step 1: Verify URL scheme in app.json**

```json
{
  "expo": {
    "scheme": "sola"
  }
}
```

This enables `sola://` deep links.

**Step 2: Configure Supabase redirect URL**

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `sola://`
- Redirect URLs: Add `sola://reset-password`

**Step 3: Update password reset call with redirect**

```typescript
// In login.tsx, update the resetPasswordForEmail call:
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'sola://reset-password',
});
```

**Step 4: Create reset password screen**

```typescript
// app/(auth)/reset-password.tsx
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing } from '@/constants/design';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = password.length >= 6 && password === confirmPassword && !loading;

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', 'Your password has been reset.', [
      { text: 'OK', onPress: () => router.replace('/(onboarding)/login') },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.headline}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>

      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={loading ? 'Resetting...' : 'Reset Password'}
          onPress={handleReset}
          disabled={!canSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenX,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 32,
  },
  fields: {
    gap: 14,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: 32,
  },
});
```

**Step 5: Add route group for auth screens**

Create `app/(auth)/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
```

**Step 6: Test the flow**

1. Go to login screen
2. Enter email and tap "Forgot password?"
3. Check email for reset link
4. Tap link - should open app to reset-password screen
5. Enter new password
6. Verify password updated

**Step 7: Commit**

```bash
git add app/(auth)/ app/(onboarding)/login.tsx app.json
git commit -m "$(cat <<'EOF'
feat(auth): implement password reset deep linking

Adds reset-password screen that handles sola://reset-password
deep link from password reset email. Updates Supabase call to
include redirectTo parameter.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary: Task Priority Order

| Priority | Task | Difficulty | Time |
|----------|------|------------|------|
| 1 | Remove unused microphone permission | Easy | 5 min |
| 2 | Configure EAS submit credentials | Easy | 10 min |
| 3 | Create .env.local for server keys | Easy | 10 min |
| 4 | Deploy push notification function | Medium | 20 min |
| 5 | Connect activity detail to real data | Medium | 30 min |
| 6 | Fix SOS tab (hide) | Easy | 5 min |
| 7 | Add offline detection banner | Medium | 25 min |
| 8 | Configure password reset deep link | Hard | 45 min |

**Total estimated time: ~2.5 hours**

---

## Verification Checklist

After completing all tasks, verify:

- [ ] `npx expo prebuild --clean` succeeds
- [ ] `eas build -p ios --profile preview` succeeds
- [ ] Push notifications work on physical device
- [ ] Activity detail shows real data from Supabase
- [ ] SOS tab is hidden from navigation
- [ ] Offline banner appears when disconnected
- [ ] Password reset email opens app correctly
- [ ] No service role key in `.env` (only in `.env.local`)
