import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';
import type { Country } from '@/data/types';
import type { ActivityItem } from '@/data/home/useHomeMoodboard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VibeCardItem {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl: string | null;
  route: string;
}

interface VibeSectionProps {
  title: string;
  cities?: CityWithCountry[];
  countries?: Country[];
  activities?: ActivityItem[];
}

// ---------------------------------------------------------------------------
// Grid Card
// ---------------------------------------------------------------------------

function GridCard({
  item,
  height,
  style,
}: {
  item: VibeCardItem;
  height: number;
  style?: object;
}) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { height },
        style,
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push(item.route as any)}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={styles.cardGradient}
      />
      <View style={styles.cardOverlay}>
        <SolaText style={styles.cardName} numberOfLines={1}>
          {item.name}
        </SolaText>
        {item.subtitle ? (
          <SolaText style={styles.cardSubtitle} numberOfLines={1}>
            {item.subtitle}
          </SolaText>
        ) : null}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Activity Row
// ---------------------------------------------------------------------------

function ActivityRow({ activities }: { activities: ActivityItem[] }) {
  const router = useRouter();
  if (activities.length === 0) return null;

  return (
    <View style={styles.activitySection}>
      <SolaText style={styles.activityLabel}>THINGS TO DO</SolaText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activityScroll}
      >
        {activities.map((activity) => (
          <Pressable
            key={activity.id}
            style={({ pressed }) => [
              styles.activityCard,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(`/discover/activity/${activity.slug}` as any)}
          >
            {activity.imageUrl ? (
              <Image
                source={{ uri: activity.imageUrl }}
                style={styles.activityImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.activityImage, styles.activityImagePlaceholder]}>
                <Feather name="compass" size={16} color={colors.textMuted} />
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.activityGradient}
            />
            <View style={styles.activityOverlay}>
              <SolaText style={styles.activityName} numberOfLines={2}>
                {activity.name}
              </SolaText>
              <SolaText style={styles.activityCity} numberOfLines={1}>
                {activity.cityName}
              </SolaText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function VibeSection({ title, cities, countries, activities }: VibeSectionProps) {
  const isCities = (cities ?? []).length > 0;

  // Normalize to common shape
  const allItems: VibeCardItem[] = isCities
    ? (cities ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.countryName,
        imageUrl: c.heroImageUrl ?? null,
        route: `/discover/city/${c.slug}`,
      }))
    : (countries ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.heroImageUrl ?? null,
        route: `/discover/country/${c.slug}`,
      }));

  if (allItems.length === 0) return null;

  // Show max 5, rest behind "see all"
  const visible = allItems.slice(0, 5);
  const hasMore = allItems.length > 5;

  // Layout: 1 wide, then pairs
  const wideItem = visible[0];
  const pairs: VibeCardItem[][] = [];
  for (let i = 1; i < visible.length; i += 2) {
    pairs.push(visible.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <SolaText style={styles.title}>{title}</SolaText>

      <View style={styles.grid}>
        {/* Row 1: Full-width card */}
        <GridCard item={wideItem} height={190} />

        {/* Remaining rows: pairs */}
        {pairs.map((pair, pairIndex) => (
          <View key={pairIndex} style={styles.pairRow}>
            {pair.map((item) => (
              <GridCard
                key={item.id}
                item={item}
                height={140}
                style={styles.halfCard}
              />
            ))}
          </View>
        ))}
      </View>

      {hasMore && (
        <Pressable
          style={({ pressed }) => [styles.seeAll, pressed && { opacity: 0.7 }]}
          onPress={() => {}}
          hitSlop={8}
        >
          <SolaText style={styles.seeAllText}>See all</SolaText>
        </Pressable>
      )}

      {/* Activities under this vibe */}
      <ActivityRow activities={activities ?? []} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  grid: {
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
  },
  pairRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfCard: {
    flex: 1,
  },

  // Card
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.background,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // See all
  seeAll: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.screenX,
  },
  seeAllText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },

  // Activities
  activitySection: {
    marginTop: spacing.lg,
  },
  activityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.sm,
  },
  activityScroll: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  activityCard: {
    width: 140,
    height: 120,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  activityImage: {
    ...StyleSheet.absoluteFillObject,
  },
  activityImagePlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  activityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  activityName: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.background,
  },
  activityCity: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
});
