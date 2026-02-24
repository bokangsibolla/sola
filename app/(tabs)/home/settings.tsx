import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
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
import { useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { onboardingStore } from '@/state/onboardingStore';
import { clearLocalData } from '@/lib/clearLocalData';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById, updateProfile } from '@/data/api';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';


const PRIVACY_POLICY_URL = 'https://solatravel.app/privacy';
const TERMS_URL = 'https://solatravel.app/terms';

const VISIBILITY_OPTIONS = ['Private', 'Connections', 'Public'] as const;
const VISIBILITY_VALUES = ['private', 'connections', 'public'] as const;

const VISIBILITY_LABELS: Record<string, string> = {
  private: 'Private',
  connections: 'Connections',
  public: 'Public',
};

const VERIFICATION_DISPLAY: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  verified: { label: 'Verified', color: colors.greenSoft, icon: 'shield-checkmark' },
  pending: { label: 'Under Review', color: colors.orange, icon: 'time-outline' },
  rejected: { label: 'Retry Verification', color: colors.emergency, icon: 'alert-circle-outline' },
  unverified: { label: 'Not Verified', color: colors.textMuted, icon: 'shield-outline' },
};

function showPicker(
  title: string,
  options: readonly string[],
  currentIndex: number,
  onSelect: (index: number) => void,
) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: ['Cancel', ...options],
        cancelButtonIndex: 0,
        destructiveButtonIndex: undefined,
      },
      (buttonIndex) => {
        if (buttonIndex > 0) onSelect(buttonIndex - 1);
      },
    );
  } else {
    Alert.alert(
      title,
      undefined,
      [
        ...options.map((label, i) => ({
          text: label,
          onPress: () => onSelect(i),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  }
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, signOut } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const { data: profile, refetch: refetchProfile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['profile', userId],
  );

  useEffect(() => {
    posthog.capture('settings_screen_viewed');
  }, [posthog]);

  const [privacy, setPrivacy] = useState(onboardingStore.get('privacyDefaults'));

  // Emergency contact state
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecRelationship, setEcRelationship] = useState('');
  const [ecEditing, setEcEditing] = useState(false);
  const [ecSaving, setEcSaving] = useState(false);

  // Sync emergency contact from profile
  useEffect(() => {
    if (profile) {
      setEcName(profile.emergencyContactName ?? '');
      setEcPhone(profile.emergencyContactPhone ?? '');
      setEcRelationship(profile.emergencyContactRelationship ?? '');
    }
  }, [profile]);

  const hasEmergencyContact = Boolean(ecName && ecPhone);

  const handleSaveEmergencyContact = async () => {
    if (!userId || !ecName.trim() || !ecPhone.trim()) return;
    setEcSaving(true);
    try {
      await updateProfile(userId, {
        emergencyContactName: ecName.trim(),
        emergencyContactPhone: ecPhone.trim(),
        emergencyContactRelationship: ecRelationship || null,
      });
      posthog.capture('emergency_contact_saved');
      setEcEditing(false);
      refetchProfile();
    } catch (error) {
      Sentry.captureException(error);
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setEcSaving(false);
    }
  };

  const handleClearEmergencyContact = () => {
    Alert.alert('Remove emergency contact?', 'You can add one again anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (!userId) return;
          try {
            await updateProfile(userId, {
              emergencyContactName: null,
              emergencyContactPhone: null,
              emergencyContactRelationship: null,
            });
            setEcName('');
            setEcPhone('');
            setEcRelationship('');
            setEcEditing(false);
            posthog.capture('emergency_contact_removed');
            refetchProfile();
          } catch (error) {
            Sentry.captureException(error);
          }
        },
      },
    ]);
  };

  const verificationStatus = profile?.verificationStatus || 'unverified';
  const verificationInfo = VERIFICATION_DISPLAY[verificationStatus] || VERIFICATION_DISPLAY.unverified;

  const updatePrivacy = (
    key: keyof typeof privacy,
    values: readonly string[],
    index: number,
  ) => {
    const updated = { ...privacy, [key]: values[index] };
    setPrivacy(updated);
    posthog.capture('privacy_setting_changed', { setting: key, value: values[index] });
    onboardingStore.set('privacyDefaults', updated as typeof privacy);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          posthog.capture('logout');
          posthog.reset();
          await signOut();
          queryClient.clear();
          await clearLocalData('logout');
          router.replace('/(onboarding)/welcome' as any);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Settings" parentTitle="Profile" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Verification */}
        <Text style={styles.sectionTitle}>Verification</Text>

        <Pressable
          style={styles.settingRow}
          onPress={() => router.push('/(tabs)/home/verify' as any)}
        >
          <Ionicons name={verificationInfo.icon} size={18} color={verificationInfo.color} />
          <Text style={styles.settingLabel}>Identity Verification</Text>
          <Text style={[styles.settingValue, { color: verificationInfo.color }]}>
            {verificationInfo.label}
          </Text>
          {verificationStatus !== 'verified' && (
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          )}
        </Pressable>

        {/* Emergency Contact */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Emergency contact</Text>

        {!ecEditing && hasEmergencyContact ? (
          <View style={styles.ecCard}>
            <View style={styles.ecCardHeader}>
              <View style={styles.ecCardInfo}>
                <Text style={styles.ecCardName}>{ecName}</Text>
                {ecRelationship ? (
                  <Text style={styles.ecCardRelationship}>
                    {ecRelationship}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.ecCardPhone}>{ecPhone}</Text>
            </View>
            <View style={styles.ecCardActions}>
              <Pressable
                style={styles.ecEditBtn}
                onPress={() => setEcEditing(true)}
              >
                <Text style={styles.ecEditBtnText}>Edit</Text>
              </Pressable>
              <Pressable
                style={styles.ecRemoveBtn}
                onPress={handleClearEmergencyContact}
              >
                <Text style={styles.ecRemoveBtnText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.ecForm}>
            <TextInput
              style={styles.ecInput}
              placeholder="Name"
              placeholderTextColor={colors.textMuted}
              value={ecName}
              onChangeText={setEcName}
              onFocus={() => setEcEditing(true)}
            />
            <TextInput
              style={styles.ecInput}
              placeholder="Relationship (e.g. friend, sister, partner)"
              placeholderTextColor={colors.textMuted}
              value={ecRelationship}
              onChangeText={setEcRelationship}
              onFocus={() => setEcEditing(true)}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.ecInput}
              placeholder="Phone (with country code, e.g. +1...)"
              placeholderTextColor={colors.textMuted}
              value={ecPhone}
              onChangeText={setEcPhone}
              keyboardType="phone-pad"
              onFocus={() => setEcEditing(true)}
            />
            {ecEditing && (
              <View style={styles.ecFormActions}>
                <Pressable
                  style={[
                    styles.ecSaveBtn,
                    (!ecName.trim() || !ecPhone.trim()) && styles.ecSaveBtnDisabled,
                  ]}
                  onPress={handleSaveEmergencyContact}
                  disabled={!ecName.trim() || !ecPhone.trim() || ecSaving}
                >
                  <Text style={styles.ecSaveBtnText}>
                    {ecSaving ? 'Saving...' : 'Save contact'}
                  </Text>
                </Pressable>
                {hasEmergencyContact && (
                  <Pressable
                    style={styles.ecCancelBtn}
                    onPress={() => {
                      setEcName(profile?.emergencyContactName ?? '');
                      setEcPhone(profile?.emergencyContactPhone ?? '');
                      setEcRelationship(profile?.emergencyContactRelationship ?? '');
                      setEcEditing(false);
                    }}
                  >
                    <Text style={styles.ecCancelBtnText}>Cancel</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        <Text style={styles.ecHint}>
          Shown on your trip safety cards for quick access
        </Text>

        {/* Privacy */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Privacy</Text>

        <Pressable
          style={styles.settingRow}
          onPress={() =>
            showPicker(
              'Profile visibility',
              VISIBILITY_OPTIONS,
              VISIBILITY_VALUES.indexOf(privacy.profileVisibility),
              (i) => updatePrivacy('profileVisibility', VISIBILITY_VALUES, i),
            )
          }
        >
          <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Profile visibility</Text>
          <Text style={styles.settingValue}>{VISIBILITY_LABELS[privacy.profileVisibility]}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.settingRow}
          onPress={() =>
            showPicker(
              'Trip visibility',
              VISIBILITY_OPTIONS,
              VISIBILITY_VALUES.indexOf(privacy.tripVisibility),
              (i) => updatePrivacy('tripVisibility', VISIBILITY_VALUES, i),
            )
          }
        >
          <Ionicons name="airplane-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Trip visibility</Text>
          <Text style={styles.settingValue}>{VISIBILITY_LABELS[privacy.tripVisibility]}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        {/* About */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>About</Text>

        <View style={styles.settingRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>About Sola</Text>
          <Text style={styles.settingValue}>Women-first solo travel</Text>
        </View>

        <View style={styles.settingRow}>
          <Ionicons name="code-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        {/* Legal */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Legal</Text>

        <Pressable
          style={styles.settingRow}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.settingRow}
          onPress={() => Linking.openURL(TERMS_URL)}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        {/* Account */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Account</Text>

        <Pressable
          style={styles.settingRow}
          onPress={() => router.push('/(tabs)/home/delete-account')}
        >
          <Ionicons name="trash-outline" size={18} color="#E53E3E" />
          <Text style={[styles.settingLabel, { color: '#E53E3E' }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        {/* Danger zone */}
        <View style={{ marginTop: spacing.xl }}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  settingValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  logoutButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#E53E3E',
  },

  // Emergency contact
  ecCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  ecCardHeader: {
    gap: spacing.xs,
  },
  ecCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ecCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  ecCardRelationship: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.greenSoft,
    backgroundColor: colors.greenFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  ecCardPhone: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ecCardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  ecEditBtn: {
    paddingVertical: spacing.xs,
  },
  ecEditBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  ecRemoveBtn: {
    paddingVertical: spacing.xs,
  },
  ecRemoveBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  ecForm: {
    gap: spacing.sm,
  },
  ecInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  ecFormActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ecSaveBtn: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  ecSaveBtnDisabled: {
    opacity: 0.4,
  },
  ecSaveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  ecCancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ecCancelBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  ecHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
