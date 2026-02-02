import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { mockCollections } from '@/data/mock';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function ProfileScreen() {
  const router = useRouter();
  const data = onboardingStore.getData();
  const country = countries.find((c) => c.iso2 === data.countryIso2);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {data.photoUri ? (
              <Image source={{ uri: data.photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={colors.textMuted} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{data.firstName || 'Traveler'}</Text>
          {country && (
            <Text style={styles.origin}>{country.flag ?? ''} {country.name}</Text>
          )}
          {data.bio ? (
            <Text style={styles.bio}>{data.bio}</Text>
          ) : null}

          <Pressable
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create-outline" size={16} color={colors.orange} />
            <Text style={styles.editButtonText}>Edit profile</Text>
          </Pressable>
        </View>

        {/* Interests */}
        {data.dayStyle.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {data.dayStyle.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Collections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          {mockCollections.length === 0 ? (
            <Text style={styles.emptyText}>
              Save places into collections as you explore.
            </Text>
          ) : (
            mockCollections.map((col) => (
              <Pressable
                key={col.id}
                style={styles.collectionRow}
                onPress={() => router.push(`/profile/collections/${col.id}`)}
              >
                <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                <View style={styles.collectionText}>
                  <Text style={styles.collectionName}>{col.name}</Text>
                  <Text style={styles.collectionCount}>
                    {col.placeIds.length} {col.placeIds.length === 1 ? 'place' : 'places'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </View>

        {/* Settings link */}
        <Pressable
          style={styles.settingsRow}
          onPress={() => router.push('/profile/settings')}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.settingsText}>Privacy & settings</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        {/* Messages link */}
        <Pressable
          style={styles.settingsRow}
          onPress={() => router.push('/home/dm')}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.settingsText}>Messages</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  collectionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  collectionText: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  collectionCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  settingsText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
