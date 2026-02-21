import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { getPopularCities } from '@/data/api';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface TripEmptyStateProps {
  onPress: () => void;
}

const FEATURES = [
  {
    icon: 'calendar-outline' as const,
    title: 'Day-by-day itinerary',
    body: 'Build a visual timeline with timed stops, places, and notes',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Smart suggestions',
    body: 'Get alerts for gaps, overlaps, and missing meals',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Solo safety built in',
    body: 'Emergency numbers, local tips, and safe transport options',
  },
];

export default function TripEmptyState({ onPress }: TripEmptyStateProps) {
  const router = useRouter();
  const { data: popularCities } = useData(() => getPopularCities(4), ['popularCities']);

  return (
    <View style={styles.container}>
      {/* Hero image with overlay */}
      <View style={styles.heroWrapper}>
        <Image
          source={require('@/assets/images/solo-canyon-mist.jpg')}
          style={styles.heroImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroHeading}>Plan your next{'\n'}solo adventure</Text>
          <Text style={styles.heroSub}>
            Build a day-by-day itinerary, track your stops, and travel with confidence.
          </Text>
        </View>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon} size={18} color={colors.orange} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureBody}>{f.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
          onPress={onPress}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.ctaText}>Start planning a trip</Text>
        </Pressable>
      </View>

      {/* Destination pills */}
      {(popularCities ?? []).length > 0 && (
        <>
          <Text style={styles.orText}>Or explore destinations</Text>
          <View style={styles.destinationPills}>
            {(popularCities ?? []).slice(0, 4).map((city) => (
              <Pressable
                key={city.id}
                style={styles.destinationPill}
                onPress={() => router.push(`/(tabs)/discover/city/${city.slug}`)}
              >
                <Text style={styles.destinationPillText}>{city.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ── Hero ──
  heroWrapper: {
    height: 260,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  heroHeading: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  heroSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  // ── Features ──
  features: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  featureBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  // ── CTA ──
  ctaContainer: {
    paddingBottom: spacing.xxl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  orText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  destinationPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  destinationPill: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  destinationPillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
