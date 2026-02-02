import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { getProfiles, getCityById } from '@/data/api';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function HomeScreen() {
  const router = useRouter();
  const profiles = getProfiles();

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        }
        rightComponent={
          <Pressable onPress={() => router.push('/home/dm')} hitSlop={12}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Travelers near you</Text>
        <Text style={styles.sectionSubtitle}>Women exploring the world right now</Text>

        <View style={styles.feed}>
          {profiles.map((profile) => {
            const city = profile.currentCityId ? getCityById(profile.currentCityId) : null;
            return (
              <Pressable
                key={profile.id}
                style={styles.card}
                onPress={() => router.push(`/home/user/${profile.id}`)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.avatarWrap}>
                    {profile.avatarUrl ? (
                      <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={24} color={colors.textMuted} />
                      </View>
                    )}
                    {profile.isOnline && <View style={styles.onlineDot} />}
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{profile.firstName}</Text>
                    {(city || profile.currentCityName) && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location" size={12} color={colors.orange} />
                        <Text style={styles.locationText}>
                          {city?.name ?? profile.currentCityName}
                        </Text>
                      </View>
                    )}
                    {profile.bio && (
                      <Text style={styles.cardBio} numberOfLines={1}>
                        {profile.bio}
                      </Text>
                    )}
                  </View>
                </View>

                {profile.interests.length > 0 && (
                  <View style={styles.tags}>
                    {profile.interests.map((interest) => (
                      <View key={interest} style={styles.tag}>
                        <Text style={styles.tagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {profile.travelStyle && (
                  <Text style={styles.travelStyle}>{profile.travelStyle}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 22,
    width: 60,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  feed: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.greenSoft,
    borderWidth: 2,
    borderColor: colors.background,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  cardBio: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  travelStyle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
