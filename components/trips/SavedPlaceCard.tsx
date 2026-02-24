import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface SavedPlaceCardProps {
  name: string;
  placeType: string;
  imageUrl: string | null;
  onRemove: () => void;
  onPress: () => void;
}

const IMAGE_HEIGHT = 100;

export const SavedPlaceCard: React.FC<SavedPlaceCardProps> = ({
  name,
  placeType,
  imageUrl,
  onRemove,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.container,
      pressed && styles.pressed,
    ]}
  >
    <View style={styles.imageWrapper}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="location-outline" size={24} color={colors.textMuted} />
        </View>
      )}
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={22} color="rgba(0,0,0,0.55)" />
      </Pressable>
    </View>

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.type} numberOfLines={1}>
        {placeType}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
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
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  info: {
    marginTop: spacing.sm,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  type: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
});
