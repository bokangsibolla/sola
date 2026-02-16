import React from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { PersonalizedCity } from '@/data/home/types';

interface PersonalizedCarouselProps {
  cities: PersonalizedCity[];
  isPersonalized?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 160;

function getReasonLine(city: PersonalizedCity): string | null {
  if (city.soloLevel === 'beginner') return 'Great for first-timers';
  if (city.bestFor) return city.bestFor;
  return null;
}

export function PersonalizedCarousel({ cities, isPersonalized = false }: PersonalizedCarouselProps) {
  const router = useRouter();

  if (cities.length === 0) return null;

  const title = isPersonalized ? 'Recommended for you' : 'Popular with solo women';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.cityId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const reasonLine = getReasonLine(item);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
              ]}
              onPress={() => router.push(`/discover/city/${item.slug}` as any)}
            >
              {item.heroImageUrl ? (
                <Image
                  source={{ uri: item.heroImageUrl }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.image, styles.placeholder]} />
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.65)']}
                style={styles.gradient}
              />
              <View style={styles.overlay}>
                <Text style={styles.cityName} numberOfLines={1}>
                  {item.cityName}
                </Text>
                <Text style={styles.countryName} numberOfLines={1}>
                  {item.countryName}
                </Text>
                {reasonLine && (
                  <Text style={styles.reasonLine} numberOfLines={1}>
                    {reasonLine}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutralFill,
  },
  placeholder: {
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
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.background,
  },
  countryName: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  reasonLine: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
});
