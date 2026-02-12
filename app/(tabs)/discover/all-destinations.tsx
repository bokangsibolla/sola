// app/(tabs)/discover/all-destinations.tsx
// Continent picker — 3 full-width image cards linking to continent detail
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

// ── Continent data ──────────────────────────────────────────

interface Continent {
  key: string;
  label: string;
  tagline: string;
  imageUrl: string;
}

const CONTINENTS: Continent[] = [
  {
    key: 'asia',
    label: 'Asia',
    tagline: 'Temples, islands, street food',
    imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
  },
  {
    key: 'europe',
    label: 'Europe',
    tagline: 'History, coasts, café culture',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
  },
  {
    key: 'africa',
    label: 'Africa',
    tagline: 'Wildlife, mountains, warm hospitality',
    imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
  },
];

// ── Breadcrumb ──────────────────────────────────────────────

function Breadcrumb({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.breadcrumb}>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={styles.breadcrumbLink}>Discover</Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbCurrent}>Continents</Text>
    </View>
  );
}

// ── Continent card ──────────────────────────────────────────

function ContinentCard({
  continent,
  onPress,
}: {
  continent: Continent;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: continent.imageUrl }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.65)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{continent.label}</Text>
        <Text style={styles.cardTagline}>{continent.tagline}</Text>
      </View>
    </Pressable>
  );
}

// ── Screen ──────────────────────────────────────────────────

export default function AllDestinationsScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={<MenuButton />}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Breadcrumb onBack={() => router.back()} />
        <View style={styles.cardList}>
          {CONTINENTS.map((c) => (
            <ContinentCard
              key={c.key}
              continent={c}
              onPress={() =>
                router.push(`/(tabs)/discover/continent/${c.key}` as any)
              }
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  scroll: {
    paddingBottom: spacing.xxxxl,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  breadcrumbLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  breadcrumbSep: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  breadcrumbCurrent: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Page
  pageTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },

  // Cards
  cardList: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.lg,
  },
  card: {
    width: '100%',
    height: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  cardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  cardTagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
});
