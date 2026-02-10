// components/explore/cards/ActivityCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { ActivityWithCity } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VISIBLE_CARDS = 3.3;
const CARD_GAP = spacing.md;
const CARD_SIZE = (SCREEN_WIDTH - spacing.screenX * 2 - CARD_GAP * 2) / VISIBLE_CARDS;

interface ActivityCardProps {
  activity: ActivityWithCity;
  onPress: () => void;
}

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.imageContainer} pointerEvents="none">
        {activity.imageUrl ? (
          <Image
            source={{ uri: activity.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2}>{activity.name}</Text>
    </Pressable>
  );
}

export { CARD_SIZE as ACTIVITY_CARD_SIZE, CARD_GAP as ACTIVITY_CARD_GAP };

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  imageContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
