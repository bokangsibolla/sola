import DestinationSearchInput from '@/components/onboarding/DestinationSearchInput';
import PolarstepsShell from '@/components/onboarding/PolarstepsShell';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Body } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { Country } from '@/data/geo';
import { onboardingStore } from '@/state/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAP_PLACEHOLDER = require('@/assets/images/orange-gradient.png');

export default function DestinationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDestinations, setSelectedDestinations] = useState<Country[]>(() => {
    const stored = onboardingStore.getTripLocation();
    return stored ? [{ name: stored } as Country] : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddDestination = (country: Country) => {
    if (!selectedDestinations.find(d => d.name === country.name)) {
      setSelectedDestinations([...selectedDestinations, country]);
      setSearchQuery('');
    }
  };

  const handleRemoveDestination = (countryName: string) => {
    setSelectedDestinations(selectedDestinations.filter(d => d.name !== countryName));
  };

  const handleContinue = () => {
    if (selectedDestinations.length > 0) {
      const country = selectedDestinations[0];
      // Store ISO2 + country name
      onboardingStore.setTripLocation(country.iso2 || country.name);
      onboardingStore.setTripLocationName(country.name);
      router.push('/(onboarding)/trip-dates');
    }
  };

  const canContinue = selectedDestinations.length > 0;

  return (
    <PolarstepsShell backgroundImage={MAP_PLACEHOLDER}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <ProgressIndicator currentStep={3} totalSteps={5} />
      </View>

      <View style={styles.card}>
        <Body style={styles.title}>Where are you going?</Body>

        <View style={styles.searchContainer}>
          <DestinationSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSelectCountry={handleAddDestination}
            placeholder="Search for destinations"
          />
        </View>

        {selectedDestinations.length > 0 && (
          <View style={styles.selectedDestinations}>
            {selectedDestinations.map((dest) => (
              <View key={dest.iso2 || dest.name} style={styles.destinationTag}>
                {dest.flag && <Body style={styles.flag}>{dest.flag}</Body>}
                <Body style={styles.destinationName}>{dest.name}</Body>
                {dest.iso2 && (
                  <Body style={styles.countryCode}>({dest.iso2})</Body>
                )}
                <Pressable
                  onPress={() => handleRemoveDestination(dest.name)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={16} color={theme.colors.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.helpText}>
          <Body style={styles.helpTextContent}>
            Add the destinations you want to visit.{'\n'}
            You can always add more later
          </Body>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </PolarstepsShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '70%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100, // Space for button
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 24,
  },
  selectedDestinations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  destinationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  destinationName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
  },
  helpText: {
    alignItems: 'center',
    marginTop: 24,
  },
  helpTextContent: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
