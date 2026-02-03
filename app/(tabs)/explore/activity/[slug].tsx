// app/(tabs)/explore/activity/[slug].tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { mockActivities } from '@/data/exploreMockData';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const activity = mockActivities.find(a => a.slug === slug);

  if (!activity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFoundHeader}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
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
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: activity.heroImageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          {/* Back Button Overlay */}
          <Pressable
            style={[styles.backButton, { top: insets.top + spacing.sm }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          {/* Favorite Button Overlay */}
          <Pressable
            style={[styles.favoriteButton, { top: insets.top + spacing.sm }]}
          >
            <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{activity.name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.location}>{activity.cityName}, {activity.countryName}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.textPrimary} />
            <Text style={styles.ratingText}>{activity.rating.toFixed(2)}</Text>
            <Text style={styles.reviewCount}>({activity.reviewCount.toLocaleString()} reviews)</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{activity.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoValue}>${activity.priceFrom}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Placeholder content */}
          <Text style={styles.sectionTitle}>About this experience</Text>
          <Text style={styles.description}>
            This is a placeholder description for the activity. The full description will be populated when connected to the backend.
          </Text>

          <Text style={styles.sectionTitle}>What's included</Text>
          <View style={styles.includesList}>
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
              <Text style={styles.includeText}>Local guide</Text>
            </View>
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
              <Text style={styles.includeText}>Food tastings</Text>
            </View>
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
              <Text style={styles.includeText}>Small group size</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>${activity.priceFrom}</Text>
          <Text style={styles.priceSuffix}>/ person</Text>
        </View>
        <Pressable style={styles.bookButton}>
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  includeText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
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
