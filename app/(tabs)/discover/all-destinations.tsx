// app/(tabs)/discover/all-destinations.tsx
// Browse destinations — 2-column continent grid
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useBrowseData } from '@/data/discover/useBrowseData';
import type { ContinentSummary } from '@/data/discover/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

// ── Continent card ──────────────────────────────────────────

function ContinentCard({
  continent,
  onPress,
}: {
  continent: ContinentSummary;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}
    >
      {continent.imageUrl ? (
        <Image
          source={{ uri: continent.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.neutralFill }]} />
      )}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.gridContent}>
        <SolaText style={styles.gridName}>{continent.label}</SolaText>
        <SolaText style={styles.gridMeta}>
          {continent.countryCount} {continent.countryCount === 1 ? 'country' : 'countries'} · {continent.cityCount} {continent.cityCount === 1 ? 'city' : 'cities'}
        </SolaText>
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function AllDestinationsScreen() {
  const router = useRouter();
  const { continents, isLoading, error, refresh } = useBrowseData();

  const navCrumbs = JSON.stringify([
    { label: 'Discover', path: '/(tabs)/discover' },
    { label: 'All Destinations', path: '/(tabs)/discover/all-destinations' },
  ]);

  if (isLoading && continents.length === 0) {
    return (
      <AppScreen>
        <NavigationHeader title="All Destinations" parentTitle="Discover" />
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error && continents.length === 0) {
    return (
      <AppScreen>
        <NavigationHeader title="All Destinations" parentTitle="Discover" />
        <ErrorScreen message="Could not load destinations" onRetry={refresh} />
      </AppScreen>
    );
  }

  // Pair continents into rows of 2
  const rows: ContinentSummary[][] = [];
  for (let i = 0; i < continents.length; i += 2) {
    rows.push(continents.slice(i, i + 2));
  }

  return (
    <AppScreen>
      <NavigationHeader title="All Destinations" parentTitle="Discover" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.gridRow}>
            {row.map((continent) => (
              <ContinentCard
                key={continent.key}
                continent={continent}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/discover/continent/[key]' as any,
                    params: { key: continent.key, _navCrumbs: navCrumbs },
                  })
                }
              />
            ))}
            {row.length === 1 && <View style={styles.gridSpacer} />}
          </View>
        ))}
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Grid — explicit row pairs
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridSpacer: {
    flex: 1,
  },
  gridItem: {
    flex: 1,
    height: 160,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  gridContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  gridName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  gridMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
});
