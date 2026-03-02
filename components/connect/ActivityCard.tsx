import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  fonts,
  spacing,
  radius,
  typography,
  pressedState,
} from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import { getFlag } from '@/data/trips/helpers';
import { useAuth } from '@/state/AuthContext';
import type {
  TogetherPostWithAuthor,
  ActivityCategory,
} from '@/data/together/types';

interface ActivityCardProps {
  post: TogetherPostWithAuthor;
  onPress: () => void;
  onAuthorPress: () => void;
}

const AVATAR_SIZE = 32;

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  food: 'Food',
  culture: 'Culture',
  adventure: 'Adventure',
  nightlife: 'Nightlife',
  day_trip: 'Day trip',
  wellness: 'Wellness',
  shopping: 'Shopping',
  other: 'Other',
};

function formatActivityDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  post,
  onPress,
  onAuthorPress,
}) => {
  const { userId } = useAuth();
  const { author } = post;
  const isOwnPost = post.userId === userId;
  const avatarUri = getImageUrl(author.avatarUrl, { width: 64, height: 64 });
  const spotsLeft = post.maxCompanions - post.acceptedCount;
  const isFull = spotsLeft <= 0;
  const categoryLabel = CATEGORY_LABELS[post.activityCategory] ?? 'Other';

  // Build date/time display
  let whenText: string;
  if (post.isFlexible) {
    whenText = 'Flexible';
  } else if (post.activityDate) {
    whenText = formatActivityDate(post.activityDate);
    if (post.startTime) {
      whenText += ` ${formatTime(post.startTime)}`;
    }
  } else {
    whenText = 'Flexible';
  }

  // Build spots display
  const spotsText = isFull
    ? undefined
    : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Author row */}
      {isOwnPost ? (
        <Text style={styles.ownPostLabel}>Your post</Text>
      ) : (
        <Pressable style={styles.authorRow} onPress={onAuthorPress}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={16} color={colors.textMuted} />
              </View>
            )}
          </View>
          <Text style={styles.authorName} numberOfLines={1}>
            {author.firstName}
            {post.countryIso2 ? ` ${getFlag(post.countryIso2)}` : ''}
          </Text>
        </Pressable>
      )}

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Description */}
      {post.description != null && post.description.length > 0 && (
        <Text style={styles.description} numberOfLines={2}>
          {post.description}
        </Text>
      )}

      {/* Bottom row: category pill + when + spots */}
      <View style={styles.bottomRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{categoryLabel}</Text>
        </View>
        <Text style={styles.whenText}>{whenText}</Text>
        {isFull ? (
          <View style={styles.fullPill}>
            <Text style={styles.fullPillText}>Full</Text>
          </View>
        ) : (
          spotsText != null && (
            <Text style={styles.spotsText}>{spotsText}</Text>
          )
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as unknown as { scale: number }[],
  },

  // Author row
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  ownPostLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  // Title
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  // Description
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryPill: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryPillText: {
    ...typography.pillLabel,
    color: colors.orange,
  },
  whenText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  spotsText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  fullPill: {
    backgroundColor: colors.greenFill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fullPillText: {
    ...typography.pillLabel,
    color: colors.greenSoft,
  },
});
