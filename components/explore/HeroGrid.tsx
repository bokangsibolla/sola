// components/explore/HeroGrid.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';
import type { ExploreCollectionWithItems } from '@/data/types';

function TypeLabel({ label }: { label: string }) {
  return (
    <View style={styles.typeLabel}>
      <Text style={styles.typeLabelText}>{label}</Text>
    </View>
  );
}

interface HeroGridProps {
  collection: ExploreCollectionWithItems | null;
  city1: CityWithCountry;
  city2: CityWithCountry | null;
  onCollectionPress: () => void;
  onCity1Press: () => void;
  onCity2Press: () => void;
}

export function HeroGrid({
  collection,
  city1,
  city2,
  onCollectionPress,
  onCity1Press,
  onCity2Press,
}: HeroGridProps) {
  return (
    <View style={styles.container}>
      {/* Top card: Featured collection (hero) */}
      {collection ? (
        <Pressable
          style={({ pressed }) => [styles.topCard, pressed && styles.pressed]}
          onPress={onCollectionPress}
          accessibilityRole="button"
          accessibilityLabel={`${collection.title}. ${collection.items.length} destinations`}
        >
          {collection.heroImageUrl && (
            <Image
              source={{ uri: collection.heroImageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              pointerEvents="none"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TypeLabel label="Collection" />
          <View style={styles.topCardContent} pointerEvents="none">
            {collection.badgeLabel && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{collection.badgeLabel}</Text>
              </View>
            )}
            <Text style={styles.topCardTitle}>{collection.title}</Text>
            <Text style={styles.topCardSubtitle}>
              {collection.items.length} {collection.items.length === 1 ? 'destination' : 'destinations'}
            </Text>
          </View>
        </Pressable>
      ) : (
        // Fallback: show city1 as the big card if no collection
        <Pressable
          style={({ pressed }) => [styles.topCard, pressed && styles.pressed]}
          onPress={onCity1Press}
          accessibilityRole="button"
          accessibilityLabel={`${city1.name}, ${city1.countryName}`}
        >
          {city1.heroImageUrl && (
            <Image
              source={{ uri: city1.heroImageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              pointerEvents="none"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TypeLabel label="City" />
          <View style={styles.topCardContent} pointerEvents="none">
            <Text style={styles.topCardTitle}>{city1.name}</Text>
            <Text style={styles.topCardSubtitle}>{city1.countryName}</Text>
          </View>
        </Pressable>
      )}

      {/* Bottom row: 2 city cards */}
      <View style={styles.bottomRow}>
        {/* Bottom-left: City 1 */}
        <Pressable
          style={({ pressed }) => [styles.bottomCard, pressed && styles.pressed]}
          onPress={onCity1Press}
          accessibilityRole="button"
          accessibilityLabel={`${city1.name}, ${city1.countryName}`}
        >
          {city1.heroImageUrl && (
            <Image
              source={{ uri: city1.heroImageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              pointerEvents="none"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TypeLabel label="City" />
          <View style={styles.bottomCardContent} pointerEvents="none">
            <Text style={styles.bottomCardTitle} numberOfLines={1}>
              {city1.name}
            </Text>
            <Text style={styles.bottomCardSubtitle} numberOfLines={1}>
              {city1.countryName}
            </Text>
          </View>
        </Pressable>

        {/* Bottom-right: City 2 */}
        {city2 ? (
          <Pressable
            style={({ pressed }) => [styles.bottomCard, pressed && styles.pressed]}
            onPress={onCity2Press}
            accessibilityRole="button"
            accessibilityLabel={`${city2.name}, ${city2.countryName}`}
          >
            {city2.heroImageUrl && (
              <Image
                source={{ uri: city2.heroImageUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
                pointerEvents="none"
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <TypeLabel label="City" />
            <View style={styles.bottomCardContent} pointerEvents="none">
              <Text style={styles.bottomCardTitle} numberOfLines={1}>
                {city2.name}
              </Text>
              <Text style={styles.bottomCardSubtitle} numberOfLines={1}>
                {city2.countryName}
              </Text>
            </View>
          </Pressable>
        ) : (
          <View style={[styles.bottomCard, { backgroundColor: colors.neutralFill }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  // Type label pill
  typeLabel: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeLabelText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Top card: featured collection
  topCard: {
    height: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
    justifyContent: 'flex-end',
  },
  topCardContent: {
    padding: spacing.lg,
  },
  topCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  topCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
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
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bottomCard: {
    flex: 1,
    height: 140,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
    justifyContent: 'flex-end',
  },
  bottomCardContent: {
    padding: spacing.md,
  },
  bottomCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  bottomCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
