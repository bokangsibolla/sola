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
import type {
  TogetherPostWithAuthor,
  ActivityCategory,
  TogetherPostType,
} from '@/data/together/types';

interface TogetherCardProps {
  post: TogetherPostWithAuthor;
  onPress: () => void;
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

const POST_TYPE_LABELS: Record<TogetherPostType, string> = {
  open_plan: 'Open Plan',
  looking_for: 'Looking for',
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

export const TogetherCard: React.FC<TogetherCardProps> = ({ post, onPress }) => {
  const { author } = post;
  const avatarUri = getImageUrl(author.avatarUrl, { width: 64, height: 64 });
  const spotsLeft = post.maxCompanions - post.acceptedCount;
  const categoryLabel = CATEGORY_LABELS[post.activityCategory] ?? 'Other';
  const postTypeLabel = POST_TYPE_LABELS[post.postType];

  const locationParts: string[] = [];
  if (post.cityName) locationParts.push(post.cityName);
  if (post.countryName) locationParts.push(post.countryName);
  const locationText = locationParts.join(', ');

  let dateDisplay: string;
  if (post.isFlexible) {
    dateDisplay = 'Flexible';
  } else if (post.activityDate) {
    dateDisplay = formatActivityDate(post.activityDate);
    if (post.startTime) {
      dateDisplay += ` at ${formatTime(post.startTime)}`;
    }
  } else {
    dateDisplay = 'Flexible';
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Author row */}
      <View style={styles.authorRow}>
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
        </Text>
        {author.travelStyleTags.length > 0 && (
          <View style={styles.tagRow}>
            {author.travelStyleTags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.styleTag}>
                <Text style={styles.styleTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Category pill + post type */}
      <View style={styles.metaRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{categoryLabel}</Text>
        </View>
        <Text style={styles.postTypeLabel}>{postTypeLabel}</Text>
      </View>

      {/* Date row */}
      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.dateText}>{dateDisplay}</Text>
      </View>

      {/* Location row */}
      {locationText.length > 0 && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
      )}

      {/* Description */}
      {post.description != null && post.description.length > 0 && (
        <Text style={styles.description} numberOfLines={2}>
          {post.description}
        </Text>
      )}

      {/* Bottom row: spots + request status */}
      <View style={styles.bottomRow}>
        <Text style={styles.spotsText}>
          {spotsLeft > 0
            ? `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`
            : 'Full'}
        </Text>
        {post.userRequestStatus === 'pending' && (
          <Text style={styles.requestedLabel}>Requested</Text>
        )}
        {post.userRequestStatus === 'accepted' && (
          <Text style={styles.acceptedLabel}>Accepted</Text>
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
  tagRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexShrink: 1,
  },
  styleTag: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  styleTagText: {
    ...typography.pillLabel,
    color: colors.textSecondary,
  },

  // Title
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  // Category + post type row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryPill: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryPillText: {
    ...typography.pillLabel,
    color: colors.orange,
  },
  postTypeLabel: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },

  // Location row
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },

  // Description
  description: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  spotsText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  requestedLabel: {
    ...typography.caption,
    color: colors.orange,
    fontFamily: fonts.medium,
  },
  acceptedLabel: {
    ...typography.caption,
    color: colors.greenSoft,
    fontFamily: fonts.medium,
  },
});
