import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { getCountriesList } from '@/data/api';
import { getFlag } from '@/data/trips/helpers';

interface VisitedCountriesEditorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

interface CountryOption {
  id: string;
  iso2: string;
  name: string;
}

export default function VisitedCountriesEditor({ selectedIds, onChange }: VisitedCountriesEditorProps) {
  const [allCountries, setAllCountries] = useState<CountryOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCountriesList()
      .then(setAllCountries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (search.length < 1) return [];
    const q = search.toLowerCase();
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [search, allCountries]);

  const selectedCountries = useMemo(() => {
    return allCountries.filter((c) => selectedIds.includes(c.id));
  }, [allCountries, selectedIds]);

  const toggleCountry = useCallback((countryId: string) => {
    if (selectedIds.includes(countryId)) {
      onChange(selectedIds.filter((id) => id !== countryId));
    } else {
      onChange([...selectedIds, countryId]);
    }
    setSearch('');
  }, [selectedIds, onChange]);

  if (loading) {
    return <ActivityIndicator size="small" color={colors.orange} style={{ marginVertical: spacing.md }} />;
  }

  return (
    <View style={styles.container}>
      {/* Selected countries as chips */}
      {selectedCountries.length > 0 && (
        <View style={styles.chipGrid}>
          {selectedCountries.map((c) => (
            <Pressable
              key={c.id}
              style={styles.chip}
              onPress={() => toggleCountry(c.id)}
            >
              <Text style={styles.chipText}>
                {getFlag(c.iso2)} {c.name}
              </Text>
              <Ionicons name="close" size={14} color={colors.background} style={{ marginLeft: 4 }} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Search input */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries to add..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Search results */}
      {filtered.length > 0 && (
        <View style={styles.dropdownList}>
          {filtered.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <Pressable
                key={c.id}
                style={styles.dropdownRow}
                onPress={() => toggleCountry(c.id)}
              >
                <Text style={styles.dropdownFlag}>{getFlag(c.iso2)}</Text>
                <Text style={styles.dropdownName}>{c.name}</Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={colors.orange} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dropdownFlag: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  dropdownName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
