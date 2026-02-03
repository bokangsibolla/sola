import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { useAuth } from '@/state/AuthContext';
import { onboardingStore } from '@/state/onboardingStore';
import { deleteAccount } from '@/data/api';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

// Local color overrides for this screen
const surface = '#F9F9F9';

const CONFIRMATION_TEXT = 'DELETE';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, user, signOut } = useAuth();
  const posthog = usePostHog();

  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmation.toUpperCase() === CONFIRMATION_TEXT;

  const handleDelete = async () => {
    if (!userId || !isConfirmed) return;

    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              posthog.capture('account_deletion_started');

              await deleteAccount(userId);

              posthog.capture('account_deletion_completed');
              posthog.reset();

              // Sign out and clear local state
              await signOut();
              onboardingStore.reset();

              // Navigate to welcome screen
              router.replace('/(onboarding)/welcome');
            } catch (error) {
              setLoading(false);
              console.error('Account deletion failed:', error);
              Alert.alert(
                'Deletion Failed',
                'There was a problem deleting your account. Please try again or contact support.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>Delete Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Warning Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={48} color="#E53E3E" />
        </View>

        {/* Warning Message */}
        <Text style={styles.title}>Delete Your Account?</Text>
        <Text style={styles.description}>
          This will permanently delete your Sola account and all associated data, including:
        </Text>

        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.listText}>Your profile and preferences</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="airplane-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.listText}>All saved trips and itineraries</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="bookmark-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.listText}>Saved places and collections</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.listText}>All messages and conversations</Text>
          </View>
        </View>

        <Text style={styles.warning}>This action cannot be undone.</Text>

        {/* Email Display */}
        {user?.email && (
          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Account email:</Text>
            <Text style={styles.emailValue}>{user.email}</Text>
          </View>
        )}

        {/* Confirmation Input */}
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationLabel}>
            Type <Text style={styles.confirmationHighlight}>{CONFIRMATION_TEXT}</Text> to confirm:
          </Text>
          <TextInput
            style={styles.input}
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder={CONFIRMATION_TEXT}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Delete Button */}
        <Pressable
          style={[
            styles.deleteButton,
            (!isConfirmed || loading) && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={!isConfirmed || loading}
        >
          <Text style={styles.deleteButtonText}>
            {loading ? 'Deleting...' : 'Delete My Account'}
          </Text>
        </Pressable>

        {/* Cancel Link */}
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel and keep my account</Text>
        </Pressable>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  navTitle: {
    ...typography.label,
    color: '#E53E3E',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  listContainer: {
    backgroundColor: surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  listText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  warning: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emailContainer: {
    backgroundColor: surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  emailLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emailValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  confirmationContainer: {
    marginBottom: spacing.xl,
  },
  confirmationLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  confirmationHighlight: {
    fontFamily: fonts.semiBold,
    color: '#E53E3E',
  },
  input: {
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  deleteButton: {
    backgroundColor: '#E53E3E',
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deleteButtonDisabled: {
    backgroundColor: '#E53E3E50',
  },
  deleteButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
