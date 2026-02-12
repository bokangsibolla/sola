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
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { onboardingStore } from '@/state/onboardingStore';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById, updateProfile } from '@/data/api';
import { getSupportedCurrencies, getSymbol } from '@/lib/currency';
import { getSupportedLanguages, changeLanguage, type SupportedLanguage } from '@/lib/i18n';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import ScreenHeader from '@/components/ui/ScreenHeader';

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

  const { data: profile, refetch: refetchProfile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['profile', userId],
  );

  useEffect(() => {
    posthog.capture('settings_screen_viewed');
  }, [posthog]);

  const [privacy, setPrivacy] = useState(onboardingStore.get('privacyDefaults'));

  const verificationStatus = profile?.verificationStatus || 'unverified';
  const verificationInfo = VERIFICATION_DISPLAY[verificationStatus] || VERIFICATION_DISPLAY.unverified;
  const currentCurrency = profile?.preferredCurrency || 'USD';
  const currentLanguage = (profile?.preferredLanguage || 'en') as SupportedLanguage;

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

  const handleCurrencyPicker = () => {
    const currencies = getSupportedCurrencies();
    const labels = currencies.map((c) => `${c.symbol} ${c.code} \u2014 ${c.label}`);
    const currentIdx = currencies.findIndex((c) => c.code === currentCurrency);

    showPicker('Select Currency', labels, currentIdx, async (i) => {
      const selected = currencies[i].code;
      if (selected === currentCurrency || !userId) return;
      try {
        await updateProfile(userId, { preferredCurrency: selected });
        posthog.capture('currency_changed', { currency: selected });
        refetchProfile();
      } catch (error) {
        Sentry.captureException(error);
      }
    });
  };

  const handleLanguagePicker = () => {
    const languages = getSupportedLanguages();
    const labels = languages.map((l) => l.label);
    const currentIdx = languages.findIndex((l) => l.code === currentLanguage);

    showPicker('Select Language', labels, currentIdx, async (i) => {
      const selected = languages[i].code;
      if (selected === currentLanguage || !userId) return;
      try {
        await changeLanguage(selected);
        await updateProfile(userId, { preferredLanguage: selected });
        posthog.capture('language_changed', { language: selected });
        refetchProfile();
      } catch (error) {
        Sentry.captureException(error);
      }
    });
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
          onboardingStore.reset();
          router.replace('/(onboarding)/welcome');
        },
      },
    ]);
  };

  const languageLabel = getSupportedLanguages().find((l) => l.code === currentLanguage)?.label || 'English';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <ScreenHeader title="Settings" />
      </View>

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

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Preferences</Text>

        <Pressable style={styles.settingRow} onPress={handleCurrencyPicker}>
          <Ionicons name="wallet-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Currency</Text>
          <Text style={styles.settingValue}>{getSymbol(currentCurrency)} {currentCurrency}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable style={styles.settingRow} onPress={handleLanguagePicker}>
          <Ionicons name="language-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.settingLabel}>Language</Text>
          <Text style={styles.settingValue}>{languageLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
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
});
