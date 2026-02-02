import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfileById, getSavedPlaces, getPlaceById, getPlaceFirstImage, getCityById } from '@/data/api';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = getProfileById(id!);

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  const currentCity = profile.currentCityId ? getCityById(profile.currentCityId) : null;
  const savedPlaces = getSavedPlaces(profile.id);
  const resolvedPlaces = savedPlaces
    .map((sp) => {
      const place = getPlaceById(sp.placeId);
      if (!place) return null;
      const image = getPlaceFirstImage(place.id);
      return { ...place, imageUrl: image };
    })
    .filter(Boolean) as (ReturnType<typeof getPlaceById> & { imageUrl: string | null })[];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={36} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.name}>{profile.firstName}</Text>
          <Text style={styles.origin}>
            {profile.homeCountryIso2 ? countryFlag(profile.homeCountryIso2) + ' ' : ''}
            {profile.homeCountryName}
          </Text>
          {(currentCity || profile.currentCityName) && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.orange} />
              <Text style={styles.currentCity}>
                Currently in {currentCity?.name ?? profile.currentCityName}
              </Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Travel style */}
        {profile.travelStyle && (
          <>
            <Text style={styles.sectionTitle}>Travel style</Text>
            <Text style={styles.travelStyle}>{profile.travelStyle}</Text>
          </>
        )}

        {/* Saved places */}
        {resolvedPlaces.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Saved places</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placesRow}
            >
              {resolvedPlaces.map((place) => (
                <View key={place!.id} style={styles.placeCard}>
                  {place!.imageUrl ? (
                    <Image source={{ uri: place!.imageUrl }} style={styles.placeImage} />
                  ) : (
                    <View style={[styles.placeImage, styles.placeImagePlaceholder]}>
                      <Ionicons name="image-outline" size={20} color={colors.textMuted} />
                    </View>
                  )}
                  <Text style={styles.placeName} numberOfLines={1}>
                    {place!.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Message button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable
          style={styles.messageButton}
          onPress={() => router.push(`/home/dm/${profile.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.background} />
          <Text style={styles.messageButtonText}>Message</Text>
        </Pressable>
      </View>
    </View>
  );
}

function countryFlag(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  origin: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  currentCity: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  bio: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xl,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  travelStyle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  placesRow: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  placeCard: {
    width: 140,
  },
  placeImage: {
    width: 140,
    height: 100,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  placeImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  bottomBar: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  messageButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
