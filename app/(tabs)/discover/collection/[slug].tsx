import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import { getExploreCollectionWithItems } from '@/data/api';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { ExploreCollectionItem } from '@/data/types';

// ── Breadcrumb ──────────────────────────────────────────────

function Breadcrumb({
  collectionTitle,
  onDiscover,
}: {
  collectionTitle: string;
  onDiscover: () => void;
}) {
  return (
    <View style={styles.breadcrumb}>
      <Pressable onPress={onDiscover} hitSlop={8}>
        <Text style={styles.breadcrumbLink}>Discover</Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
        {collectionTitle}
      </Text>
    </View>
  );
}

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

  const headerLeft = (
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  );

  if (loading) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <ErrorScreen message={error.message} onRetry={refetch} />
      </AppScreen>
    );
  }

  if (!collection) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This collection is being updated.</Text>
        </View>
      </AppScreen>
    );
  }

  const handleItemPress = (item: ExploreCollectionItem) => {
    if (item.entityType === 'country') {
      router.push({
        pathname: '/(tabs)/discover/country/[slug]',
        params: {
          slug: item.entitySlug,
          fromCollection: collection.title,
          fromCollectionSlug: slug,
        },
      });
    } else if (item.entityType === 'city') {
      router.push(`/(tabs)/discover/city/${item.entitySlug}`);
    }
  };

  return (
    <AppScreen>
      <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Breadcrumb
          collectionTitle={collection.title}
          onDiscover={() => router.push('/(tabs)/discover')}
        />

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
                <Text style={styles.badgeText}>{collection.badgeLabel}</Text>
              </View>
            )}
            <Text style={styles.title}>{collection.title}</Text>
            {collection.subtitle && (
              <Text style={styles.subtitle}>{collection.subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Intro */}
          {collection.introMd && (
            <Text style={styles.intro}>{collection.introMd}</Text>
          )}

          {/* Sponsored disclosure */}
          {collection.isSponsored && collection.sponsorName && (
            <View style={styles.sponsorBanner}>
              <Ionicons name="megaphone-outline" size={14} color={colors.textMuted} />
              <Text style={styles.sponsorText}>
                Sponsored by {collection.sponsorName}
              </Text>
            </View>
          )}

          {/* Items */}
          <Text style={styles.sectionTitle}>
            {collection.items.length} destination{collection.items.length !== 1 ? 's' : ''}
          </Text>

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
                  <Text style={styles.itemName}>{item.entityName}</Text>
                  {item.isFeatured && (
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>Featured</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemType}>
                  {item.entityType === 'country' ? 'Country' : 'City'}
                </Text>
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
  headerLogo: {
    height: 22,
    width: 76,
  },
  scroll: {
    paddingBottom: spacing.xxxxl,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  breadcrumbLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  breadcrumbSep: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  breadcrumbCurrent: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flexShrink: 1,
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
