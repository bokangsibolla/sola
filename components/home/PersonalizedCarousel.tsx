import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { PersonalizedCity } from '@/data/home/types';

interface PersonalizedCarouselProps {
  cities: PersonalizedCity[];
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 180;

export function PersonalizedCarousel({ cities }: PersonalizedCarouselProps) {
  const router = useRouter();

  if (cities.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended for you</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.cityId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
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
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.gradient}
            />
            <View style={styles.overlay}>
              <Text style={styles.cityName} numberOfLines={1}>
                {item.cityName}
              </Text>
              <Text style={styles.countryName} numberOfLines={1}>
                {item.countryName}
              </Text>
              {(item.planningCount > 0 || item.activityCount > 0) && (
                <View style={styles.countRow}>
                  {item.planningCount > 0 && (
                    <Text style={styles.countText}>
                      {item.planningCount} planning
                    </Text>
                  )}
                  {item.planningCount > 0 && item.activityCount > 0 && (
                    <Text style={styles.countDot}>&middot;</Text>
                  )}
                  {item.activityCount > 0 && (
                    <Text style={styles.countText}>
                      {item.activityCount} posts
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Pressable>
        )}
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
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
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
    padding: spacing.lg,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.background,
  },
  countryName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  countText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  countDot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.5)',
  },
});
