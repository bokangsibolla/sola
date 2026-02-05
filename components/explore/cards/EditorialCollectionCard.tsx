// components/explore/cards/EditorialCollectionCard.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { ExploreCollectionWithItems } from '@/data/types';

const CARD_HEIGHT = 300;

interface EditorialCollectionCardProps {
  collection: ExploreCollectionWithItems;
  onPress: () => void;
}

export function EditorialCollectionCard({ collection, onPress }: EditorialCollectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${collection.title}. ${collection.items.length} destinations`}
    >
      {collection.heroImageUrl && (
        <Image
          source={{ uri: collection.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
        pointerEvents="none"
      />
      <View style={styles.typeLabel} pointerEvents="none">
        <Text style={styles.typeLabelText}>Collection</Text>
      </View>
      <View style={styles.content} pointerEvents="none">
        {collection.badgeLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{collection.badgeLabel}</Text>
          </View>
        )}
        <Text style={styles.title}>{collection.title}</Text>
        {collection.subtitle && (
          <Text style={styles.subtitle}>{collection.subtitle}</Text>
        )}
        <Text style={styles.itemCount}>
          {collection.items.length} {collection.items.length === 1 ? 'destination' : 'destinations'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  typeLabel: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
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
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
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
  itemCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.sm,
  },
});
