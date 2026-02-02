import React, { useState } from 'react';
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
import { getGreeting } from '@/data/greetings';
import { colors, fonts, radius } from '@/constants/design';

const POPULAR_COUNTRIES = ['TH', 'JP', 'ID', 'PT', 'IT', 'ES', 'MX', 'KR', 'VN', 'GR'];

export default function ProfileScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const photoScale = useSharedValue(1);

  const filteredCountries =
    countrySearch.length >= 2
      ? countries.filter((c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()),
        )
      : [];

  const canContinue = firstName.trim().length > 0 && selectedCountry.length > 0;

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

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
        {
          options: ['Cancel', 'Take photo', 'Choose from library'],
          cancelButtonIndex: 0,
        },
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
    setCountrySearch('');
  };

  const handleContinue = () => {
    const country = countries.find((c) => c.iso2 === selectedCountry);
    onboardingStore.set('firstName', firstName.trim());
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo circle */}
        <View style={styles.photoSection}>
          <Pressable onPress={handlePhotoPress}>
            <Animated.View style={[styles.photoCircle, photoAnimatedStyle]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
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

        {/* Country section */}
        <Text style={styles.sectionLabel}>Where are you based?</Text>

        {/* Popular country pills */}
        <View style={styles.pillGrid}>
          {POPULAR_COUNTRIES.map((iso2) => {
            const country = countries.find((c) => c.iso2 === iso2);
            if (!country) return null;
            const greeting = getGreeting(iso2);
            return (
              <Pill
                key={iso2}
                label={`${country.flag ?? ''} ${country.name}`}
                subtitle={greeting}
                selected={selectedCountry === iso2}
                onPress={() => handleCountrySelect(iso2)}
              />
            );
          })}
        </View>

        {/* Country search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            placeholderTextColor={colors.textMuted}
            value={countrySearch}
            onChangeText={setCountrySearch}
            autoFocus={false}
          />
        </View>

        {/* Search results */}
        {filteredCountries.length > 0 && (
          <View style={styles.searchResults}>
            {filteredCountries.slice(0, 6).map((country) => (
              <Pressable
                key={country.iso2}
                style={styles.searchResultItem}
                onPress={() => handleCountrySelect(country.iso2)}
              >
                <Text style={styles.searchResultText}>
                  {country.flag ?? ''} {country.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 104,
    height: 104,
  },
  confirmText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  input: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
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
  searchResults: {
    marginTop: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  searchResultText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
