# Verification UX, Notifications & Admin Tab — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace confusing verification alert-on-tap with proactive inline banners, notify users when verification is approved/rejected, and add a dedicated admin tab with dashboard.

**Architecture:** Reusable `VerificationBanner` component placed at 4 gated action points. DB trigger creates notification rows on verification status change. New `admin` tab in the tab bar (conditional on `is_admin`) with dashboard showing pending counts.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres triggers, RLS), Ionicons, PostHog analytics.

---

### Task 1: Create VerificationBanner Component

**Files:**
- Create: `components/VerificationBanner.tsx`

**Step 1: Create the component**

```tsx
// components/VerificationBanner.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface VerificationBannerProps {
  /** Current user's verification status */
  verificationStatus: string;
  /** What feature this gates — e.g. "post", "connect with travelers", "send messages" */
  featureLabel: string;
}

/**
 * Inline banner shown at gated action points for unverified users.
 * Returns null if user is verified.
 */
export function VerificationBanner({ verificationStatus, featureLabel }: VerificationBannerProps) {
  const router = useRouter();

  if (verificationStatus === 'verified') return null;

  const goToVerify = () => router.push('/(tabs)/home/verify' as any);

  if (verificationStatus === 'pending') {
    return (
      <View style={[styles.banner, styles.bannerPending]}>
        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Verification in progress</Text>
          <Text style={styles.subtitle}>
            Your identity is being reviewed. This usually takes 24–48 hours.
          </Text>
        </View>
      </View>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <View style={[styles.banner, styles.bannerRejected]}>
        <Ionicons name="alert-circle-outline" size={20} color={colors.emergency} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Verification not approved</Text>
          <Text style={styles.subtitle}>
            Please try again with a clearer photo.
          </Text>
        </View>
        <Pressable style={styles.actionButton} onPress={goToVerify}>
          <Text style={styles.actionButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // Default: unverified
  return (
    <View style={[styles.banner, styles.bannerUnverified]}>
      <Ionicons name="shield-outline" size={20} color={colors.orange} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.subtitle}>
          Verification is required to {featureLabel}. It helps keep our community safe.
        </Text>
      </View>
      <Pressable style={styles.actionButton} onPress={goToVerify}>
        <Text style={styles.actionButtonText}>Verify Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.card,
    gap: spacing.md,
  },
  bannerUnverified: {
    backgroundColor: colors.orangeFill,
  },
  bannerPending: {
    backgroundColor: colors.neutralFill,
  },
  bannerRejected: {
    backgroundColor: colors.emergencyFill,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'center',
  },
  actionButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/VerificationBanner)'`
Expected: No errors.

**Step 3: Commit**

```bash
git add components/VerificationBanner.tsx
git commit -m "feat: add VerificationBanner component for inline verification gating"
```

---

### Task 2: Add VerificationBanner to Community Composer (new.tsx)

**Files:**
- Modify: `app/(tabs)/discussions/new.tsx`

The banner replaces the entire compose form when user is not verified.

**Step 1: Update discussions/new.tsx**

Changes needed:
1. Import `VerificationBanner` (replace `requireVerification` import)
2. Add verified check — if not verified, render banner instead of the form
3. Remove the `requireVerification` call from `handleSubmit` (line 103)

In the imports section, replace:
```tsx
import { requireVerification } from '@/lib/verification';
```
with:
```tsx
import { VerificationBanner } from '@/components/VerificationBanner';
```

In the `handleSubmit` callback, remove line 103:
```tsx
if (!requireVerification(profile?.verificationStatus || 'unverified', 'post in the community')) return;
```

In the return JSX, after the header `</View>` (line 154) and before the `<ScrollView>` (line 156), add a verification check that replaces the form content:

```tsx
{/* Verification gate */}
{(profile?.verificationStatus ?? 'unverified') !== 'verified' ? (
  <View style={styles.bannerContainer}>
    <VerificationBanner
      verificationStatus={profile?.verificationStatus ?? 'unverified'}
      featureLabel="post in the community"
    />
  </View>
) : (
  <ScrollView ... >
    {/* existing form content */}
  </ScrollView>
)}
```

Add to styles:
```tsx
bannerContainer: {
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: spacing.screenX,
},
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(discussions/new)'`
Expected: No errors.

**Step 3: Commit**

```bash
git add app/\(tabs\)/discussions/new.tsx
git commit -m "feat: replace verification alert with inline banner on community composer"
```

---

### Task 3: Add VerificationBanner to Thread Reply Input

**Files:**
- Modify: `app/(tabs)/discussions/thread/[id].tsx`

Replace the reply text input area with the banner when user is not verified.

**Step 1: Update thread/[id].tsx**

Changes needed:
1. Import `VerificationBanner` (replace `requireVerification` import)
2. Remove the `requireVerification` call from `handleSubmitReply` (line 156)
3. Wrap the reply input container — show banner instead of input when not verified

Replace import:
```tsx
import { requireVerification } from '@/lib/verification';
```
with:
```tsx
import { VerificationBanner } from '@/components/VerificationBanner';
```

Remove from `handleSubmitReply`:
```tsx
if (!requireVerification(userProfile?.verificationStatus || 'unverified', 'reply to discussions')) return;
```

Replace the reply input JSX block (lines 351-377):
```tsx
{/* Reply input */}
{(userProfile?.verificationStatus ?? 'unverified') !== 'verified' ? (
  <View style={[styles.replyInputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
    <VerificationBanner
      verificationStatus={userProfile?.verificationStatus ?? 'unverified'}
      featureLabel="reply to discussions"
    />
  </View>
) : (
  <View style={[styles.replyInputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
    <TextInput
      style={styles.replyInput}
      placeholder="Write an answer..."
      placeholderTextColor={colors.textMuted}
      value={replyText}
      onChangeText={setReplyText}
      multiline
      maxLength={2000}
    />
    <Pressable
      onPress={handleSubmitReply}
      disabled={!replyText.trim() || submitting}
      style={({ pressed }) => [
        styles.sendButton,
        (!replyText.trim() || submitting) && styles.sendButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      {submitting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Feather name="send" size={18} color="#FFFFFF" />
      )}
    </Pressable>
  </View>
)}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(discussions/thread)'`
Expected: No errors.

**Step 3: Commit**

```bash
git add app/\(tabs\)/discussions/thread/\[id\].tsx
git commit -m "feat: replace verification alert with inline banner on thread reply input"
```

---

### Task 4: Add VerificationBanner to Traveler Profile

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx`

Show banner above the bottom action bar. Disable Connect/Message buttons when not verified.

**Step 1: Update travelers/user/[id].tsx**

Changes needed:
1. Import `VerificationBanner` (replace `requireVerification` import)
2. Remove both `requireVerification` calls (lines 83, 129)
3. Add banner + disable buttons in the bottom bar

Replace import:
```tsx
import { requireVerification } from '@/lib/verification';
```
with:
```tsx
import { VerificationBanner } from '@/components/VerificationBanner';
```

Remove from `handleConnect` (line 83):
```tsx
if (!requireVerification(userProfile?.verificationStatus || 'unverified', 'connect with travelers')) return;
```

Remove from `handleMessage` (line 129):
```tsx
if (!requireVerification(userProfile?.verificationStatus || 'unverified', 'send messages')) return;
```

Add a computed variable near line 66 (after `const showExtended`):
```tsx
const isVerified = (userProfile?.verificationStatus ?? 'unverified') === 'verified';
```

In the bottom bar JSX (lines 404-458), add the banner above the existing content and disable buttons:

```tsx
{/* Connection Bottom Bar */}
<View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
  {!isVerified && (
    <View style={{ marginBottom: spacing.md }}>
      <VerificationBanner
        verificationStatus={userProfile?.verificationStatus ?? 'unverified'}
        featureLabel="connect with travelers"
      />
    </View>
  )}
  {status === 'none' && (
    <View>
      <Pressable
        style={[styles.connectButton, (actionLoading || !isVerified) && { opacity: 0.4 }]}
        onPress={handleConnect}
        disabled={actionLoading || !isVerified}
      >
        <Feather name="user-plus" size={18} color={colors.background} />
        <Text style={styles.connectButtonText}>Connect</Text>
      </Pressable>
      {contextLabel && (
        <Text style={styles.connectContext}>{contextLabel}</Text>
      )}
    </View>
  )}
  {/* ... rest of status states unchanged ... */}
  {status === 'connected' && (
    <Pressable
      style={[styles.messageButton, (actionLoading || !isVerified) && { opacity: 0.4 }]}
      onPress={handleMessage}
      disabled={actionLoading || !isVerified}
    >
      <Feather name="message-circle" size={18} color={colors.background} />
      <Text style={styles.messageButtonText}>
        {actionLoading ? 'Opening...' : 'Message'}
      </Text>
    </Pressable>
  )}
</View>
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(travelers/user)'`
Expected: No errors.

**Step 3: Commit**

```bash
git add app/\(tabs\)/travelers/user/\[id\].tsx
git commit -m "feat: replace verification alerts with inline banner on traveler profile"
```

---

### Task 5: DB Migration — Verification Notification Types + Trigger

**Files:**
- Create: `supabase/migrations/20260224_verification_notifications.sql`

**Step 1: Write the migration**

```sql
-- 20260224_verification_notifications.sql
-- Adds notification types for verification outcomes and a trigger to create them.

-- 1. Expand the CHECK constraint on notifications.type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'community_reply',
    'connection_request',
    'connection_accepted',
    'new_message',
    'admin_announcement',
    'verification_approved',
    'verification_rejected'
  )
);

-- 2. Trigger function: fires when verification_status changes to 'verified' or 'rejected'
CREATE OR REPLACE FUNCTION notify_on_verification_decision()
RETURNS trigger AS $$
BEGIN
  -- Only fire when status actually changed
  IF OLD.verification_status IS NOT DISTINCT FROM NEW.verification_status THEN
    RETURN NEW;
  END IF;

  IF NEW.verification_status = 'verified' THEN
    INSERT INTO notifications (user_id, type, title, body, actor_id)
    VALUES (
      NEW.id,
      'verification_approved',
      'Your identity has been verified',
      'You can now post, connect, and message other travelers.',
      NEW.verification_reviewed_by
    );
  ELSIF NEW.verification_status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, body, target_type, target_id, actor_id)
    VALUES (
      NEW.id,
      'verification_rejected',
      'Verification update',
      'Your identity verification wasn''t approved. You can try again with a clearer photo.',
      'profile',
      NEW.id,
      NEW.verification_reviewed_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to profiles table
DROP TRIGGER IF EXISTS trigger_notify_verification_decision ON profiles;
CREATE TRIGGER trigger_notify_verification_decision
  AFTER UPDATE OF verification_status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_verification_decision();
```

**Step 2: Apply the migration**

```bash
source .env
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.bfyewxgdfkmkviajmfzp.supabase.co:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260224_verification_notifications.sql
```

Expected: `ALTER TABLE`, `CREATE FUNCTION`, `CREATE TRIGGER` — no errors.

**Step 3: Commit**

```bash
git add supabase/migrations/20260224_verification_notifications.sql
git commit -m "feat: add verification notification types and DB trigger"
```

---

### Task 6: Update TypeScript Notification Types

**Files:**
- Modify: `data/notifications/types.ts`

**Step 1: Add new notification types**

Update the `NotificationType` union:
```tsx
export type NotificationType =
  | 'community_reply'
  | 'connection_request'
  | 'connection_accepted'
  | 'new_message'
  | 'admin_announcement'
  | 'verification_approved'
  | 'verification_rejected';
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(notifications/types)'`
Expected: No errors.

**Step 3: Commit**

```bash
git add data/notifications/types.ts
git commit -m "feat: add verification notification types to TypeScript types"
```

---

### Task 7: Create Admin Tab Layout + Dashboard

**Files:**
- Create: `app/(tabs)/admin/_layout.tsx`
- Create: `app/(tabs)/admin/index.tsx`
- Create: `data/admin/adminApi.ts`

**Step 1: Create admin API functions**

```tsx
// data/admin/adminApi.ts
import { supabase } from '@/lib/supabase';

/** Count of items needing admin attention */
export interface AdminPendingCounts {
  verifications: number;
  contentReports: number;
  userReports: number;
  total: number;
}

export async function getAdminPendingCounts(): Promise<AdminPendingCounts> {
  const [vResult, crResult, urResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('content_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('user_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const verifications = vResult.count ?? 0;
  const contentReports = crResult.count ?? 0;
  const userReports = urResult.count ?? 0;

  return {
    verifications,
    contentReports,
    userReports,
    total: verifications + contentReports + userReports,
  };
}
```

**Step 2: Create the stack layout**

```tsx
// app/(tabs)/admin/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="verifications" />
      <Stack.Screen name="content-reports" />
      <Stack.Screen name="user-reports" />
    </Stack>
  );
}
```

**Step 3: Create the dashboard screen**

```tsx
// app/(tabs)/admin/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { getAdminPendingCounts, type AdminPendingCounts } from '@/data/admin/adminApi';

interface SectionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  count: number;
  onPress: () => void;
}

function SectionCard({ icon, title, subtitle, count, onPress }: SectionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={22} color={colors.orange} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [counts, setCounts] = useState<AdminPendingCounts>({
    verifications: 0,
    contentReports: 0,
    userReports: 0,
    total: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await getAdminPendingCounts();
      setCounts(data);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCounts();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Admin" variant="tabRoot" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.orange} />
        }
      >
        <SectionCard
          icon="shield-checkmark-outline"
          title="Verification Queue"
          subtitle="Pending identity reviews"
          count={counts.verifications}
          onPress={() => router.push('/(tabs)/admin/verifications' as any)}
        />
        <SectionCard
          icon="flag-outline"
          title="Content Reports"
          subtitle="Flagged posts and replies"
          count={counts.contentReports}
          onPress={() => router.push('/(tabs)/admin/content-reports' as any)}
        />
        <SectionCard
          icon="person-circle-outline"
          title="User Reports"
          subtitle="Reported user accounts"
          count={counts.userReports}
          onPress={() => router.push('/(tabs)/admin/user-reports' as any)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(admin/)' | grep -v node_modules`
Expected: No errors.

**Step 5: Commit**

```bash
git add data/admin/adminApi.ts app/\(tabs\)/admin/_layout.tsx app/\(tabs\)/admin/index.tsx
git commit -m "feat: add admin tab layout and dashboard screen with pending counts"
```

---

### Task 8: Move Verification Screen to Admin Tab

**Files:**
- Create: `app/(tabs)/admin/verifications.tsx`
- Modify: `app/(tabs)/home/settings.tsx` (remove admin section)

**Step 1: Create admin/verifications.tsx**

Copy the content from `app/(tabs)/home/admin-verifications.tsx` into `app/(tabs)/admin/verifications.tsx`. Change the `NavigationHeader` to reference "Admin" as the parent:

```tsx
<NavigationHeader title="Review Verifications" parentTitle="Admin" />
```

Everything else stays the same — the component, imports, styles, and logic are identical.

**Step 2: Remove admin section from settings.tsx**

In `app/(tabs)/home/settings.tsx`, remove lines 253-267 (the admin section):
```tsx
{/* Admin */}
{profile?.isAdmin && (
  <>
    <Text style={styles.sectionTitle}>Admin</Text>
    <Pressable
      style={styles.settingRow}
      onPress={() => router.push('/(tabs)/home/admin-verifications' as any)}
    >
      <Ionicons name="shield-checkmark-outline" size={18} color={colors.orange} />
      <Text style={styles.settingLabel}>Review Verifications</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
    <View style={{ height: spacing.xxl }} />
  </>
)}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(admin/verifications|home/settings)' | grep -v node_modules`
Expected: No errors.

**Step 4: Commit**

```bash
git add app/\(tabs\)/admin/verifications.tsx app/\(tabs\)/home/settings.tsx
git commit -m "feat: move verification review to admin tab, remove from settings"
```

---

### Task 9: Create Content Reports Screen

**Files:**
- Create: `app/(tabs)/admin/content-reports.tsx`
- Modify: `data/admin/adminApi.ts` (add getContentReports, resolveContentReport)

**Step 1: Add API functions**

Add to `data/admin/adminApi.ts`:

```tsx
export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'thread' | 'reply';
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export async function getContentReports(): Promise<ContentReport[]> {
  const { data, error } = await supabase
    .from('content_reports')
    .select(`
      id, reporter_id, target_type, target_id, reason, details, status, created_at,
      profiles:reporter_id(first_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.profiles?.first_name ?? 'Unknown',
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function resolveContentReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  const { error } = await supabase
    .from('content_reports')
    .update({ status })
    .eq('id', reportId);

  if (error) throw error;
}
```

**Step 2: Create the screen**

```tsx
// app/(tabs)/admin/content-reports.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { formatTimeAgo } from '@/utils/timeAgo';
import { getContentReports, resolveContentReport, type ContentReport } from '@/data/admin/adminApi';

function ReportCard({
  item,
  onResolve,
  onDismiss,
  busy,
}: {
  item: ContentReport;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  busy: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.reasonBadge}>
          <Text style={styles.reasonText}>{item.reason.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.cardTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.cardLabel}>
        {item.targetType === 'thread' ? 'Thread' : 'Reply'} reported by {item.reporterName}
      </Text>
      {item.details && <Text style={styles.cardDetails}>{item.details}</Text>}
      <View style={styles.cardActions}>
        <Pressable
          style={[styles.actionBtn, styles.resolveBtn]}
          onPress={() => onResolve(item.id)}
          disabled={busy}
        >
          <Text style={styles.actionBtnText}>Remove Content</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.dismissBtn]}
          onPress={() => onDismiss(item.id)}
          disabled={busy}
        >
          <Text style={styles.dismissBtnText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ContentReportsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await getContentReports();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleResolve = async (id: string) => {
    setBusyId(id);
    try {
      await resolveContentReport(id, 'resolved');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      Alert.alert('Error', 'Could not resolve report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setBusyId(id);
    try {
      await resolveContentReport(id, 'dismissed');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      Alert.alert('Error', 'Could not dismiss report.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Content Reports" parentTitle="Admin" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard item={item} onResolve={handleResolve} onDismiss={handleDismiss} busy={busyId === item.id} />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No pending reports</Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetch(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reasonBadge: {
    backgroundColor: colors.warningFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  reasonText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.warning,
    textTransform: 'uppercase',
  },
  cardTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  cardLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  cardDetails: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  resolveBtn: { backgroundColor: colors.emergency },
  dismissBtn: { borderWidth: 1, borderColor: colors.borderDefault },
  actionBtnText: { fontFamily: fonts.semiBold, fontSize: 13, color: '#FFFFFF' },
  dismissBtnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: spacing.xxxxl, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary, marginTop: spacing.md },
});
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(admin/content-reports|admin/adminApi)' | grep -v node_modules`
Expected: No errors.

**Step 4: Commit**

```bash
git add data/admin/adminApi.ts app/\(tabs\)/admin/content-reports.tsx
git commit -m "feat: add content reports screen for admin tab"
```

---

### Task 10: Create User Reports Screen

**Files:**
- Create: `app/(tabs)/admin/user-reports.tsx`
- Modify: `data/admin/adminApi.ts` (add getUserReports, resolveUserReport)

**Step 1: Add API functions**

Add to `data/admin/adminApi.ts`:

```tsx
export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export async function getUserReports(): Promise<UserReport[]> {
  const { data, error } = await supabase
    .from('user_reports')
    .select(`
      id, reporter_id, reported_id, reason, details, status, created_at,
      reporter:reporter_id(first_name),
      reported:reported_id(first_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.reporter?.first_name ?? 'Unknown',
    reportedId: row.reported_id,
    reportedName: row.reported?.first_name ?? 'Unknown',
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function resolveUserReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  const { error } = await supabase
    .from('user_reports')
    .update({ status })
    .eq('id', reportId);

  if (error) throw error;
}
```

**Step 2: Create the screen**

Same pattern as content-reports.tsx but for user reports. Key differences:
- Shows "User reported by {reporterName}: {reportedName}"
- Actions: "Warn User" (resolved) and "Dismiss"

```tsx
// app/(tabs)/admin/user-reports.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { formatTimeAgo } from '@/utils/timeAgo';
import { getUserReports, resolveUserReport, type UserReport } from '@/data/admin/adminApi';

function ReportCard({
  item,
  onResolve,
  onDismiss,
  busy,
}: {
  item: UserReport;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  busy: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.reasonBadge}>
          <Text style={styles.reasonText}>{item.reason.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.cardTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.cardLabel}>
        {item.reportedName} reported by {item.reporterName}
      </Text>
      {item.details && <Text style={styles.cardDetails}>{item.details}</Text>}
      <View style={styles.cardActions}>
        <Pressable
          style={[styles.actionBtn, styles.resolveBtn]}
          onPress={() => onResolve(item.id)}
          disabled={busy}
        >
          <Text style={styles.actionBtnText}>Resolve</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.dismissBtn]}
          onPress={() => onDismiss(item.id)}
          disabled={busy}
        >
          <Text style={styles.dismissBtnText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function UserReportsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getUserReports();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async (id: string) => {
    setBusyId(id);
    try {
      await resolveUserReport(id, 'resolved');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      Alert.alert('Error', 'Could not resolve report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setBusyId(id);
    try {
      await resolveUserReport(id, 'dismissed');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      Alert.alert('Error', 'Could not dismiss report.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="User Reports" parentTitle="Admin" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard item={item} onResolve={handleResolve} onDismiss={handleDismiss} busy={busyId === item.id} />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No pending reports</Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchData(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reasonBadge: {
    backgroundColor: colors.warningFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  reasonText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.warning,
    textTransform: 'uppercase',
  },
  cardTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  cardLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  cardDetails: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  resolveBtn: { backgroundColor: colors.orange },
  dismissBtn: { borderWidth: 1, borderColor: colors.borderDefault },
  actionBtnText: { fontFamily: fonts.semiBold, fontSize: 13, color: '#FFFFFF' },
  dismissBtnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: spacing.xxxxl, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary, marginTop: spacing.md },
});
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(admin/user-reports|admin/adminApi)' | grep -v node_modules`
Expected: No errors.

**Step 4: Commit**

```bash
git add data/admin/adminApi.ts app/\(tabs\)/admin/user-reports.tsx
git commit -m "feat: add user reports screen for admin tab"
```

---

### Task 11: Wire Admin Tab into Tab Bar + Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `components/TabBar.tsx`

This is the critical integration task. The admin tab should only appear when the user is an admin.

**Step 1: Update _layout.tsx**

Add the admin tab to the Tabs component. It will always be declared but the TabBar will conditionally render it.

```tsx
// app/(tabs)/_layout.tsx
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
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="discussions" options={{ title: 'Discussions' }} />
      <Tabs.Screen name="travelers" options={{ title: 'Travelers' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', href: null }} />
    </Tabs>
  );
}
```

Note: `href: null` hides the tab from default tab bar rendering — our custom TabBar controls visibility.

**Step 2: Update TabBar.tsx**

Changes:
1. Add admin icons to TAB_ICONS / TAB_ICONS_ACTIVE
2. Fetch profile to check `isAdmin`
3. Add `useAdminPendingCount` hook call (conditionally)
4. Filter out admin tab for non-admin users
5. Show count badge on admin tab

```tsx
// Add to icon maps:
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  discover: 'search-outline',
  discussions: 'newspaper-outline',
  travelers: 'people-outline',
  trips: 'airplane-outline',
  admin: 'shield-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  discover: 'search',
  discussions: 'newspaper',
  travelers: 'people',
  trips: 'airplane',
  admin: 'shield',
};
```

Add imports:
```tsx
import { useData } from '@/hooks/useData';
import { getProfileById } from '@/data/api';
import { getAdminPendingCounts } from '@/data/admin/adminApi';
```

In the TabBar component, add profile + admin count fetching:
```tsx
const { data: profile } = useData(
  () => userId ? getProfileById(userId) : Promise.resolve(null),
  ['profile', userId],
);
const isAdmin = profile?.isAdmin === true;

const [adminCount, setAdminCount] = useState(0);
useEffect(() => {
  if (!isAdmin) return;
  getAdminPendingCounts()
    .then((c) => setAdminCount(c.total))
    .catch(() => {});
}, [isAdmin]);
```

Filter routes before rendering:
```tsx
const visibleRoutes = state.routes.filter((route) => {
  if (route.name === 'admin') return isAdmin;
  return true;
});
```

Update the badge logic in the map to handle admin:
```tsx
{visibleRoutes.map((route) => {
  const index = state.routes.indexOf(route);
  // ... existing logic ...
  const showBadge =
    (route.name === 'discussions' && discussionsHasNew && !isFocused) ||
    (route.name === 'admin' && adminCount > 0 && !isFocused);

  return (
    <TabItem
      key={route.key}
      isFocused={isFocused}
      routeName={route.name}
      label={label}
      onPress={onPress}
      onLongPress={onLongPress}
      showBadge={showBadge}
      badgeCount={route.name === 'admin' ? adminCount : undefined}
    />
  );
})}
```

Update TabItem to support count badge:
```tsx
interface TabItemProps {
  isFocused: boolean;
  routeName: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  showBadge: boolean;
  badgeCount?: number;
}

function TabItem({ isFocused, routeName, label, onPress, onLongPress, showBadge, badgeCount }: TabItemProps) {
  // ... existing icon logic ...
  return (
    <Pressable ...>
      <View style={styles.iconContainer}>
        <Ionicons ... />
        {showBadge && badgeCount != null && badgeCount > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </View>
        ) : showBadge ? (
          <View style={styles.badge} />
        ) : null}
      </View>
    </Pressable>
  );
}
```

Add new styles:
```tsx
countBadge: {
  position: 'absolute',
  top: 4,
  right: 2,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: colors.emergency,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4,
},
countBadgeText: {
  fontFamily: fonts.semiBold,
  fontSize: 10,
  color: '#FFFFFF',
},
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(TabBar|_layout)' | grep -v node_modules`
Expected: No errors.

**Step 4: Commit**

```bash
git add app/\(tabs\)/_layout.tsx components/TabBar.tsx
git commit -m "feat: wire admin tab into tab bar with conditional visibility and count badge"
```

---

### Task 12: Clean Up — Delete Old Admin Verifications Screen

**Files:**
- Delete: `app/(tabs)/home/admin-verifications.tsx` (moved to `admin/verifications.tsx`)

**Step 1: Verify the new path works**

Check that `admin/verifications.tsx` exists and has correct imports.

**Step 2: Delete the old file**

```bash
git rm app/\(tabs\)/home/admin-verifications.tsx
```

**Step 3: Search for any remaining references**

Run: `grep -r "admin-verifications" app/ components/ data/`
Expected: No results (all references removed in Task 8).

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors.

**Step 5: Commit**

```bash
git commit -m "chore: remove old admin-verifications screen (moved to admin tab)"
```

---

### Task 13: Final Verification

**Step 1: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | grep -v 'scripts/content' | grep -v 'supabase/functions'
```
Expected: No new errors.

**Step 2: Verify all files exist**

```bash
ls -la components/VerificationBanner.tsx
ls -la app/\(tabs\)/admin/_layout.tsx
ls -la app/\(tabs\)/admin/index.tsx
ls -la app/\(tabs\)/admin/verifications.tsx
ls -la app/\(tabs\)/admin/content-reports.tsx
ls -la app/\(tabs\)/admin/user-reports.tsx
ls -la data/admin/adminApi.ts
ls -la supabase/migrations/20260224_verification_notifications.sql
```

**Step 3: Test on device**

Start Metro and test:
- As non-admin user: 5 tabs only (Home, Discover, Discussions, Travelers, Trips)
- As admin user: 6 tabs including Admin with shield icon
- Go to Discussions > New Post as unverified: should see VerificationBanner instead of form
- Go to Travelers > user profile as unverified: should see banner + disabled buttons
- Go to thread detail as unverified: should see banner replacing reply input
