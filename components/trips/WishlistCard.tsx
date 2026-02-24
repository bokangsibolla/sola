import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getFlag } from '@/data/trips/helpers';
import type { WishlistItemWithData } from '@/data/wishlist/types';

interface WishlistCardProps {
  item: WishlistItemWithData;
  onPlanTrip: (item: WishlistItemWithData) => void;
  width: number;
}

const IMAGE_HEIGHT = 120;

export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  onPlanTrip,
  width,
}) => {
  const flag = item.countryIso2 ? getFlag(item.countryIso2) : '';

  const handleImagePress = () => {
    router.push(`/(tabs)/discover/place-detail/${item.entityId}`);
  };

  return (
    <View style={[styles.container, { width }]}>
      <Pressable
        onPress={handleImagePress}
        style={({ pressed }) => [
          styles.imageWrapper,
          pressed && styles.pressed,
        ]}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            {flag ? (
              <Text style={styles.placeholderFlag}>{flag}</Text>
            ) : null}
          </View>
        )}
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {flag ? `${flag} ` : ''}{item.name}
        </Text>

        <Pressable
          onPress={() => onPlanTrip(item)}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.planAction}>Plan a trip</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderFlag: {
    fontSize: 32,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  info: {
    marginTop: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  planAction: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
