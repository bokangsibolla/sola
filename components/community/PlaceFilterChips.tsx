/**
 * Horizontal scrolling filter chips for country → city filtering
 * on the Discussions feed. Shows countries that have threads, and
 * when one is selected, cities within that country appear inline
 * after a · divider.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import {
  getCountriesWithThreads,
  getCitiesWithThreadsInCountry,
} from '@/data/community/communityApi';

interface PlaceOption {
  id: string;
  name: string;
}

interface PlaceFilterChipsProps {
  selectedCountryId: string | undefined;
  selectedCityId: string | undefined;
  onFilterChange: (countryId: string | undefined, cityId: string | undefined) => void;
}

export default function PlaceFilterChips({
  selectedCountryId,
  selectedCityId,
  onFilterChange,
}: PlaceFilterChipsProps) {
  const [countries, setCountries] = useState<PlaceOption[]>([]);
  const [cities, setCities] = useState<PlaceOption[]>([]);

  // Fetch countries with threads on mount
  useEffect(() => {
    getCountriesWithThreads()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  // Fetch cities when a country is selected
  useEffect(() => {
    if (!selectedCountryId) {
      setCities([]);
      return;
    }
    getCitiesWithThreadsInCountry(selectedCountryId)
      .then(setCities)
      .catch(() => setCities([]));
  }, [selectedCountryId]);

  const handleCountryPress = useCallback(
    (countryId: string) => {
      if (selectedCountryId === countryId) {
        // Deselect country (and city)
        onFilterChange(undefined, undefined);
      } else {
        // Select new country, clear city
        onFilterChange(countryId, undefined);
      }
    },
    [selectedCountryId, onFilterChange],
  );

  const handleCityPress = useCallback(
    (cityId: string) => {
      if (selectedCityId === cityId) {
        // Deselect city, keep country
        onFilterChange(selectedCountryId, undefined);
      } else {
        onFilterChange(selectedCountryId, cityId);
      }
    },
    [selectedCountryId, selectedCityId, onFilterChange],
  );

  // Don't render anything if there are no countries with threads
  if (countries.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {countries.map((country) => {
        const isActive = selectedCountryId === country.id;
        return (
          <Pressable
            key={country.id}
            onPress={() => handleCountryPress(country.id)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {country.name}
            </Text>
          </Pressable>
        );
      })}

      {/* Inline city chips when a country is selected */}
      {cities.length > 0 && (
        <>
          <Text style={styles.divider}>·</Text>
          {cities.map((city) => {
            const isActive = selectedCityId === city.id;
            return (
              <Pressable
                key={city.id}
                onPress={() => handleCityPress(city.id)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {city.name}
                </Text>
              </Pressable>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  chipActive: {
    backgroundColor: colors.orangeFill,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.orange,
  },
  divider: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
});
