import { Body } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { countries, Country } from '@/data/geo';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Keyboard, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface DestinationSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectCountry: (country: Country) => void;
  placeholder?: string;
}

export default function DestinationSearchInput({
  value,
  onChangeText,
  onSelectCountry,
  placeholder = 'Search for destinations',
}: DestinationSearchInputProps) {
  const [showResults, setShowResults] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!value.trim()) {
      return [];
    }
    const query = value.toLowerCase();
    return countries
      .filter((country) => country.name.toLowerCase().includes(query))
      .slice(0, 15);
  }, [value]);

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    onChangeText('');
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleSearchChange = (text: string) => {
    onChangeText(text);
    setShowResults(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={20} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleSearchChange}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.colors.muted} />
          </Pressable>
        )}
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
            />
          </View>
        </Pressable>
      </Modal>
    </View>
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
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  clearButton: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100,
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
