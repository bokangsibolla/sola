import CheckboxRow from '@/components/onboarding/CheckboxRow';
import CountryAutocompleteInput from '@/components/onboarding/CountryAutocompleteInput';
import PolarstepsShell from '@/components/onboarding/PolarstepsShell';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Body, Label } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { countries, Country } from '@/data/geo';
import { onboardingStore } from '@/state/onboardingStore';
import { getAuthUserData } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Placeholder map image
const MAP_PLACEHOLDER = require('@/assets/images/orange-gradient.png');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(onboardingStore.getProfilePhoto());
  const [firstName, setFirstName] = useState(onboardingStore.getFirstName() || '');
  const [middleName, setMiddleName] = useState(onboardingStore.getMiddleName() || '');
  const [lastName, setLastName] = useState(onboardingStore.getLastName() || '');
  const [homeCountry, setHomeCountry] = useState<Country | null>(() => {
    const stored = onboardingStore.getHomeCountry();
    if (stored) {
      return countries.find((c: Country) => c.name === stored || c.iso2 === stored) || null;
    }
    return null;
  });
  const [bio, setBio] = useState(onboardingStore.getBio() || '');
  const [womenConfirmed, setWomenConfirmed] = useState(onboardingStore.getWomenOnlyConfirmed() || false);

  // Prefill from auth on mount
  useEffect(() => {
    const loadAuthData = async () => {
      const authData = await getAuthUserData();
      if (authData.name && !firstName) {
        setFirstName(authData.name);
      }
      if (authData.avatarUrl && !profilePhoto) {
        setProfilePhoto(authData.avatarUrl);
      }
    };
    loadAuthData();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (profilePhoto) {
      onboardingStore.setProfilePhoto(profilePhoto);
    }
    
    onboardingStore.setFirstName(firstName);
    onboardingStore.setMiddleName(middleName);
    onboardingStore.setLastName(lastName);
    onboardingStore.setBio(bio);
    onboardingStore.setWomenOnlyConfirmed(womenConfirmed);
    if (homeCountry) {
      // Store ISO2 + country name
      onboardingStore.setHomeCountry(homeCountry.iso2);
      onboardingStore.setHomeCountryName(homeCountry.name);
    }
    router.push('/(onboarding)/intent');
  };

  // Validation: photo required, first name and last name required, and confirmation
  const hasValidName = firstName.trim().length > 0 && lastName.trim().length > 0;
  const canContinue = profilePhoto && hasValidName && womenConfirmed;

  const displayName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return (
    <PolarstepsShell showOrangeGradient={true}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <ProgressIndicator currentStep={1} totalSteps={5} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.card}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Body style={styles.title}>Fill in your profile</Body>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <Pressable onPress={handlePickImage} style={styles.avatarButton}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="add" size={24} color={theme.colors.brand} />
                    <Label style={styles.avatarText}>Upload</Label>
                  </View>
                )}
              </Pressable>
              {displayName ? (
                <Body style={styles.nameText}>{displayName}</Body>
              ) : null}
            </View>

            {/* Name Fields */}
            <View style={styles.field}>
              <Label style={styles.label}>First name *</Label>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={theme.colors.muted}
              />
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>Middle name (optional)</Label>
              <TextInput
                style={styles.input}
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Middle name"
                placeholderTextColor={theme.colors.muted}
              />
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>Last name *</Label>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={theme.colors.muted}
              />
            </View>

            {/* Home Location Field */}
            <View style={styles.field}>
              <Label style={styles.label}>Set your home location</Label>
              <CountryAutocompleteInput
                value={homeCountry ? (homeCountry.flag ? `${homeCountry.flag} ${homeCountry.name}` : homeCountry.name) : ''}
                onChange={(country) => setHomeCountry(country)}
                placeholder="Search for a country"
                showSearchIcon={true}
              />
            </View>

            {/* Confirmation Checkbox */}
            <View style={styles.field}>
              <CheckboxRow
                label="I confirm I'm a woman"
                checked={womenConfirmed}
                onToggle={() => {
                  Keyboard.dismiss();
                  setWomenConfirmed(!womenConfirmed);
                }}
              />
            </View>

            {/* Short Bio Field - Optional, can be removed if needed to fit */}
            {/* <View style={styles.field}>
              <Label style={styles.label}>Write a short bio (optional)</Label>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Write a short bio"
                  placeholderTextColor={theme.colors.muted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={140}
                />
                <Label style={styles.charCount}>{140 - bio.length}</Label>
              </View>
            </View> */}
          </ScrollView>
        </View>

        {/* Continue Button */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </PolarstepsShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: 400,
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
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 24,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
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
