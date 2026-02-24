import { useState } from 'react';
import { SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City, PlaceKind } from '@/data/types';
import { DestinationCard } from './DestinationCard';

interface DestinationsTabProps {
  cities: City[];
  countryName: string;
}

// ---------------------------------------------------------------------------
// Place-kind utilities
// ---------------------------------------------------------------------------

function humanizeKind(kind: PlaceKind): string {
  return kind.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function pluralizeKind(kind: PlaceKind): string {
  const singular = humanizeKind(kind);
  if (singular.endsWith('y') && !singular.endsWith('ay')) {
    return singular.slice(0, -1) + 'ies';
  }
  return singular + 's';
}

interface DestinationGroup {
  kind: PlaceKind;
  label: string;
  data: City[];
}

function groupByPlaceKind(cities: City[]): DestinationGroup[] {
  const map = new Map<PlaceKind, City[]>();
  for (const city of cities) {
    const arr = map.get(city.placeKind);
    if (arr) {
      arr.push(city);
    } else {
      map.set(city.placeKind, [city]);
    }
  }
  return Array.from(map.entries())
    .map(([kind, items]) => ({
      kind,
      label: pluralizeKind(kind),
      data: items,
    }))
    .sort((a, b) => b.data.length - a.data.length);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DestinationsTab({ cities, countryName }: DestinationsTabProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase().trim()))
    : cities;

  const sections = groupByPlaceKind(filtered);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search places in ${countryName}`}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textMuted}
              onPress={() => setQuery('')}
            />
          )}
        </View>
      </View>

      {/* Grouped list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <DestinationCard
            city={item}
            showBorder={index < section.data.length - 1}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.label}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No places match your search</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
