import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockUsers } from '@/data/mock';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = mockUsers.find((u) => u.id === id);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  const countryData = countries.find((c) => c.iso2 === user.countryIso2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          style={styles.messageButton}
          onPress={() => router.push(`/home/dm/${user.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.orange} />
          <Text style={styles.messageButtonText}>Message</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          {user.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.origin}>
            {countryData?.flag ?? ''} {user.countryName}
          </Text>
          {user.currentCity && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.orange} />
              <Text style={styles.currentCity}>Currently in {user.currentCity}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        <Text style={styles.bio}>{user.bio}</Text>

        {/* Interests */}
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.tags}>
          {user.interests.map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Places visited */}
        <Text style={styles.sectionTitle}>Places visited</Text>
        <View style={styles.flags}>
          {user.placesVisited.map((iso) => {
            const c = countries.find((cc) => cc.iso2 === iso);
            return (
              <Text key={iso} style={styles.flag}>{c?.flag ?? iso}</Text>
            );
          })}
        </View>

        {/* Travel style */}
        <Text style={styles.sectionTitle}>Travel style</Text>
        <Text style={styles.travelStyle}>{user.travelStyle}</Text>
      </ScrollView>
    </View>
  );
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
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
  flags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.xl,
  },
  flag: {
    fontSize: 28,
  },
  travelStyle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
