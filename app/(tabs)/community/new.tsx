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
import { useAuth } from '@/state/AuthContext';
import {
  createThread,
  getCommunityTopics,
  searchCommunityCountries,
  getCitiesForCountry,
} from '@/data/community/communityApi';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
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
// Main Screen
// ---------------------------------------------------------------------------

export default function NewThread() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { showGuidedComposer, markFirstPost } = useCommunityOnboarding();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>();
  const [placeLabel, setPlaceLabel] = useState<string | undefined>();
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);

  useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
  }, []);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!userId || !canSubmit) return;
    setSubmitting(true);
    try {
      const threadId = await createThread(userId, {
        title: title.trim(),
        body: body.trim(),
        countryId: selectedCountryId,
        cityId: selectedCityId,
        topicId: selectedTopicId,
      });
      markFirstPost();
      router.replace(`/(tabs)/community/thread/${threadId}`);
    } catch {
      Alert.alert('Error', 'Could not create thread. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [userId, canSubmit, title, body, selectedCountryId, selectedCityId, selectedTopicId, router, markFirstPost]);

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
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Feather name="x" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Ask a question</Text>
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

        {/* Place selector */}
        <Text style={styles.sectionLabel}>Place (optional)</Text>
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
        <Text style={styles.sectionLabel}>Topic (optional)</Text>
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
  closeButton: { padding: spacing.xs },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
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
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDefault, alignSelf: 'center', marginBottom: spacing.xl },
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
