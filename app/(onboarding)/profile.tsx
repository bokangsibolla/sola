import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn } from 'react-native-reanimated';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { countries } from '@/data/geo';
import { colors, fonts, radius } from '@/constants/design';

const BIO_MAX = 140;

const POPULAR_ISO = ['US', 'GB', 'AU', 'DE', 'FR', 'BR', 'TH', 'JP', 'ES', 'IT'];

export default function ProfileScreen() {
  const router = useRouter();
  const { navigateToNextScreen, trackScreenView } = useOnboardingNavigation();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [search, setSearch] = useState('');

  // A/B Testing: Check which optional fields to show
  const showBio = onboardingStore.shouldShowQuestion('bio');
  const showPhoto = onboardingStore.shouldShowQuestion('photo');

  // Track screen view
  useEffect(() => {
    trackScreenView('profile');
  }, [trackScreenView]);

  const displayedCountries = useMemo(() => {
    if (search.length < 2) {
      return POPULAR_ISO
        .map((iso) => countries.find((c) => c.iso2 === iso))
        .filter(Boolean) as typeof countries;
    }
    const q = search.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [search]);

  const selectedCountryData = selectedCountry
    ? countries.find((c) => c.iso2 === selectedCountry)
    : null;
  const selectedInList = displayedCountries.some((c) => c.iso2 === selectedCountry);

  const remaining = BIO_MAX - bio.length;
  const counterColor =
    remaining <= 10 ? '#E53E3E' : remaining <= 30 ? colors.orange : colors.textMuted;

  const canContinue = firstName.trim().length > 0 && selectedCountry.length > 0;

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePhotoPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take photo', 'Choose from library'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) pickImage(true);
          if (index === 2) pickImage(false);
        },
      );
    } else {
      pickImage(false);
    }
  };

  const handleCountrySelect = (iso2: string) => {
    setSelectedCountry(iso2);
    setSearch('');
  };

  const handleBioChange = (text: string) => {
    if (text.length <= BIO_MAX) setBio(text);
  };

  const handleContinue = () => {
    const country = countries.find((c) => c.iso2 === selectedCountry);
    onboardingStore.set('firstName', firstName.trim());
    onboardingStore.set('bio', bio.trim());
    onboardingStore.set('photoUri', photoUri);
    onboardingStore.set('countryIso2', selectedCountry);
    onboardingStore.set('countryName', country?.name ?? '');

    // Track which questions were answered vs skipped
    const answered: string[] = ['first_name', 'country']; // Always required
    const skipped: string[] = [];

    if (showBio) {
      if (bio.trim()) {
        answered.push('bio');
      } else {
        skipped.push('bio');
      }
    }

    if (showPhoto) {
      if (photoUri) {
        answered.push('photo');
      } else {
        skipped.push('photo');
      }
    }

    navigateToNextScreen('profile', {
      answeredQuestions: answered,
      skippedQuestions: skipped,
    });
  };

  return (
    <OnboardingScreen
      stage={3}
      screenName="profile"
      headline="Tell us about you"
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Photo + name row */}
        <View style={styles.topRow}>
          {showPhoto && (
            <Pressable onPress={handlePhotoPress} style={styles.photoWrapper}>
              <View style={styles.photoCircle}>
                {photoUri ? (
                  <Animated.Image
                    entering={FadeIn.duration(300)}
                    source={{ uri: photoUri }}
                    style={styles.photoImage}
                  />
                ) : (
                  <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
                )}
              </View>
              <Text style={styles.photoLabel}>{photoUri ? 'Change' : 'Add later'}</Text>
            </Pressable>
          )}

          <View style={[styles.nameColumn, !showPhoto && styles.nameColumnFull]}>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoFocus={false}
            />
            {showBio && (
              <View style={styles.bioContainer}>
                <TextInput
                  style={styles.bioInput}
                  placeholder="Something you'd want a fellow traveler to know..."
                  placeholderTextColor={colors.textMuted}
                  value={bio}
                  onChangeText={handleBioChange}
                  multiline
                  maxLength={BIO_MAX}
                  autoFocus={false}
                />
                <Text style={[styles.bioCounter, { color: counterColor }]}>{remaining}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Country section */}
        <Text style={styles.sectionLabel}>Where are you from?</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoFocus={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {selectedCountryData && !selectedInList && (
          <View style={styles.selectedBadge}>
            <Pill
              label={`${selectedCountryData.flag ?? ''} ${selectedCountryData.name}`}
              selected={true}
              onPress={() => setSelectedCountry('')}
            />
          </View>
        )}

        <View style={styles.pillGrid}>
          {displayedCountries.map((country) => (
            <Pill
              key={country.iso2}
              label={`${country.flag ?? ''} ${country.name}`}
              selected={selectedCountry === country.iso2}
              onPress={() => handleCountrySelect(country.iso2)}
            />
          ))}
          {search.length >= 2 && displayedCountries.length === 0 && (
            <Text style={styles.noResults}>No countries found</Text>
          )}
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  photoWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  photoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 80,
    height: 80,
  },
  photoLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  nameColumn: {
    flex: 1,
    gap: 8,
  },
  nameColumnFull: {
    // When photo is hidden, name column takes full width
  },
  input: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  bioContainer: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 56,
  },
  bioInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 24,
    padding: 0,
  },
  bioCounter: {
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedBadge: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  noResults: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
