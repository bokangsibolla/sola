import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
interface User {
  id: string;
  firstName: string;
  bio: string;
  photoUrl: string | null;
  countryName: string;
  currentCity: string | null;
  interests: string[];
  isOnline: boolean;
}

interface TravelerCardProps {
  user: User;
  onPress: () => void;
}

export default function TravelerCard({ user, onPress }: TravelerCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color={colors.textMuted} />
            </View>
          )}
          {user.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.location}>
            {user.currentCity ? `${user.currentCity} · ` : ''}{user.countryName}
          </Text>
        </View>
      </View>
      <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
      <View style={styles.tags}>
        {user.interests.slice(0, 2).map((interest) => (
          <View key={interest} style={styles.tag}>
            <Text style={styles.tagText}>{interest}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.greenSoft,
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
});
