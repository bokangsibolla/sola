import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import { getFlag } from '@/data/trips/helpers';
import type { Profile, ConnectionStatus } from '@/data/types';

interface TravelerCardProps {
  profile: Profile;
  connectionStatus: ConnectionStatus;
  sharedInterests?: string[];
  contextLabel?: string;
  visitedCountryIso2s?: string[];
  onPress: () => void;
  onConnect: () => void;
}

export default function TravelerCard({
  profile,
  connectionStatus,
  sharedInterests = [],
  contextLabel,
  visitedCountryIso2s,
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
          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {(profile.locationCityName || profile.homeCountryName) && (
            <Text style={styles.location}>
              {profile.locationCityName ?? profile.homeCountryName}
              {profile.nationality ? ` · ${profile.nationality}` : ''}
            </Text>
          )}
          {contextLabel && (
            <Text style={styles.contextLabel}>{contextLabel}</Text>
          )}
          {visitedCountryIso2s && visitedCountryIso2s.length > 0 && (
            <View style={styles.flagRow}>
              {visitedCountryIso2s.slice(0, 5).map((iso2) => (
                <Text key={iso2} style={styles.miniFlag}>{getFlag(iso2)}</Text>
              ))}
              {visitedCountryIso2s.length > 5 && (
                <Text style={styles.flagCount}>+{visitedCountryIso2s.length - 5}</Text>
              )}
            </View>
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
    width: 64,
    height: 64,
    borderRadius: radius.full,
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
  username: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
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
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  miniFlag: {
    fontSize: 16,
    lineHeight: 20,
  },
  flagCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 2,
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
    borderRadius: radius.none,
  },
  tagShared: {
    backgroundColor: colors.orangeFill,
  },
  tagText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    fontSize: 11,
    color: colors.orange,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.neutralFill,
  },
  statusPillConnected: {
    backgroundColor: colors.greenFill,
  },
  statusPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusPillTextConnected: {
    color: colors.greenSoft,
  },
});
