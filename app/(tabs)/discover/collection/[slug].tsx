import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import { getExploreCollectionWithItems } from '@/data/api';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { ExploreCollectionItem } from '@/data/types';

// ── Screen ──────────────────────────────────────────────────

export default function CollectionPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data: collection, loading, error, refetch } = useData(
    () => getExploreCollectionWithItems(slug ?? ''),
    [slug],
  );

  useEffect(() => {
    if (collection?.id) {
      eventTracker.track('opened_collection', 'collection', collection.id);
    }
  }, [collection?.id]);

  const collectionTitle = collection?.title ?? 'Collection';

  if (loading) {
    return (
      <AppScreen>
        <NavigationHeader title="Loading…" parentTitle="Discover" />
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen>
        <NavigationHeader title="Collection" parentTitle="Discover" />
        <ErrorScreen message={error.message} onRetry={refetch} />
      </AppScreen>
    );
  }

  if (!collection) {
    return (
      <AppScreen>
        <NavigationHeader title="Collection" parentTitle="Discover" />
        <View style={styles.empty}>
          <SolaText style={styles.emptyText}>This collection is being updated.</SolaText>
        </View>
      </AppScreen>
    );
  }

  const navCrumbs = JSON.stringify([
    { label: 'Discover', path: '/(tabs)/discover' },
    { label: collection.title, path: `/(tabs)/discover/collection/${slug}` },
  ]);

  const handleItemPress = (item: ExploreCollectionItem) => {
    if (item.entityType === 'country') {
      router.push({
        pathname: '/(tabs)/discover/country/[slug]' as any,
        params: {
          slug: item.entitySlug,
          _navCrumbs: navCrumbs,
        },
      });
    } else if (item.entityType === 'city') {
      router.push({
        pathname: '/(tabs)/discover/city/[slug]' as any,
        params: {
          slug: item.entitySlug,
          _navCrumbs: navCrumbs,
        },
      });
    }
  };

  return (
    <AppScreen>
      <NavigationHeader title={collection.title} parentTitle="Discover" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          {collection.heroImageUrl && (
            <Image
              source={{ uri: collection.heroImageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          )}
          <View style={styles.heroOverlay}>
            {collection.badgeLabel && (
              <View style={styles.badge}>
                <SolaText style={styles.badgeText}>{collection.badgeLabel}</SolaText>
              </View>
            )}
            <SolaText style={styles.title}>{collection.title}</SolaText>
            {collection.subtitle && (
              <SolaText style={styles.subtitle}>{collection.subtitle}</SolaText>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Intro */}
          {collection.introMd && (
            <SolaText style={styles.intro}>{collection.introMd}</SolaText>
          )}

          {/* Sponsored disclosure */}
          {collection.isSponsored && collection.sponsorName && (
            <View style={styles.sponsorBanner}>
              <Ionicons name="megaphone-outline" size={14} color={colors.textMuted} />
              <SolaText style={styles.sponsorText}>
                Sponsored by {collection.sponsorName}
              </SolaText>
            </View>
          )}

          {/* Items */}
          <SolaText style={styles.sectionTitle}>
            {collection.items.length} destination{collection.items.length !== 1 ? 's' : ''}
          </SolaText>

          {collection.items.map((item) => (
            <Pressable
              key={`${item.entityType}-${item.entityId}`}
              style={({ pressed }) => [styles.itemCard, pressed && styles.pressed]}
              onPress={() => handleItemPress(item)}
              accessibilityRole="button"
              accessibilityLabel={item.entityName}
            >
              {item.entityImageUrl && (
                <Image
                  source={{ uri: item.entityImageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                  transition={200}
                />
              )}
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <SolaText style={styles.itemName}>{item.entityName}</SolaText>
                  {item.isFeatured && (
                    <View style={styles.itemBadge}>
                      <SolaText style={styles.itemBadgeText}>Featured</SolaText>
                    </View>
                  )}
                </View>
                <SolaText style={styles.itemType}>
                  {item.entityType === 'country' ? 'Country' : 'City'}
                </SolaText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxxxl,
  },

  // Hero
  hero: {
    height: 240,
    marginHorizontal: spacing.screenX,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },

  // Content
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutralFill,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  sponsorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // Item cards
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  itemBadge: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  itemBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  itemType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
