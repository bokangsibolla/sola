import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface TripEmptyStateProps {
  onPress: () => void;
}

const FEATURES = [
  {
    icon: 'book-outline' as const,
    title: 'Private journal',
    body: 'Log moments, moods, and tips only you can see',
  },
  {
    icon: 'map-outline' as const,
    title: 'Light planning',
    body: 'Save places, notes, and emergency numbers',
  },
  {
    icon: 'people-outline' as const,
    title: 'Meet travelers',
    body: 'Find women on your route — safely, on your terms',
  },
];

export default function TripEmptyState({ onPress }: TripEmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Hero image with overlay */}
      <View style={styles.heroWrapper}>
        <Image
          source={require('@/assets/images/pexels-sailing.png')}
          style={styles.heroImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.gradient}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroHeading}>Your next journey{'\n'}starts here</Text>
          <Text style={styles.heroSub}>Plan trips, journal along the way, and connect with solo travelers worldwide.</Text>
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
          <Text style={styles.ctaText}>Plan your first trip</Text>
        </Pressable>
      </View>
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
});
