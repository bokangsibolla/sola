import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface MoodboardCardProps {
  name: string;
  subtitle?: string;
  imageUrl: string | null;
  variant: 'hero' | 'supporting';
  onPress: () => void;
}

export default function MoodboardCard({
  name,
  subtitle,
  imageUrl,
  variant,
  onPress,
}: MoodboardCardProps) {
  const isHero = variant === 'hero';
  const cardStyle = isHero ? styles.heroCard : styles.supportingCard;

  return (
    <Pressable
      style={({ pressed }) => [
        cardStyle,
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={onPress}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <Text style={isHero ? styles.heroName : styles.supportingName} numberOfLines={2}>
          {name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    width: 200,
    height: 240,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  supportingCard: {
    width: 130,
    height: 170,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.background,
  },
  supportingName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.background,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
