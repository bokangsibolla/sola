import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { CityArea } from '@/data/types';

interface AreaCardProps {
  area: CityArea;
}

function AreaCardItem({ area }: AreaCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/discover/area/${area.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {area.heroImageUrl ? (
        <Image
          source={{ uri: area.heroImageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <Text style={styles.areaName}>{area.name}</Text>
        {area.positioningLine && (
          <Text style={styles.positioningLine} numberOfLines={1}>{area.positioningLine}</Text>
        )}
      </View>
    </Pressable>
  );
}

interface AreaCardsRowProps {
  areas: CityArea[];
}

export function AreaCardsRow({ areas }: AreaCardsRowProps) {
  if (areas.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Neighborhoods</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {areas.map((area) => (
          <AreaCardItem key={area.id} area={area} />
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 200;
const CARD_HEIGHT = 140;

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingRight: spacing.screenX,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as any,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  areaName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  positioningLine: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
