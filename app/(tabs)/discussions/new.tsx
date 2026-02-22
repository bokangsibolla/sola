import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import {
  createThread,
  getCommunityTopics,
  searchCommunityCountries,
  getCitiesForCountry,
} from '@/data/community/communityApi';
import { getProfileById } from '@/data/api';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
import { requireVerification } from '@/lib/verification';
import { useData } from '@/hooks/useData';
import type { CommunityTopic } from '@/data/community/types';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getFlag(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

// ---------------------------------------------------------------------------
// Post Type Options
// ---------------------------------------------------------------------------

const POST_TYPES = [
  { key: 'question', label: 'Question' },
  { key: 'tip', label: 'Tip' },
  { key: 'experience', label: 'Experience' },
  { key: 'safety_alert', label: 'Safety Alert' },
] as const;

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function NewThread() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { mode, activeTripInfo } = useAppMode();
  const { showGuidedComposer, markFirstPost } = useCommunityOnboarding();
  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['profile', userId],
  );

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>();
  const [placeLabel, setPlaceLabel] = useState<string | undefined>();
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [postType, setPostType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);

  useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
  }, []);

  // Pre-fill destination tag in travelling mode
  useEffect(() => {
    if (mode === 'travelling' && activeTripInfo?.city.id) {
      setSelectedCityId(activeTripInfo.city.id);
      setPlaceLabel(activeTripInfo.city.name);
    }
  }, [mode, activeTripInfo]);

  const canSubmit =
    title.trim().length >= 10 &&
    body.trim().length > 0 &&
    (selectedCountryId !== undefined || selectedCityId !== undefined) &&
    selectedTopicId !== undefined &&
    postType !== null &&
    !submitting;

  const handleSubmit = useCallback(async () => {
    if (!userId || !canSubmit) return;
    if (!requireVerification(profile?.verificationStatus || 'unverified', 'post in the community')) return;
    setSubmitting(true);
    try {
      const threadId = await createThread(userId, {
        title: title.trim(),
        body: body.trim(),
        countryId: selectedCountryId,
        cityId: selectedCityId,
        topicId: selectedTopicId,
        postType: postType ?? undefined,
      });
      markFirstPost();
      router.replace(`/(tabs)/discussions/thread/${threadId}`);
    } catch {
      Alert.alert('Error', 'Could not create thread. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [userId, canSubmit, title, body, selectedCountryId, selectedCityId, selectedTopicId, postType, router, markFirstPost, profile]);

  const handleSelectPlace = useCallback((countryId: string | undefined, cityId: string | undefined, label: string) => {
    setSelectedCountryId(countryId);
    setSelectedCityId(cityId);
    setPlaceLabel(countryId ? label : undefined);
    setShowPlaceSelector(false);
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <NavigationHeader
          title="Ask a question"
          variant="modal"
          rightActions={
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.postButton, !canSubmit && styles.postButtonDisabled]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </Pressable>
          }
        />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title input */}
        <TextInput
          style={styles.titleInput}
          placeholder={showGuidedComposer
            ? "e.g. Is it safe to walk alone at night in Medellín?"
            : "What's your question?"}
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          multiline
        />

        {/* Body input */}
        <TextInput
          style={styles.bodyInput}
          placeholder={showGuidedComposer
            ? "Share context — where you're going, what you need help with"
            : "Add details to help others understand your question..."}
          placeholderTextColor={colors.textMuted}
          value={body}
          onChangeText={setBody}
          maxLength={2000}
          multiline
          textAlignVertical="top"
        />

        {showGuidedComposer && (
          <Text style={styles.guidedHint}>
            Your question will be visible to women traveling to this place
          </Text>
        )}

        {/* Title hint */}
        {title.trim().length > 0 && title.trim().length < 10 && (
          <Text style={styles.hintText}>Title needs at least 10 characters</Text>
        )}

        {/* Place selector */}
        <Text style={styles.sectionLabel}>Destination</Text>
        <Pressable
          onPress={() => setShowPlaceSelector(true)}
          style={({ pressed }) => [styles.placeSelector, pressed && styles.pressed]}
        >
          <Feather name="map-pin" size={16} color={placeLabel ? colors.orange : colors.textMuted} />
          <Text style={[styles.placeSelectorText, placeLabel && styles.placeSelectorTextActive]}>
            {placeLabel ?? 'Select a country or city'}
          </Text>
          {placeLabel && (
            <Pressable onPress={() => handleSelectPlace(undefined, undefined, 'All places')} hitSlop={8}>
              <Feather name="x" size={14} color={colors.textMuted} />
            </Pressable>
          )}
        </Pressable>

        {/* Topic selector */}
        <Text style={styles.sectionLabel}>Topic</Text>
        <View style={styles.topicRow}>
          {topics.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setSelectedTopicId(selectedTopicId === t.id ? undefined : t.id)}
              style={[styles.topicPill, selectedTopicId === t.id && styles.topicPillActive]}
            >
              <Text style={[styles.topicPillText, selectedTopicId === t.id && styles.topicPillTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Post type selector */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Post type</Text>
        <View style={styles.topicRow}>
          {POST_TYPES.map((pt) => (
            <Pressable
              key={pt.key}
              onPress={() => setPostType(postType === pt.key ? null : pt.key)}
              style={[styles.topicPill, postType === pt.key && styles.topicPillActive]}
            >
              <Text style={[styles.topicPillText, postType === pt.key && styles.topicPillTextActive]}>
                {pt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Place Selector Sheet */}
      <PlaceSelectorSheet
        visible={showPlaceSelector}
        onClose={() => setShowPlaceSelector(false)}
        onSelectPlace={handleSelectPlace}
      />
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Place Selector (reused pattern from index.tsx)
// ---------------------------------------------------------------------------

function PlaceSelectorSheet({
  visible,
  onClose,
  onSelectPlace,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (countryId: string | undefined, cityId: string | undefined, label: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState<{ id: string; name: string; iso2: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string; iso2: string } | null>(null);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.trim().length < 2) {
      setCountries([]);
      return;
    }
    try {
      const results = await searchCommunityCountries(text.trim());
      setCountries(results);
    } catch {
      // ignore
    }
  }, []);

  const handleSelectCountry = useCallback(async (country: { id: string; name: string; iso2: string }) => {
    setSelectedCountry(country);
    try {
      const citiesResult = await getCitiesForCountry(country.id);
      setCities(citiesResult);
    } catch {
      setCities([]);
    }
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select place</Text>

          {!selectedCountry ? (
            <>
              <View style={styles.searchRow}>
                <Feather name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search country..."
                  placeholderTextColor={colors.textMuted}
                  value={searchText}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>
              <ScrollView style={styles.placeResults}>
                {countries.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCountry(c)}
                    style={styles.placeRow}
                  >
                    <Text style={styles.placeRowFlag}>{getFlag(c.iso2)}</Text>
                    <Text style={styles.placeRowText}>{c.name}</Text>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <Pressable onPress={() => { setSelectedCountry(null); setCities([]); }} style={styles.backRow}>
                <Feather name="arrow-left" size={18} color={colors.orange} />
                <Text style={styles.backRowText}>{selectedCountry.name}</Text>
              </Pressable>
              <ScrollView style={styles.placeResults}>
                <Pressable
                  onPress={() => {
                    onSelectPlace(selectedCountry.id, undefined, selectedCountry.name);
                  }}
                  style={styles.placeRow}
                >
                  <Feather name="map" size={18} color={colors.textSecondary} />
                  <Text style={styles.placeRowText}>All of {selectedCountry.name}</Text>
                </Pressable>
                {cities.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      onSelectPlace(selectedCountry.id, c.id, `${c.name}, ${selectedCountry.name}`);
                    }}
                    style={styles.placeRow}
                  >
                    <Text style={styles.placeRowText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  postButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  postButtonDisabled: { opacity: 0.4 },
  postButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#FFFFFF' },

  // Content
  scrollContent: { flex: 1, paddingHorizontal: spacing.screenX, paddingTop: spacing.lg },
  titleInput: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 26,
  },
  bodyInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    minHeight: 120,
    marginBottom: spacing.xl,
  },
  guidedHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xl,
    marginTop: -spacing.md,
  },

  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  // Place selector
  placeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  placeSelectorText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  placeSelectorTextActive: { color: colors.orange, fontFamily: fonts.medium },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  // Topic pills
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topicPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  topicPillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  topicPillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  topicPillTextActive: { color: colors.orange },

  // Bottom sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
    maxHeight: '70%',
  },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.xs, backgroundColor: colors.borderDefault, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.lg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary },
  placeResults: { maxHeight: 300 },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing.md,
  },
  placeRowFlag: { fontSize: 18 },
  placeRowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backRowText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.orange },
});
