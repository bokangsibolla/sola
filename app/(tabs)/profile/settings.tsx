import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const VISIBILITY_LABELS = {
  private: 'Only you',
  connections: 'Your connections',
  public: 'Everyone',
} as const;

const PRECISION_LABELS = {
  city: 'City level',
  neighborhood: 'Neighborhood',
  exact: 'Exact location',
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const privacy = onboardingStore.getData().privacyDefaults;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>Privacy & settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Privacy</Text>

        <SettingRow
          icon="person-outline"
          label="Profile visibility"
          value={VISIBILITY_LABELS[privacy.profileVisibility]}
          description="Only you can see your profile."
        />
        <SettingRow
          icon="airplane-outline"
          label="Trip visibility"
          value={VISIBILITY_LABELS[privacy.tripVisibility]}
          description="Your trip details are private."
        />
        <SettingRow
          icon="location-outline"
          label="Location precision"
          value={PRECISION_LABELS[privacy.locationPrecision]}
          description="Your location is shared at city level only."
        />
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Pressable style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <Ionicons name={icon as any} size={18} color={colors.textPrimary} />
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
      <Text style={styles.settingDesc}>{description}</Text>
    </Pressable>
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
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  settingCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  settingLabel: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  settingValue: {
    ...typography.captionSmall,
    color: colors.orange,
  },
  settingDesc: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
