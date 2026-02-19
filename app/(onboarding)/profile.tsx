import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Linking,
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
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { FadeIn } from 'react-native-reanimated';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { countries } from '@/data/geo';
import { getCurrencyForCountry } from '@/lib/currency';
import { colors, fonts, radius } from '@/constants/design';

const POPULAR_ISO = ['US', 'GB', 'AU', 'DE', 'FR', 'BR', 'TH', 'JP', 'ES', 'IT'];

/** Minimum age: 16 years */
const MIN_AGE = 16;
const MAX_DATE = new Date();
MAX_DATE.setFullYear(MAX_DATE.getFullYear() - MIN_AGE);

/** Maximum age: 100 years */
const MIN_DATE = new Date();
MIN_DATE.setFullYear(MIN_DATE.getFullYear() - 100);

function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { navigateToNextScreen, trackScreenView } = useOnboardingNavigation();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [search, setSearch] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [confirmedWoman, setConfirmedWoman] = useState(false);

  // A/B Testing: Check which optional fields to show
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

  const canContinue =
    firstName.trim().length > 0 &&
    selectedCountry.length > 0 &&
    dateOfBirth !== null &&
    confirmedWoman;

  const pickImage = async (fromCamera: boolean) => {
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        fromCamera ? 'Camera Access Required' : 'Photo Access Required',
        fromCamera
          ? 'Please allow camera access in Settings to take a profile photo.'
          : 'Please allow photo library access in Settings to choose a profile photo.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

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
    onboardingStore.set('preferredCurrency', getCurrencyForCountry(iso2));
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleContinue = () => {
    const country = countries.find((c) => c.iso2 === selectedCountry);
    onboardingStore.set('firstName', firstName.trim());
    onboardingStore.set('photoUri', photoUri);
    onboardingStore.set('countryIso2', selectedCountry);
    onboardingStore.set('countryName', country?.name ?? '');

    if (dateOfBirth) {
      onboardingStore.set('dateOfBirth', dateOfBirth.toISOString().split('T')[0]);
    }

    // Track which questions were answered vs skipped
    const answered: string[] = ['first_name', 'country', 'date_of_birth'];
    const skipped: string[] = [];

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
      stage={1}
      screenName="profile"
      headline="Tell us about you"
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Gender confirmation */}
        <Pressable
          style={[styles.confirmRow, confirmedWoman && styles.confirmRowActive]}
          onPress={() => setConfirmedWoman(!confirmedWoman)}
        >
          <View style={[styles.checkbox, confirmedWoman && styles.checkboxActive]}>
            {confirmedWoman && (
              <Ionicons name="checkmark" size={14} color={colors.background} />
            )}
          </View>
          <Text style={styles.confirmText}>I identify as a woman</Text>
        </Pressable>
        <Text style={styles.confirmHint}>
          Sola is built for women travelers. This helps us keep the community safe.
        </Text>

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

        {/* Birthday section */}
        <Text style={[styles.sectionLabel, styles.birthdaySection]}>When were you born?</Text>
        <Text style={styles.sectionHint}>Used to personalise your experience</Text>

        <Pressable
          style={[styles.dateButton, dateOfBirth && styles.dateButtonSelected]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={dateOfBirth ? colors.textPrimary : colors.textMuted}
          />
          <Text style={[styles.dateText, !dateOfBirth && styles.datePlaceholder]}>
            {dateOfBirth ? formatDate(dateOfBirth) : 'Select your birthday'}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth ?? MAX_DATE}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={MAX_DATE}
            minimumDate={MIN_DATE}
            onChange={handleDateChange}
          />
        )}

        {Platform.OS === 'ios' && showDatePicker && (
          <Pressable style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        )}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    marginBottom: 8,
  },
  confirmRowActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  confirmText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  confirmHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 24,
  },
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
    borderRadius: radius.full,
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
  nameColumnFull: {},
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
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sectionHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -6,
    marginBottom: 12,
  },
  birthdaySection: {
    marginTop: 28,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    gap: 10,
  },
  dateButtonSelected: {
    borderColor: colors.orange,
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    color: colors.textMuted,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  doneText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
});
