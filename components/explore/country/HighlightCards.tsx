import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { DestinationHighlight } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface HighlightCardsProps {
  highlights: DestinationHighlight[];
  imageMap?: Record<string, string | null>;
}

const CARD_HEIGHT = 80;

export function HighlightCards({ highlights, imageMap }: HighlightCardsProps) {
  const router = useRouter();
  if (!highlights || highlights.length === 0) return null;

  const handlePress = (h: DestinationHighlight) => {
    if (h.type === 'city') {
      router.push(`/(tabs)/discover/city/${h.id}` as any);
    } else {
      router.push(`/(tabs)/discover/place-detail/${h.id}` as any);
    }
  };

  const getImageUrl = (h: DestinationHighlight): string | null => {
    if (h.imageUrl) return h.imageUrl;
    if (imageMap && imageMap[h.id]) return imageMap[h.id] ?? null;
    return null;
  };

  return (
    <View style={styles.row}>
      {highlights.slice(0, 3).map((h) => {
        const imgUrl = getImageUrl(h);
        return (
          <Pressable
            key={h.id}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => handlePress(h)}
          >
            {imgUrl && (
              <Image source={{ uri: imgUrl }} style={styles.image} resizeMode="cover" />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.gradient}
            />
            <View style={styles.textWrap}>
              <Text style={styles.label} numberOfLines={1}>{h.label}</Text>
              <Text style={styles.tagline} numberOfLines={1}>{h.tagline}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.md,
  },
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
});
