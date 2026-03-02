import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { searchCommunityCountries, getCitiesForCountry } from '@/data/community/communityApi';
import { getFlag } from '@/data/trips/helpers';
import type { CommunityTopic } from '@/data/community/types';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  topics: CommunityTopic[];
  activeTopicId: string | undefined;
  activeCountryId: string | undefined;
  activeCityId?: string | undefined;
  onApply: (filters: {
    topicId: string | undefined;
    countryId: string | undefined;
  }) => void;
  onClear: () => void;
}

export default function FilterSheet({
  visible,
  onClose,
  topics,
  activeTopicId,
  activeCountryId,
  onApply,
  onClear,
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();

  // Local state so user can adjust before applying
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(activeTopicId);
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(activeCountryId);

  // Country search
  const [countryQuery, setCountryQuery] = useState('');
  const [countryResults, setCountryResults] = useState<{ id: string; iso2: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState<string | undefined>();

  // Sync from parent when sheet opens
  useEffect(() => {
    if (visible) {
      setSelectedTopicId(activeTopicId);
      setSelectedCountryId(activeCountryId);
      setCountryQuery('');
      setCountryResults([]);
    }
  }, [visible, activeTopicId, activeCountryId]);

  const handleCountrySearch = useCallback(async (query: string) => {
    setCountryQuery(query);
    if (query.trim().length < 2) {
      setCountryResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchCommunityCountries(query.trim());
      setCountryResults(results);
    } catch {
      setCountryResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSelectCountry = useCallback((country: { id: string; name: string }) => {
    setSelectedCountryId(country.id);
    setSelectedCountryName(country.name);
    setCountryQuery('');
    setCountryResults([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply({ topicId: selectedTopicId, countryId: selectedCountryId });
    onClose();
  }, [selectedTopicId, selectedCountryId, onApply, onClose]);

  const handleClear = useCallback(() => {
    setSelectedTopicId(undefined);
    setSelectedCountryId(undefined);
    setSelectedCountryName(undefined);
    setCountryQuery('');
    setCountryResults([]);
    onClear();
    onClose();
  }, [onClear, onClose]);

  const hasFilters = !!(selectedTopicId || selectedCountryId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter discussions</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Topic pills */}
            <Text style={styles.sectionLabel}>TOPIC</Text>
            <View style={styles.pillRow}>
              <Pressable
                onPress={() => setSelectedTopicId(undefined)}
                style={[styles.pill, !selectedTopicId && styles.pillActive]}
              >
                <Text style={[styles.pillText, !selectedTopicId && styles.pillTextActive]}>All</Text>
              </Pressable>
              {topics.map((topic) => {
                const active = topic.id === selectedTopicId;
                return (
                  <Pressable
                    key={topic.id}
                    onPress={() => setSelectedTopicId(active ? undefined : topic.id)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {topic.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Destination search */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>DESTINATION</Text>

            {/* Selected country indicator */}
            {selectedCountryId && selectedCountryName && (
              <View style={styles.selectedCountryRow}>
                <Text style={styles.selectedCountryText}>{selectedCountryName}</Text>
                <Pressable
                  onPress={() => {
                    setSelectedCountryId(undefined);
                    setSelectedCountryName(undefined);
                  }}
                  hitSlop={8}
                >
                  <Feather name="x" size={14} color={colors.textMuted} />
                </Pressable>
              </View>
            )}

            {/* Search input */}
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                placeholderTextColor={colors.textMuted}
                value={countryQuery}
                onChangeText={handleCountrySearch}
                autoCorrect={false}
              />
              {searching && <ActivityIndicator size="small" color={colors.orange} />}
            </View>

            {/* Search results */}
            {countryResults.length > 0 && (
              <View style={styles.resultsList}>
                {countryResults.map((country) => (
                  <Pressable
                    key={country.id}
                    onPress={() => handleSelectCountry(country)}
                    style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                  >
                    <Text style={styles.resultFlag}>{getFlag(country.iso2)}</Text>
                    <Text style={styles.resultName}>{country.name}</Text>
                    {country.id === selectedCountryId && (
                      <Feather name="check" size={16} color={colors.orange} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply filters</Text>
            </Pressable>

            {hasFilters && (
              <Pressable onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear all</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  scroll: {
    flexGrow: 0,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.orange,
  },
  selectedCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  selectedCountryText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  resultsList: {
    marginTop: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  resultRowPressed: {
    opacity: 0.7,
  },
  resultFlag: {
    fontSize: 18,
  },
  resultName: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  applyButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  clearButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
});
