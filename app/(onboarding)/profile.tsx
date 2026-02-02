import React, { useMemo, useState } from 'react';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { countries } from '@/data/geo';
import { colors, fonts, radius } from '@/constants/design';

const BIO_MAX = 140;

const POPULAR_ISO = ['US', 'GB', 'AU', 'DE', 'FR', 'BR', 'TH', 'JP', 'ES', 'IT'];

export default function ProfileScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [search, setSearch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const photoScale = useSharedValue(1);

  // When searching, show filtered results as pills. Otherwise show popular.
  const displayedCountries = useMemo(() => {
    if (search.length < 2) {
      return POPULAR_ISO
        .map((iso) => countries.find((c) => c.iso2 === iso))
        .filter(Boolean) as typeof countries;
    }
    const q = search.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [search]);

  // If selected country isn't in the displayed list, show it as a standalone pill
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
      photoScale.value = withSequence(
        withSpring(0.8, { damping: 15, stiffness: 150 }),
        withSpring(1.05, { damping: 15, stiffness: 150 }),
        withSpring(1, { damping: 15, stiffness: 150 }),
      );
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
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
    router.push('/(onboarding)/intent');
  };

  const photoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
  }));

  return (
    <OnboardingScreen
      stage={2}
      headline="Tell us about you"
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Photo circle */}
        <View style={styles.photoSection}>
          <Pressable onPress={handlePhotoPress}>
            <Animated.View style={[styles.photoCircle, photoAnimatedStyle]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <Ionicons name="add" size={36} color={colors.textMuted} />
              )}
            </Animated.View>
          </Pressable>
          {showConfirmation && (
            <Text style={styles.confirmText}>Looking great</Text>
          )}
        </View>

        {/* First name */}
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.textMuted}
          value={firstName}
          onChangeText={setFirstName}
          autoFocus={false}
        />

        {/* Bio */}
        <View style={styles.bioContainer}>
          <TextInput
            style={styles.bioInput}
            placeholder="A little about you..."
            placeholderTextColor={colors.textMuted}
            value={bio}
            onChangeText={handleBioChange}
            multiline
            maxLength={BIO_MAX}
            autoFocus={false}
          />
          <Text style={[styles.bioCounter, { color: counterColor }]}>{remaining}</Text>
        </View>

        {/* Country section */}
        <Text style={styles.sectionLabel}>Where are you from?</Text>

        {/* Search field */}
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

        {/* Selected country badge (if not visible in pills below) */}
        {selectedCountryData && !selectedInList && (
          <View style={styles.selectedBadge}>
            <Pill
              label={`${selectedCountryData.flag ?? ''} ${selectedCountryData.name}`}
              selected={true}
              onPress={() => setSelectedCountry('')}
            />
          </View>
        )}

        {/* Country pills */}
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 88,
    height: 88,
  },
  confirmText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
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
    marginBottom: 12,
  },
  bioContainer: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 16,
    minHeight: 56,
  },
  bioInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 24,
    padding: 0,
  },
  bioCounter: {
    fontFamily: fonts.regular,
    fontSize: 12,
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
