/**
 * IntentHero — The above-the-fold experience for the Explore screen.
 *
 * Replaces: SearchBar, ExploreModesCard, TripPromptCard.
 *
 * Adapts to four user states:
 * 1. Travelling — active trip: "Day N in {city}"
 * 2. Upcoming   — trip within 30 days: "{city} in N days"
 * 3. Returning  — has saved places: surfaces a daily destination + quick action
 * 4. Discovering — new user: "{count} countries"
 *
 * Every piece of text derives from data. Nothing is hardcoded.
 * Search is embedded as a contextual trigger, not a generic input.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIntentHero } from '@/data/explore/useIntentHero';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntentHero() {
  const router = useRouter();
  const {
    intent,
    travellingInfo,
    upcomingTrip,
    savedSummary,
    highlighted,
    contentStats,
    firstName,
    isLoading,
  } = useIntentHero();

  if (isLoading) {
    return <View style={styles.container} />;
  }

  // ── Compute display data ──────────────────────────────────────
  let headline = '';
  let subtitle = '';
  let searchPrompt = '';
  let quickAction: { label: string; onPress: () => void } | null = null;
  let modeLabel: string | null = null;

  switch (intent) {
    case 'travelling': {
      if (!travellingInfo) break;
      headline = `Day ${travellingInfo.dayNumber} in ${travellingInfo.cityName}`;
      subtitle = travellingInfo.daysLeft === 1
        ? '1 day left'
        : `${travellingInfo.daysLeft} days left`;
      if (travellingInfo.savedInCityCount > 0) {
        subtitle += ` \u00B7 ${travellingInfo.savedInCityCount} saved ${travellingInfo.savedInCityCount === 1 ? 'place' : 'places'}`;
      }
      searchPrompt = `Search ${travellingInfo.cityName}`;
      modeLabel = 'Travelling';
      break;
    }

    case 'upcoming': {
      if (!upcomingTrip) break;
      headline = upcomingTrip.destinationName;
      subtitle = upcomingTrip.daysUntil === 1
        ? 'tomorrow'
        : `in ${upcomingTrip.daysUntil} days`;
      searchPrompt = 'Search destinations';
      if (upcomingTrip.citySlug) {
        quickAction = {
          label: `${upcomingTrip.destinationName} guide`,
          onPress: () => router.push(`/(tabs)/explore/city/${upcomingTrip.citySlug}`),
        };
      }
      break;
    }

    case 'returning': {
      // For returning users: lead with a destination, not their save count.
      // The highlighted destination rotates daily — always fresh, always data-driven.
      if (highlighted) {
        headline = highlighted.name;
        subtitle = highlighted.tagline;
        quickAction = {
          label: `Explore ${highlighted.name}`,
          onPress: () => router.push(`/(tabs)/explore/country/${highlighted.slug}`),
        };
      } else if (savedSummary) {
        // Fallback if no highlighted destination available
        headline = `${contentStats.countryCount} countries`;
        subtitle = `${contentStats.cityCount} cities to explore`;
      }
      searchPrompt = 'Where to next?';
      break;
    }

    case 'discovering':
    default: {
      headline = `${contentStats.countryCount} countries`;
      subtitle = `${contentStats.cityCount} cities with solo travel guides`;
      searchPrompt = 'Where feels right?';
      break;
    }
  }

  // Personal greeting for returning/upcoming users
  const greeting = (intent === 'returning' || intent === 'upcoming') && firstName
    ? firstName
    : null;

  // Whether to show the destination image card (returning user with a highlighted destination)
  const showDestinationCard = intent === 'returning' && highlighted?.heroImageUrl;

  return (
    <View style={styles.container}>
      {/* Mode label for travelling */}
      {modeLabel && (
        <View style={styles.modeLabelRow}>
          <Feather name="navigation" size={12} color={colors.orange} />
          <Text style={styles.modeLabelText}>{modeLabel}</Text>
        </View>
      )}

      {/* Personal greeting */}
      {greeting && (
        <Text style={styles.greeting}>{greeting}</Text>
      )}

      {/* Headline — large, data-driven */}
      <Text style={styles.headline}>{headline}</Text>

      {/* Subtitle — supporting context */}
      {subtitle.length > 0 && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      {/* Destination card — for returning users, shows the highlighted destination */}
      {showDestinationCard && highlighted && (
        <Pressable
          onPress={() => router.push(`/(tabs)/explore/country/${highlighted.slug}`)}
          style={({ pressed }) => [styles.destinationCard, pressed && styles.destinationCardPressed]}
        >
          <Image
            source={{ uri: highlighted.heroImageUrl ?? undefined }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.destinationCardContent}>
            <Text style={styles.destinationCardLabel}>
              {savedSummary
                ? `${savedSummary.totalCount} places saved \u00B7 Discover more`
                : 'Explore this destination'}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Search trigger — contextual, embedded, premium */}
      <Pressable
        onPress={() => router.push('/(tabs)/explore/search')}
        style={({ pressed }) => [styles.searchTrigger, pressed && styles.searchTriggerPressed]}
        accessibilityRole="button"
        accessibilityLabel={searchPrompt}
      >
        <Feather name="search" size={16} color={colors.textMuted} />
        <Text style={styles.searchText}>{searchPrompt}</Text>
      </Pressable>

      {/* Quick action — only when data supports it (skip if destination card shown) */}
      {quickAction && !showDestinationCard && (
        <Pressable
          onPress={quickAction.onPress}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
          accessibilityRole="link"
        >
          <Text style={styles.quickActionText}>{quickAction.label}</Text>
          <Feather name="arrow-right" size={16} color={colors.orange} />
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  // Mode indicator (travelling)
  modeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modeLabelText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Personal greeting
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  // Headline — the main statement
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  // Subtitle — supporting data
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  // Destination card — visual entry point for returning users
  destinationCard: {
    height: 160,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: spacing.lg,
    backgroundColor: colors.neutralFill,
  },
  destinationCardPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  destinationCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  destinationCardLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  // Search trigger — premium, contextual
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  searchTriggerPressed: {
    backgroundColor: colors.neutralFill,
  },
  searchText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    flex: 1,
  },

  // Quick action — clear, data-driven
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  quickActionPressed: {
    opacity: pressedState.opacity,
  },
  quickActionText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
});
