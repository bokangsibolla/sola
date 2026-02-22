import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import StyleTagPicker from '@/components/trips/StyleTagPicker';
import { useTripDetail, useNotificationSettings } from '@/data/trips/useTripDetail';
import { updateTrip, upsertTripNotificationSettings, deleteTrip } from '@/data/trips/tripApi';
import { formatDate } from '@/data/trips/helpers';
import type { PrivacyLevel, TripNotificationSettings } from '@/data/trips/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

// ── Privacy option config ───────────────────────────────────────────────────

const PRIVACY_OPTIONS: { key: PrivacyLevel; label: string; description: string }[] = [
  {
    key: 'private',
    label: 'Private',
    description: 'Only you can see this trip.',
  },
  {
    key: 'friends',
    label: 'Friends',
    description: 'Visible to your connections on Sola.',
  },
  {
    key: 'public',
    label: 'Public',
    description: 'Anyone on Sola can discover this trip.',
  },
];

// ── Screen ──────────────────────────────────────────────────────────────────

export default function TripSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { trip, loading: tripLoading, refetchTrip } = useTripDetail(id);
  const { settings: notifSettings, loading: notifLoading, refetch: refetchNotif } =
    useNotificationSettings(id);

  // ── Local state ─────────────────────────────────────────────────────────────

  const [title, setTitle] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('private');
  const [matchingOptIn, setMatchingOptIn] = useState(false);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Notification toggles
  const [morningSummary, setMorningSummary] = useState(true);
  const [stopReminders, setStopReminders] = useState(true);
  const [eveningJournal, setEveningJournal] = useState(true);
  const [departureAlerts, setDepartureAlerts] = useState(true);

  // ── Sync from server ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!trip) return;
    setTitle(trip.title ?? '');
    setPrivacyLevel(trip.privacyLevel);
    setMatchingOptIn(trip.matchingOptIn);
    setStyleTags(trip.travelStyleTags ?? []);
  }, [trip]);

  useEffect(() => {
    if (!notifSettings) return;
    setMorningSummary(notifSettings.morningSummary);
    setStopReminders(notifSettings.stopReminders);
    setEveningJournal(notifSettings.eveningJournal);
    setDepartureAlerts(notifSettings.departureAlerts);
  }, [notifSettings]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveTitle = useCallback(async () => {
    if (!id || !trip) return;
    const trimmed = title.trim();
    if (trimmed === trip.title) return;
    if (trimmed.length === 0) {
      setTitle(trip.title ?? '');
      return;
    }
    setSaving(true);
    try {
      await updateTrip(id, { title: trimmed });
      refetchTrip();
    } catch {
      Alert.alert('Error', 'Could not update trip title.');
    } finally {
      setSaving(false);
    }
  }, [id, trip, title, refetchTrip]);

  const handlePrivacyChange = useCallback(
    async (level: PrivacyLevel) => {
      if (!id) return;
      setPrivacyLevel(level);
      try {
        await updateTrip(id, { privacyLevel: level });
        refetchTrip();
      } catch {
        Alert.alert('Error', 'Could not update privacy setting.');
      }
    },
    [id, refetchTrip],
  );

  const handleMatchingToggle = useCallback(
    async (value: boolean) => {
      if (!id) return;
      setMatchingOptIn(value);
      try {
        await updateTrip(id, { matchingOptIn: value });
        refetchTrip();
      } catch {
        Alert.alert('Error', 'Could not update matching preference.');
      }
    },
    [id, refetchTrip],
  );

  const handleStyleTagToggle = useCallback(
    async (tag: string) => {
      if (!id) return;
      const next = styleTags.includes(tag)
        ? styleTags.filter((t) => t !== tag)
        : [...styleTags, tag];
      setStyleTags(next);
      try {
        await updateTrip(id, { travelStyleTags: next });
        refetchTrip();
      } catch {
        Alert.alert('Error', 'Could not update travel style.');
      }
    },
    [id, styleTags, refetchTrip],
  );

  const handleNotificationToggle = useCallback(
    async (
      key: keyof Pick<
        TripNotificationSettings,
        'morningSummary' | 'stopReminders' | 'eveningJournal' | 'departureAlerts'
      >,
      value: boolean,
    ) => {
      if (!id) return;

      // Update local state immediately
      switch (key) {
        case 'morningSummary':
          setMorningSummary(value);
          break;
        case 'stopReminders':
          setStopReminders(value);
          break;
        case 'eveningJournal':
          setEveningJournal(value);
          break;
        case 'departureAlerts':
          setDepartureAlerts(value);
          break;
      }

      try {
        await upsertTripNotificationSettings(id, { [key]: value });
        refetchNotif();
      } catch {
        Alert.alert('Error', 'Could not update notification settings.');
      }
    },
    [id, refetchNotif],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete trip',
      'This will permanently delete this trip and all its entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteTrip(id);
              router.replace('/(tabs)/trips');
            } catch {
              Alert.alert('Error', 'Could not delete trip.');
            }
          },
        },
      ],
    );
  }, [id, router]);

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (tripLoading || notifLoading) return <LoadingScreen />;

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationHeader title="Trip Settings" parentTitle="Trip" />
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  const isActiveOrPlanned = trip.status === 'active' || trip.status === 'planned';
  const selectedPrivacy = PRIVACY_OPTIONS.find((o) => o.key === privacyLevel);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Trip Settings" parentTitle="Trip" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Trip Details ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            onBlur={handleSaveTitle}
            placeholder="Trip title"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            autoCorrect={false}
          />

          {(trip.arriving || trip.leaving) && (
            <View style={styles.datesRow}>
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>Arriving</Text>
                <Text style={styles.dateValue}>
                  {trip.arriving ? formatDate(trip.arriving) : 'Not set'}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.textMuted}
                style={styles.dateArrow}
              />
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>Leaving</Text>
                <Text style={styles.dateValue}>
                  {trip.leaving ? formatDate(trip.leaving) : 'Not set'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Privacy ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.privacyPills}>
            {PRIVACY_OPTIONS.map((option) => {
              const isSelected = privacyLevel === option.key;
              return (
                <Pressable
                  key={option.key}
                  style={[styles.privacyPill, isSelected && styles.privacyPillSelected]}
                  onPress={() => handlePrivacyChange(option.key)}
                >
                  <Text
                    style={[
                      styles.privacyPillText,
                      isSelected && styles.privacyPillTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedPrivacy && (
            <Text style={styles.privacyDescription}>{selectedPrivacy.description}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Travel Matching ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Matching</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextBlock}>
              <Text style={styles.toggleLabel}>Show in trip matching</Text>
              <Text style={styles.toggleHint}>
                Let other travelers with overlapping dates find you
              </Text>
            </View>
            <Switch
              value={matchingOptIn}
              onValueChange={handleMatchingToggle}
              trackColor={{ false: colors.borderDefault, true: colors.orange }}
              thumbColor={colors.background}
            />
          </View>

          {matchingOptIn && (
            <View style={styles.styleTagsContainer}>
              <Text style={styles.fieldLabel}>Travel style</Text>
              <StyleTagPicker selected={styleTags} onToggle={handleStyleTagToggle} />
            </View>
          )}
        </View>

        {/* ── Notifications ────────────────────────────────────────────── */}
        {isActiveOrPlanned && (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>

              <NotificationToggle
                label="Morning summary"
                hint="Daily overview of your plans"
                value={morningSummary}
                onToggle={(v) => handleNotificationToggle('morningSummary', v)}
              />

              <NotificationToggle
                label="Stop reminders"
                hint="Alerts before scheduled activities"
                value={stopReminders}
                onToggle={(v) => handleNotificationToggle('stopReminders', v)}
              />

              <NotificationToggle
                label="Evening journal prompt"
                hint="Reminder to reflect on your day"
                value={eveningJournal}
                onToggle={(v) => handleNotificationToggle('eveningJournal', v)}
              />

              <NotificationToggle
                label="Departure alerts"
                hint="Reminders before travel days"
                value={departureAlerts}
                onToggle={(v) => handleNotificationToggle('departureAlerts', v)}
              />
            </View>
          </>
        )}

        <View style={styles.divider} />

        {/* ── Danger Zone ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.8 }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={colors.emergency} />
            <Text style={styles.deleteButtonText}>Delete trip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface NotificationToggleProps {
  label: string;
  hint: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  hint,
  value,
  onToggle,
}) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleTextBlock}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleHint}>{hint}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.borderDefault, true: colors.orange }}
      thumbColor={colors.background}
    />
  </View>
);

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },

  // ── Sections ────────────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.screenX,
  },

  // ── Trip Details ────────────────────────────────────────────────
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
    backgroundColor: colors.background,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateArrow: {
    marginHorizontal: spacing.md,
  },

  // ── Privacy ─────────────────────────────────────────────────────
  privacyPills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  privacyPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    minHeight: 44,
  },
  privacyPillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  privacyPillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  privacyPillTextSelected: {
    color: colors.orange,
  },
  privacyDescription: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },

  // ── Toggle rows ─────────────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginBottom: spacing.md,
  },
  toggleTextBlock: {
    flex: 1,
    marginRight: spacing.lg,
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggleHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Style tags ──────────────────────────────────────────────────
  styleTagsContainer: {
    marginTop: spacing.lg,
  },

  // ── Danger Zone ─────────────────────────────────────────────────
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.emergency,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  deleteButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.emergency,
  },
});
