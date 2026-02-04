// components/explore/cards/ActivityCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageUrl = activity.imageUrl ?? 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.imageContainer} pointerEvents="none">
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text style={styles.name} numberOfLines={2}>{activity.name}</Text>
    </AnimatedPressable>
  );
}

export { CARD_SIZE as ACTIVITY_CARD_SIZE, CARD_GAP as ACTIVITY_CARD_GAP };

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
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
