import React, { useState, useRef, useCallback } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { usePostHog } from 'posthog-react-native';
import { searchDestinations } from '@/data/api';
import type { DestinationResult } from '@/data/api';
import type { Profile } from '@/data/types';
import { createTrip, getConnectedProfiles } from '@/data/trips/tripApi';
import { getFlag } from '@/data/trips/helpers';
import type { TripKind, PrivacyLevel } from '@/data/trips/types';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { useLocationConsent } from '@/hooks/useLocationConsent';
import { colors, fonts, radius, spacing } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';

const DAY_MS = 86_400_000;
const NAME_MAX = 50;
const SUMMARY_MAX = 80;
const MAX_BUDDIES = 5;

interface SelectedStop {
  countryIso2: string;
  cityId?: string;
  cityName: string;
  type: 'city' | 'country';
}

interface BuddyProfile {
  id: string;
  firstName: string;
  avatarUrl: string | null;
}

const TRIP_KINDS: { key: TripKind; icon: string; title: string; subtitle: string }[] = [
  {
    key: 'plan_future',
    icon: 'calendar-outline',
    title: 'Plan a future trip',
    subtitle: 'Set dates and destinations ahead of time',
  },
  {
    key: 'currently_traveling',
    icon: 'navigate-outline',
    title: 'Currently traveling',
    subtitle: 'Start tracking your trip right now',
  },
  {
    key: 'past_trip',
    icon: 'time-outline',
    title: 'Log a past trip',
    subtitle: 'Record a trip you already took',
  },
];

const PRIVACY_OPTIONS: { key: PrivacyLevel; label: string; description: string; icon: string }[] = [
  { key: 'private', label: 'Only me', description: 'Your trip is completely private', icon: 'lock-closed-outline' },
  { key: 'friends', label: 'Connections', description: 'Visible to your connections', icon: 'people-outline' },
  { key: 'public', label: 'Everyone', description: 'Anyone on Sola can see this trip', icon: 'earth-outline' },
];

const KIND_LABELS: Record<TripKind, string> = {
  plan_future: 'Planning ahead',
  currently_traveling: 'Traveling now',
  past_trip: 'Past trip',
};

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function nightsBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY_MS));
}

export default function NewTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const scrollRef = useRef<ScrollView>(null);
  const { requestLocation } = useLocationConsent(userId);

  // Trip kind bottom sheet
  const [showKindSheet, setShowKindSheet] = useState(true);
  const [tripKind, setTripKind] = useState<TripKind | null>(null);

  // Cover photo
  const [coverUri, setCoverUri] = useState<string | null>(null);

  // Destinations
  const [stops, setStops] = useState<SelectedStop[]>([]);
  const [search, setSearch] = useState('');

  // Dates
  const today = new Date();
  const tomorrow = new Date(Date.now() + DAY_MS);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const nights = startDate && endDate ? nightsBetween(startDate, endDate) : 0;

  // Name & Summary
  const [tripName, setTripName] = useState('');
  const [summary, setSummary] = useState('');

  // Travel Buddies
  const [buddies, setBuddies] = useState<BuddyProfile[]>([]);
  const [buddySearch, setBuddySearch] = useState('');
  const [showBuddySearch, setShowBuddySearch] = useState(false);

  // Travel Tracker
  const [trackerEnabled, setTrackerEnabled] = useState(false);

  // Privacy
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('private');

  // Save state
  const [saving, setSaving] = useState(false);

  // Search destinations
  const { data: destResults } = useData(
    () => search.length < 2 ? Promise.resolve([]) : searchDestinations(search).then((r) => r.slice(0, 6)),
    [search],
  );

  // Search connected profiles for buddies
  const { data: buddyResults } = useData(
    () => !userId || buddySearch.length < 2
      ? Promise.resolve([])
      : getConnectedProfiles(userId, buddySearch),
    [buddySearch, userId],
  );

  const handleSelectKind = (kind: TripKind) => {
    setTripKind(kind);
    setShowKindSheet(false);
    posthog.capture('create_trip_kind_selected', { kind });
  };

  const handlePickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setCoverUri(result.assets[0].uri);
      }
    } catch {
      // Image picker failed — cover photo is optional, just skip
    }
  };

  const handleSelectStop = (result: DestinationResult) => {
    if (stops.length >= 5 || !result.countryIso2) return;
    setStops([...stops, {
      countryIso2: result.countryIso2,
      cityId: result.type === 'city' ? result.id : undefined,
      cityName: result.name,
      type: result.type as 'city' | 'country',
    }]);
    setSearch('');
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (event.type === 'dismissed') {
      setShowPicker(null);
      return;
    }
    if (!date) return;

    if (showPicker === 'start') {
      setStartDate(date);
      if (endDate && date >= endDate) setEndDate(null);
      if (Platform.OS === 'android') setTimeout(() => setShowPicker('end'), 300);
    } else {
      setEndDate(date);
      if (Platform.OS === 'android') setShowPicker(null);
    }
  };

  const handleAddBuddy = (profile: Profile) => {
    if (buddies.length >= MAX_BUDDIES) return;
    if (buddies.some((b) => b.id === profile.id)) return;
    setBuddies([...buddies, {
      id: profile.id,
      firstName: profile.firstName,
      avatarUrl: profile.avatarUrl,
    }]);
    setBuddySearch('');
    setShowBuddySearch(false);
  };

  const handleRemoveBuddy = (id: string) => {
    setBuddies(buddies.filter((b) => b.id !== id));
  };

  const handleToggleTracker = async () => {
    if (!trackerEnabled) {
      const result = await requestLocation();
      if (result) {
        setTrackerEnabled(true);
      }
    } else {
      setTrackerEnabled(false);
    }
  };

  const getMinDate = useCallback(() => {
    if (tripKind === 'past_trip') return undefined;
    if (tripKind === 'currently_traveling') return undefined;
    return tomorrow;
  }, [tripKind, tomorrow]);

  const handleCreate = async () => {
    if (!userId || stops.length === 0) return;
    if (!tripKind) return;

    setSaving(true);
    try {
      await createTrip(userId, {
        title: tripName.trim() || undefined,
        summary: summary.trim() || undefined,
        tripKind,
        stops: stops.map((s) => ({
          countryIso2: s.countryIso2,
          cityId: s.cityId,
          cityName: s.cityName,
        })),
        arriving: startDate ? startDate.toISOString().split('T')[0] : undefined,
        leaving: endDate ? endDate.toISOString().split('T')[0] : undefined,
        privacyLevel,
        matchingOptIn: trackerEnabled,
        buddyUserIds: buddies.map((b) => b.id),
      });
      posthog.capture('create_trip_completed', {
        kind: tripKind,
        stops_count: stops.length,
        has_dates: !!startDate,
        has_buddies: buddies.length > 0,
        tracker_enabled: trackerEnabled,
        privacy: privacyLevel,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Save failed', err?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const canCreate = stops.length > 0 && tripKind !== null;

  // ── ALWAYS render the main screen structure ─────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <NavigationHeader title="New trip" variant="modal" />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Cover Photo (optional) ────────────────────────── */}
        {coverUri ? (
          <Pressable
            style={({ pressed }) => [styles.coverArea, pressed && { opacity: 0.85 }]}
            onPress={handlePickCover}
          >
            <Image source={{ uri: coverUri }} style={styles.coverImage} contentFit="cover" />
            <View style={styles.coverEditBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
            {tripKind && (
              <View style={styles.kindBadge}>
                <Text style={styles.kindBadgeText}>{KIND_LABELS[tripKind]}</Text>
              </View>
            )}
          </Pressable>
        ) : (
          <View style={styles.coverOptionalRow}>
            {tripKind && (
              <View style={styles.kindBadgeInline}>
                <Ionicons name={TRIP_KINDS.find((k) => k.key === tripKind)?.icon as any ?? 'airplane-outline'} size={14} color={colors.orange} />
                <Text style={styles.kindBadgeInlineText}>{KIND_LABELS[tripKind]}</Text>
              </View>
            )}
            <Pressable style={styles.coverOptionalButton} onPress={handlePickCover}>
              <Ionicons name="camera-outline" size={16} color={colors.textMuted} />
              <Text style={styles.coverOptionalText}>Add cover photo</Text>
            </Pressable>
          </View>
        )}

        {/* ── Destinations ────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={18} color={colors.orange} />
              <Text style={styles.sectionTitle}>Where are you going?</Text>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Search cities or countries..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {(destResults ?? []).length > 0 && search.length > 0 && (
              <View style={styles.results}>
                {(destResults ?? []).map((r, i) => (
                  <Pressable
                    key={`${r.id}-${i}`}
                    style={styles.resultRow}
                    onPress={() => handleSelectStop(r)}
                  >
                    <Text style={styles.resultName}>{r.name}</Text>
                    <Text style={styles.resultDetail}>
                      {r.type === 'city' && r.parentName ? r.parentName : r.type === 'country' ? 'Country' : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {stops.length > 0 && (
              <View style={styles.stopsContainer}>
                {stops.map((stop, index) => (
                  <View key={`${stop.cityName}-${index}`} style={styles.stopChip}>
                    <Text style={styles.stopFlag}>{getFlag(stop.countryIso2)}</Text>
                    <Text style={styles.stopName}>{stop.cityName}</Text>
                    <Pressable onPress={() => handleRemoveStop(index)} hitSlop={8}>
                      <Ionicons name="close" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {stops.length === 0 && search.length === 0 && (
              <View style={styles.emptyHint}>
                <Ionicons name="airplane-outline" size={16} color={colors.textMuted} />
                <Text style={styles.emptyHintText}>Add up to 5 destinations</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Trip Dates ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color={colors.orange} />
              <Text style={styles.sectionTitle}>Trip dates</Text>
            </View>
            <View style={styles.dateRow}>
              <Pressable
                style={[styles.dateCard, startDate && styles.dateCardFilled]}
                onPress={() => setShowPicker('start')}
              >
                <Text style={styles.dateLabel}>Start date</Text>
                <Text style={[styles.dateValue, startDate && styles.dateValueFilled]}>
                  {startDate ? formatDate(startDate) : 'Select'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.dateCard, endDate && styles.dateCardFilled]}
                onPress={() => {
                  if (!startDate) { setShowPicker('start'); return; }
                  setShowPicker('end');
                }}
              >
                <Text style={styles.dateLabel}>End date (optional)</Text>
                <Text style={[styles.dateValue, endDate && styles.dateValueFilled]}>
                  {endDate ? formatDate(endDate) : 'Open'}
                </Text>
              </Pressable>
            </View>

            {nights > 0 && (
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsText}>
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </Text>
              </View>
            )}

            {/* iOS inline picker */}
            {Platform.OS === 'ios' && showPicker && (
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    {showPicker === 'start' ? 'Start date' : 'End date'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      if (showPicker === 'start' && startDate && !endDate) {
                        setShowPicker('end');
                      } else {
                        setShowPicker(null);
                      }
                    }}
                  >
                    <Text style={styles.pickerDone}>
                      {showPicker === 'start' && startDate && !endDate ? 'Next' : 'Done'}
                    </Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={
                    showPicker === 'start'
                      ? startDate || (tripKind === 'past_trip' ? today : tomorrow)
                      : endDate || new Date((startDate?.getTime() || Date.now()) + DAY_MS)
                  }
                  mode="date"
                  display="inline"
                  minimumDate={
                    showPicker === 'start'
                      ? getMinDate()
                      : startDate ? new Date(startDate.getTime() + DAY_MS) : undefined
                  }
                  maximumDate={tripKind === 'past_trip' ? today : undefined}
                  onChange={handleDateChange}
                  accentColor={colors.orange}
                />
              </View>
            )}
          </View>
        </View>

        {/* ── Trip Name & Summary ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={18} color={colors.orange} />
              <Text style={styles.sectionTitle}>About this trip</Text>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Trip name</Text>
                <Text style={styles.charCount}>{tripName.length}/{NAME_MAX}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={stops[0]?.cityName || 'Give your trip a name'}
                placeholderTextColor={colors.textMuted}
                value={tripName}
                onChangeText={(text) => setTripName(text.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Short summary</Text>
                <Text style={styles.charCount}>{summary.length}/{SUMMARY_MAX}</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.summaryInput]}
                placeholder="What's this trip about?"
                placeholderTextColor={colors.textMuted}
                value={summary}
                onChangeText={(text) => setSummary(text.slice(0, SUMMARY_MAX))}
                maxLength={SUMMARY_MAX}
                multiline
              />
            </View>
          </View>
        </View>

        {/* ── Travel Buddies ──────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={18} color={colors.orange} />
              <Text style={styles.sectionTitle}>Travel buddies</Text>
            </View>
            <Text style={styles.sectionHint}>
              Invite connections to join your trip (up to {MAX_BUDDIES})
            </Text>

            {buddies.length > 0 && (
              <View style={styles.buddyList}>
                {buddies.map((buddy) => (
                  <View key={buddy.id} style={styles.buddyChip}>
                    <View style={styles.buddyAvatar}>
                      {buddy.avatarUrl ? (
                        <Image source={{ uri: buddy.avatarUrl }} style={styles.buddyAvatarImg} contentFit="cover" />
                      ) : (
                        <Feather name="user" size={12} color={colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.buddyName}>{buddy.firstName}</Text>
                    <Pressable onPress={() => handleRemoveBuddy(buddy.id)} hitSlop={8}>
                      <Ionicons name="close" size={14} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {buddies.length < MAX_BUDDIES && (
              <>
                {showBuddySearch ? (
                  <View style={styles.buddySearchContainer}>
                    <View style={styles.inputRow}>
                      <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Search your connections..."
                        placeholderTextColor={colors.textMuted}
                        value={buddySearch}
                        onChangeText={setBuddySearch}
                        autoFocus
                      />
                      <Pressable onPress={() => { setBuddySearch(''); setShowBuddySearch(false); }} hitSlop={8}>
                        <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                      </Pressable>
                    </View>
                    {(buddyResults ?? []).length > 0 && buddySearch.length >= 2 && (
                      <View style={styles.results}>
                        {(buddyResults ?? []).filter((p) => !buddies.some((b) => b.id === p.id)).map((p) => (
                          <Pressable
                            key={p.id}
                            style={styles.resultRow}
                            onPress={() => handleAddBuddy(p)}
                          >
                            <Text style={styles.resultName}>{p.firstName}</Text>
                            <Ionicons name="add-circle-outline" size={18} color={colors.orange} />
                          </Pressable>
                        ))}
                      </View>
                    )}
                    {(buddyResults ?? []).length === 0 && buddySearch.length >= 2 && (
                      <Text style={styles.noResults}>No connections found</Text>
                    )}
                  </View>
                ) : (
                  <Pressable
                    style={styles.addBuddyBtn}
                    onPress={() => setShowBuddySearch(true)}
                  >
                    <View style={styles.addBuddyIcon}>
                      <Ionicons name="person-add-outline" size={16} color={colors.orange} />
                    </View>
                    <Text style={styles.addBuddyText}>Add a travel buddy</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>

        {/* ── Travel Tracker ──────────────────────────────────── */}
        <View style={styles.section}>
          <Pressable
            style={[styles.sectionCard, styles.trackerCard, trackerEnabled && styles.trackerCardActive]}
            onPress={handleToggleTracker}
          >
            <View style={styles.trackerRow}>
              <View style={[styles.trackerIcon, trackerEnabled && styles.trackerIconActive]}>
                <Ionicons
                  name={trackerEnabled ? 'navigate' : 'navigate-outline'}
                  size={20}
                  color={trackerEnabled ? colors.orange : colors.textMuted}
                />
              </View>
              <View style={styles.trackerText}>
                <Text style={styles.trackerTitle}>Travel Tracker</Text>
                <Text style={styles.trackerDesc}>
                  {trackerEnabled
                    ? 'Location tracking is on (city-level only)'
                    : 'Track your route automatically'}
                </Text>
              </View>
              <View style={[styles.toggle, trackerEnabled && styles.toggleActive]}>
                <View style={[styles.toggleDot, trackerEnabled && styles.toggleDotActive]} />
              </View>
            </View>
            {!trackerEnabled && (
              <Text style={styles.trackerConsent}>
                Sola only uses city-level location. Your exact position is never stored or shared.
              </Text>
            )}
          </Pressable>
        </View>

        {/* ── Privacy / Visibility ────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-outline" size={18} color={colors.orange} />
              <Text style={styles.sectionTitle}>Who can see this trip?</Text>
            </View>
            {PRIVACY_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                style={[styles.privacyOption, privacyLevel === option.key && styles.privacyOptionSelected]}
                onPress={() => setPrivacyLevel(option.key)}
              >
                <View style={[styles.radioOuter, privacyLevel === option.key && styles.radioOuterSelected]}>
                  {privacyLevel === option.key && <View style={styles.radioInner} />}
                </View>
                <Ionicons name={option.icon as any} size={16} color={privacyLevel === option.key ? colors.orange : colors.textMuted} />
                <View style={styles.privacyText}>
                  <Text style={[styles.privacyLabel, privacyLevel === option.key && styles.privacyLabelSelected]}>
                    {option.label}
                  </Text>
                  <Text style={styles.privacyDesc}>{option.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Create Button ───────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable
          style={[styles.createButton, (!canCreate || saving) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate || saving}
        >
          <Text style={styles.createButtonText}>
            {saving ? 'Creating...' : 'Create trip'}
          </Text>
        </Pressable>
      </View>

      {/* ── Trip Kind Bottom Sheet (OVERLAY, not sole return) ── */}
      <Modal visible={showKindSheet} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => router.back()} />
          <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>What kind of trip?</Text>

            {TRIP_KINDS.map((kind) => (
              <Pressable
                key={kind.key}
                style={({ pressed }) => [styles.kindOption, pressed && styles.pressed]}
                onPress={() => handleSelectKind(kind.key)}
              >
                <View style={styles.kindIcon}>
                  <Ionicons name={kind.icon as any} size={22} color={colors.orange} />
                </View>
                <View style={styles.kindTextContainer}>
                  <Text style={styles.kindTitle}>{kind.title}</Text>
                  <Text style={styles.kindSubtitle}>{kind.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}

            <Pressable
              style={styles.sheetCancel}
              onPress={() => router.back()}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Android date picker modal */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={
            showPicker === 'start'
              ? startDate || (tripKind === 'past_trip' ? today : tomorrow)
              : endDate || new Date((startDate?.getTime() || Date.now()) + DAY_MS)
          }
          mode="date"
          display="default"
          minimumDate={
            showPicker === 'start'
              ? getMinDate()
              : startDate ? new Date(startDate.getTime() + DAY_MS) : undefined
          }
          maximumDate={tripKind === 'past_trip' ? today : undefined}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // ── Cover Photo ──
  coverArea: {
    height: 200,
    backgroundColor: colors.neutralFill,
    position: 'relative',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverOptionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  coverOptionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coverOptionalText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  kindBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  kindBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kindBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  kindBadgeInlineText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sectionHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  emptyHintText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  noResults: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // ── Inputs ──
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  summaryInput: {
    height: 72,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },

  // ── Search results ──
  results: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultDetail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // ── Stops ──
  stopsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  stopFlag: {
    fontSize: 16,
  },
  stopName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // ── Dates ──
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateCard: {
    flex: 1,
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  dateCardFilled: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dateLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  dateValueFilled: {
    color: colors.textPrimary,
  },
  nightsBadge: {
    alignSelf: 'center',
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.button,
    marginTop: spacing.md,
  },
  nightsText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
  pickerContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pickerTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerDone: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },

  // ── Buddies ──
  buddyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  buddyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  buddyAvatar: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buddyAvatarImg: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
  },
  buddyName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  buddySearchContainer: {
    marginTop: spacing.sm,
  },
  addBuddyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  addBuddyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBuddyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // ── Travel Tracker ──
  trackerCard: {
    borderColor: colors.borderDefault,
  },
  trackerCardActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  trackerIconActive: {
    backgroundColor: 'rgba(229, 101, 58, 0.15)',
  },
  trackerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  trackerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  trackerDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  trackerConsent: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.orange,
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },

  // ── Privacy ──
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  privacyOptionSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.orange,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
  },
  privacyText: {
    flex: 1,
  },
  privacyLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  privacyLabelSelected: {
    color: colors.orange,
  },
  privacyDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },

  // ── Bottom Bar ──
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  createButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ── Trip Kind Sheet ──
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  kindOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  kindIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  kindTextContainer: {
    flex: 1,
  },
  kindTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  kindSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  sheetCancelText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
  },
});
