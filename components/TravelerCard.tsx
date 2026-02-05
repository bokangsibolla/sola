import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import type { Profile, ConnectionStatus } from '@/data/types';

interface TravelerCardProps {
  profile: Profile;
  connectionStatus: ConnectionStatus;
  sharedInterests?: string[];
  contextLabel?: string;
  onPress: () => void;
  onConnect: () => void;
}

export default function TravelerCard({
  profile,
  connectionStatus,
  sharedInterests = [],
  contextLabel,
  onPress,
  onConnect,
}: TravelerCardProps) {
  const displayInterests = sharedInterests.length > 0
    ? sharedInterests.slice(0, 4)
    : (profile.interests ?? []).slice(0, 4);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: getImageUrl(profile.avatarUrl, { width: 112, height: 112 }) ?? undefined }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={22} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile.firstName}</Text>
          {(profile.locationCityName || profile.homeCountryName) && (
            <Text style={styles.location}>
              {profile.locationCityName ?? profile.homeCountryName}
              {profile.nationality ? ` · ${profile.nationality}` : ''}
            </Text>
          )}
          {contextLabel && (
            <Text style={styles.contextLabel}>{contextLabel}</Text>
          )}
        </View>
      </View>

      {profile.bio && (
        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
      )}

      {displayInterests.length > 0 && (
        <View style={styles.tags}>
          {displayInterests.map((interest) => (
            <View
              key={interest}
              style={[
                styles.tag,
                sharedInterests.includes(interest) && styles.tagShared,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  sharedInterests.includes(interest) && styles.tagTextShared,
                ]}
              >
                {interest}
              </Text>
            </View>
          ))}
        </View>
      )}

      {connectionStatus === 'none' && (
        <Pressable
          style={styles.connectButton}
          onPress={(e) => {
            e.stopPropagation();
            onConnect();
          }}
        >
          <Feather name="user-plus" size={14} color={colors.orange} />
          <Text style={styles.connectButtonText}>Connect</Text>
        </Pressable>
      )}
      {connectionStatus === 'pending_sent' && (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Request sent</Text>
        </View>
      )}
      {connectionStatus === 'connected' && (
        <View style={[styles.statusPill, styles.statusPillConnected]}>
          <Feather name="check" size={12} color={colors.greenSoft} />
          <Text style={[styles.statusPillText, styles.statusPillTextConnected]}>Connected</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 2,
  },
  contextLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 2,
  },
  bio: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagShared: {
    backgroundColor: colors.orangeFill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagTextShared: {
    color: colors.orange,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
  },
  connectButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralFill,
  },
  statusPillConnected: {
    backgroundColor: colors.greenFill,
  },
  statusPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  statusPillTextConnected: {
    color: colors.greenSoft,
  },
});
