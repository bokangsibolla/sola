import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import { getExploreCollectionWithItems } from '@/data/api';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { ExploreCollectionItem } from '@/data/types';

export default function CollectionPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data: collection, loading, error, refetch } = useData(
    () => getExploreCollectionWithItems(slug ?? ''),
    [slug]
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!collection) {
    return (
      <AppScreen>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This collection is being updated.</Text>
        </View>
      </AppScreen>
    );
  }

  const handleItemPress = (item: ExploreCollectionItem) => {
    if (item.entityType === 'country') {
      router.push(`/(tabs)/explore/country/${item.entitySlug}`);
    } else if (item.entityType === 'city') {
      router.push(`/(tabs)/explore/city/${item.entitySlug}`);
    }
    // Neighborhood routes don't exist yet - ignore press for now.
    // This case is unlikely since collections filter by entity_types,
    // but TypeScript requires handling all union members.
  };

  return (
    <AppScreen style={styles.screen}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
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
              style={styles.itemCard}
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

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  scrollView: {
    marginHorizontal: -spacing.lg,
  },
  hero: {
    height: 280,
    backgroundColor: colors.borderSubtle,
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
    padding: spacing.xl,
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
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  content: {
    padding: spacing.lg,
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
    backgroundColor: colors.borderSubtle,
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
    backgroundColor: colors.borderSubtle,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
