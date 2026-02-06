import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getDiscoveryLensWithResults } from '@/data/lenses';
import type { DiscoveryLensWithResults, ExploreCollectionItem } from '@/data/types';

export default function LensResultsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  const [lens, setLens] = useState<DiscoveryLensWithResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getDiscoveryLensWithResults(slug ?? '');
        setLens(result);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleItemPress = useCallback((item: ExploreCollectionItem) => {
    posthog.capture('lens_result_tapped', {
      lens_slug: slug,
      entity_type: item.entityType,
      entity_name: item.entityName,
      entity_slug: item.entitySlug,
    });
    if (item.entityType === 'country') {
      router.push(`/explore/country/${item.entitySlug}`);
    } else if (item.entityType === 'city') {
      router.push(`/explore/city/${item.entitySlug}`);
    }
  }, [router, posthog, slug]);

  const renderItem = useCallback(({ item }: { item: ExploreCollectionItem }) => (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && styles.resultCardPressed]}
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ uri: item.entityImageUrl ?? undefined }}
        style={styles.resultImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.resultContent}>
        <Text style={styles.resultName}>{item.entityName}</Text>
        <Text style={styles.resultType}>
          {item.entityType === 'country' ? 'Country' : 'City'}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  ), [handleItemPress]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!lens) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>This lens is being updated.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={lens.results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.entityType}-${item.entityId}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.introSection}>
            <Text style={styles.lensTitle}>{lens.title}</Text>
            {lens.helperText && (
              <Text style={styles.lensHelper}>{lens.helperText}</Text>
            )}
            {lens.introMd && (
              <Text style={styles.introText}>{lens.introMd}</Text>
            )}
            {lens.isSponsored && lens.sponsorName && (
              <View style={styles.sponsorBanner}>
                <Feather name="info" size={12} color={colors.textMuted} />
                <Text style={styles.sponsorText}>
                  Sponsored by {lens.sponsorName}
                </Text>
              </View>
            )}
            <Text style={styles.resultsCount}>
              {lens.results.length} destination{lens.results.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No destinations match this lens yet. Check back soon.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxl,
  },
  introSection: {
    paddingBottom: spacing.xl,
  },
  lensTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  lensHelper: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  introText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  sponsorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  resultsCount: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  resultCardPressed: {
    opacity: 0.7,
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resultType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
