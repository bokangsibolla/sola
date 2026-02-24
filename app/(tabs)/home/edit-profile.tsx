import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/uploadAvatar';
import { getProfileById, checkUsernameAvailability, validateUsernameFormat, getUserVisitedCountries, setVisitedCountries as saveVisitedCountries, getProfileTags, setProfileTags } from '@/data/api';
import VisitedCountriesEditor from '@/components/travelers/VisitedCountriesEditor';
import { InterestPicker } from '@/components/profile/InterestPicker';
import { ALL_INTERESTS } from '@/constants/interests';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';

const BIO_MAX = 140;

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  useEffect(() => {
    posthog.capture('edit_profile_screen_viewed');
  }, [posthog]);

  const { data: profile, loading, error, refetch } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['edit-profile', userId],
  );

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [visitedCountryIds, setVisitedCountryIds] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch existing profile tags
  const { data: existingTags } = useData(
    () => (userId ? getProfileTags(userId) : Promise.resolve([])),
    ['edit-profile-tags', userId],
  );

  // Populate form once profile loads
  useEffect(() => {
    if (profile && !initialized) {
      setPhotoUri(profile.avatarUrl);
      setFirstName(profile.firstName);
      setBio(profile.bio ?? '');
      setSelectedCountry(profile.homeCountryIso2 ?? '');
      setUsername(profile.username ?? '');
      setInitialized(true);
    }
  }, [profile, initialized]);

  // Seed selected tags from existing profile tags
  useEffect(() => {
    if (existingTags && existingTags.length > 0 && selectedTagSlugs.length === 0) {
      setSelectedTagSlugs(existingTags.map((t) => t.tagSlug));
    }
  }, [existingTags]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }
    const formatCheck = validateUsernameFormat(username);
    if (!formatCheck.valid) {
      setUsernameStatus('invalid');
      setUsernameError(formatCheck.error ?? 'Invalid username');
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username, userId ?? undefined);
        if (result.available) {
          setUsernameStatus('available');
          setUsernameError(null);
        } else {
          setUsernameStatus('taken');
          setUsernameError(result.error ?? 'Username taken');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, profile?.username, userId]);

  // Load visited countries
  useEffect(() => {
    if (userId) {
      getUserVisitedCountries(userId).then((countries) => {
        setVisitedCountryIds(countries.map((c) => c.countryId));
      }).catch(() => {});
    }
  }, [userId]);

  const displayedCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (q.length < 2) return [];
    return countries.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [countrySearch]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const remaining = BIO_MAX - bio.length;
  const counterColor =
    remaining <= 10 ? '#E53E3E' : remaining <= 30 ? colors.orange : colors.textMuted;

  // Image picker with permission handling
  const pickImage = async (fromCamera: boolean) => {
    // Request permission first
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
      posthog.capture('profile_photo_selected', { source: fromCamera ? 'camera' : 'gallery' });
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

  const handleBioChange = (text: string) => {
    if (text.length <= BIO_MAX) setBio(text);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    // 0. Refresh auth session to avoid expired JWT / RLS silent failures
    await supabase.auth.refreshSession();

    // 1. Upload avatar separately — don't block profile save if photo fails
    let avatarUrl = photoUri;
    if (photoUri && !photoUri.startsWith('http')) {
      try {
        avatarUrl = await uploadAvatar(userId, photoUri);
      } catch (err: any) {
        console.warn('[edit-profile] Avatar upload failed:', err.message);
        avatarUrl = profile?.avatarUrl ?? null; // fallback to existing
      }
    }

    // 2. Save profile via update (not upsert) so we detect RLS failures
    try {
      const country = countries.find((c) => c.iso2 === selectedCountry);
      const { data: updated, error: updateError } = await supabase.from('profiles').update({
        first_name: firstName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        home_country_iso2: selectedCountry || null,
        home_country_name: country?.name ?? null,
        username: username.trim() || null,
      }).eq('id', userId).select('id');
      if (updateError) {
        Alert.alert('Save failed', updateError.message);
        setSaving(false);
        return;
      }
      if (!updated || updated.length === 0) {
        Alert.alert('Save failed', 'Could not update profile. Please sign out and back in.');
        setSaving(false);
        return;
      }

      // 3. Save profile tags (non-blocking)
      const tagsToSave = selectedTagSlugs.map((slug) => {
        const option = ALL_INTERESTS.find((o) => o.slug === slug);
        return {
          tagSlug: slug,
          tagLabel: option?.label ?? slug,
          tagGroup: option?.group ?? '',
        };
      });
      await setProfileTags(userId, tagsToSave).catch((err: any) =>
        console.warn('[edit-profile] Tags save failed:', err.message),
      );

      // 4. Save visited countries (non-blocking)
      await saveVisitedCountries(userId, visitedCountryIds).catch((err: any) =>
        console.warn('[edit-profile] Visited countries save failed:', err.message),
      );

      // 5. Invalidate ALL cached data so profile, home, etc. pick up changes
      queryClient.invalidateQueries({ queryKey: ['useData'] });
      posthog.capture('profile_updated', { has_photo: !!avatarUrl, interests_count: selectedTagSlugs.length, visited_countries_count: visitedCountryIds.length });
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Save failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Edit profile" parentTitle="Profile" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo */}
        <View style={styles.photoSection}>
          <Pressable onPress={handlePhotoPress} style={styles.photoWrapper}>
            <View style={styles.photoCircle}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" transition={200} />
              ) : (
                <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.photoLabel}>{photoUri ? 'Change photo' : 'Add photo'}</Text>
          </Pressable>
        </View>

        {/* Name */}
        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={colors.textMuted}
        />

        {/* Username */}
        <Text style={styles.fieldLabel}>Username</Text>
        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted }}>@</Text>
          <TextInput
            style={{ flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.textPrimary, padding: 0 }}
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />
          {usernameStatus === 'checking' && (
            <ActivityIndicator size="small" color={colors.orange} />
          )}
          {usernameStatus === 'available' && (
            <Ionicons name="checkmark-circle" size={20} color={colors.greenSoft} />
          )}
          {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
            <Ionicons name="close-circle" size={20} color="#E53E3E" />
          )}
        </View>
        {usernameError && (
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: '#E53E3E', marginTop: 4, marginBottom: spacing.md }}>
            {usernameError}
          </Text>
        )}

        {/* Bio */}
        <Text style={styles.fieldLabel}>Bio</Text>
        <View style={styles.bioContainer}>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={handleBioChange}
            placeholder="Something you'd want a fellow traveler to know..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={BIO_MAX}
          />
          <Text style={[styles.bioCounter, { color: counterColor }]}>{remaining}</Text>
        </View>

        {/* Country */}
        <Text style={styles.fieldLabel}>Where are you from?</Text>
        {selectedCountry && !countrySearch ? (
          <Pressable
            style={styles.selectedCountryRow}
            onPress={() => setCountrySearch(' ')}
          >
            <Text style={styles.selectedCountryText}>
              {countries.find((c) => c.iso2 === selectedCountry)?.flag ?? ''}{' '}
              {countries.find((c) => c.iso2 === selectedCountry)?.name ?? selectedCountry}
            </Text>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for your country..."
                placeholderTextColor={colors.textMuted}
                value={countrySearch.trim() ? countrySearch : ''}
                onChangeText={setCountrySearch}
                autoFocus={!!selectedCountry}
              />
              {countrySearch.trim().length > 0 && (
                <Pressable onPress={() => setCountrySearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
            {countrySearch.trim().length >= 2 && displayedCountries.length > 0 && (
              <View style={styles.countryDropdown}>
                {displayedCountries.map((c) => (
                  <Pressable
                    key={c.iso2}
                    style={({ pressed }) => [styles.countryRow, pressed && { backgroundColor: colors.neutralFill }]}
                    onPress={() => {
                      setSelectedCountry(c.iso2);
                      setCountrySearch('');
                    }}
                  >
                    <Text style={styles.countryRowText}>
                      {c.flag ?? ''} {c.name}
                    </Text>
                    {selectedCountry === c.iso2 && (
                      <Ionicons name="checkmark" size={18} color={colors.orange} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
            {countrySearch.trim().length >= 2 && displayedCountries.length === 0 && (
              <Text style={styles.noResults}>No countries found</Text>
            )}
          </>
        )}

        {/* Interests */}
        <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>Interests</Text>
        <InterestPicker
          selected={selectedTagSlugs}
          onChange={setSelectedTagSlugs}
        />

        {/* Countries visited */}
        <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>Countries I've visited</Text>
        <VisitedCountriesEditor
          selectedIds={visitedCountryIds}
          onChange={setVisitedCountryIds}
        />

        {/* Save */}
        <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save changes'}</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    fontSize: 13,
    color: colors.orange,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.lg,
  },
  bioContainer: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 80,
    marginBottom: spacing.lg,
  },
  bioInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 40,
    padding: 0,
  },
  bioCounter: {
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
  },
  selectedCountryText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  changeText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  countryDropdown: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  countryRowText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  noResults: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
