// app/(tabs)/explore/activity/[slug].tsx
import { Pressable, ScrollView, StyleSheet, Text, View, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '@/components/ui/BackButton';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getActivityWithDetails } from '@/data/api';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, loading, error, refetch } = useData(
    () => slug ? getActivityWithDetails(slug) : Promise.resolve(undefined),
    [slug ?? ''],
  );

  const activity = data?.activity;
  const media = data?.media ?? [];
  const tags = data?.tags ?? [];

  // Get the hero image URL from media or use a placeholder
  const heroImageUrl = media[0]?.url ?? 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';

  // Format price level as dollar signs (1-4 scale)
  const formatPriceLevel = (level: number | null): string => {
    if (!level) return 'Price varies';
    return '$'.repeat(level);
  };

  // Handle "Check availability" button press
  const handleCheckAvailability = () => {
    if (activity?.website) {
      Linking.openURL(activity.website).catch(() => {
        Alert.alert('Error', 'Could not open the website');
      });
    } else {
      Alert.alert('Coming Soon', 'Booking will be available soon.');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error.message} onRetry={refetch} />;
  }

  if (!activity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFoundHeader}>
          <BackButton />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Activity not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer} pointerEvents="box-none">
          <Image
            source={{ uri: heroImageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            pointerEvents="none"
          />
          {/* Back Button Overlay */}
          <View style={[styles.backButton, { top: insets.top + spacing.sm }]}>
            <BackButton />
          </View>
          {/* Favorite Button Overlay */}
          <Pressable
            style={[styles.favoriteButton, { top: insets.top + spacing.sm }]}
            hitSlop={8}
          >
            <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{activity.name}</Text>

          {activity.address && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.location}>{activity.address}</Text>
            </View>
          )}

          {/* Rating row - uses Google rating if available */}
          {typeof activity.googleRating === 'number' && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.textPrimary} />
              <Text style={styles.ratingText}>{activity.googleRating.toFixed(1)}</Text>
              {activity.googleReviewCount != null && activity.googleReviewCount > 0 && (
                <Text style={styles.reviewCount}>
                  ({activity.googleReviewCount.toLocaleString()} reviews)
                </Text>
              )}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            {activity.estimatedDuration && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{activity.estimatedDuration}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>{formatPriceLevel(activity.priceLevel)}</Text>
            </View>
            {activity.physicalLevel && (
              <View style={styles.infoItem}>
                <Ionicons name="fitness-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Difficulty</Text>
                <Text style={styles.infoValue}>
                  {activity.physicalLevel.charAt(0).toUpperCase() + activity.physicalLevel.slice(1)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* About this experience */}
          <Text style={styles.sectionTitle}>About this experience</Text>
          <Text style={styles.description}>
            {activity.whySelected || activity.description || 'No description available.'}
          </Text>

          {/* What's included - from highlights array */}
          {activity.highlights && activity.highlights.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>What's included</Text>
              <View style={styles.includesList}>
                {activity.highlights.map((highlight, index) => (
                  <View key={index} style={styles.includeItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
                    <Text style={styles.includeText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Considerations - things to be aware of */}
          {activity.considerations && activity.considerations.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
                Good to know
              </Text>
              <View style={styles.includesList}>
                {activity.considerations.map((consideration, index) => (
                  <View key={index} style={styles.includeItem}>
                    <Ionicons name="information-circle" size={18} color={colors.orange} />
                    <Text style={styles.includeText}>{consideration}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag.id} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Booking info if available */}
          {activity.bookingInfo && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
                Booking info
              </Text>
              <Text style={styles.description}>{activity.bookingInfo}</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{formatPriceLevel(activity.priceLevel)}</Text>
        </View>
        <Pressable style={styles.bookButton} onPress={handleCheckAvailability}>
          <Text style={styles.bookButtonText}>Check availability</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFoundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    left: spacing.screenX,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    right: spacing.screenX,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.screenX,
    paddingBottom: 120,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  infoItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  includesList: {
    gap: spacing.md,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  includeText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  priceSuffix: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  bookButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
  },
});
