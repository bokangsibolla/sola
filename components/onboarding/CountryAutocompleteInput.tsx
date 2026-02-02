import { Body } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { countries, Country } from '@/data/geo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Keyboard, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface CountryAutocompleteInputProps {
  value: string;
  onChange: (country: Country | null) => void;
  placeholder?: string;
  showSearchIcon?: boolean;
}

export default function CountryAutocompleteInput({
  value,
  onChange,
  placeholder = 'Search for a country',
  showSearchIcon = false,
}: CountryAutocompleteInputProps) {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [showResults, setShowResults] = useState(false);

  // Sync searchQuery with value prop when value changes externally
  useEffect(() => {
    if (value && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return countries
      .filter((country) => country.name.toLowerCase().includes(query))
      .slice(0, 15);
  }, [searchQuery]);

  const handleSelectCountry = (country: Country) => {
    const displayText = country.flag ? `${country.flag} ${country.name}` : country.name;
    onChange(country);
    setSearchQuery(displayText);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowResults(true);
    if (value && text !== value) {
      onChange(null);
    }
  };

  // Update searchQuery when value prop changes externally
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  const displayValue = searchQuery;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          {showSearchIcon && (
            <Ionicons name="search" size={20} color={theme.colors.muted} style={styles.searchIcon} />
          )}
          <TextInput
            style={[styles.input, showSearchIcon && styles.inputWithIcon]}
            value={displayValue}
            onChangeText={handleSearchChange}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
          />
        </View>
      </View>
      <Modal
        visible={showResults && filteredCountries.length > 0}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResults(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowResults(false)}
        >
          <View style={styles.resultsContainer}>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.iso2}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.countryItem,
                    pressed && styles.countryItemPressed,
                  ]}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Body style={styles.countryText}>
                    {item.flag ? `${item.flag} ` : ''}{item.name}
                  </Body>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              windowSize={10}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              getItemLayout={(data, index) => ({
                length: 52,
                offset: 52 * index,
                index,
              })}
              scrollEnabled={true}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 52,
    borderRadius: theme.radii.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100, // Adjust based on input position
    paddingHorizontal: 24,
  },
  resultsContainer: {
    maxHeight: 260,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  countryItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 52,
    justifyContent: 'center',
  },
  countryItemPressed: {
    backgroundColor: theme.colors.background,
  },
  countryText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
});
