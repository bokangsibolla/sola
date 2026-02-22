import React from 'react';
import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useTripMatches, TripMatchWithProfile } from '@/data/trips/useTripMatches';
import { formatDateShort } from '@/data/trips/helpers';
import TravelerCard from '@/components/TravelerCard';

interface PeopleTabProps {
  tripId: string;
  matchingOptIn: boolean;
  onToggleMatching: () => void;
}

function MatchContext({ match }: { match: TripMatchWithProfile }) {
  if (match.overlapCity) {
    const dateRange = match.overlapStart && match.overlapEnd
      ? `, ${formatDateShort(match.overlapStart)}–${formatDateShort(match.overlapEnd)}`
      : '';
    return (
      <SolaText style={styles.contextText}>
        You'll both be in {match.overlapCity}{dateRange}
      </SolaText>
    );
  }
  if ((match.theirStyleTags ?? []).length > 0) {
    return (
      <SolaText style={styles.contextText}>
        Similar style: {match.theirStyleTags.slice(0, 3).join(', ')}
      </SolaText>
    );
  }
  return null;
}

export default function PeopleTab({ tripId, matchingOptIn, onToggleMatching }: PeopleTabProps) {
  const router = useRouter();
  const { matches, loading } = useTripMatches(tripId, matchingOptIn);

  // State 1: Matching OFF
  if (!matchingOptIn) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed-outline" size={28} color={colors.textMuted} />
        </View>
        <SolaText variant="label" style={styles.stateTitle}>Traveler matching is off</SolaText>
        <SolaText variant="caption" style={styles.stateBody}>
          When you turn on matching, Sola will recommend travelers who overlap your route.
        </SolaText>
        <SolaText style={styles.consentText}>
          Only your name, photo, and travel style are shared — never your journal or exact location.
        </SolaText>
        <Pressable
          style={({ pressed }) => [styles.enableButton, pressed && styles.pressed]}
          onPress={onToggleMatching}
        >
          <SolaText variant="button" color="#FFFFFF">Turn on matching</SolaText>
        </Pressable>
      </View>
    );
  }

  // Loading
  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  // State 2: Matching ON, no matches
  if (matches.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="people-outline" size={28} color={colors.textMuted} />
        </View>
        <SolaText variant="label" style={styles.stateTitle}>No travelers on your route yet</SolaText>
        <SolaText variant="caption" style={styles.stateBody}>
          We'll let you know when someone with overlapping dates and cities appears.
        </SolaText>
      </View>
    );
  }

  // State 3: Matching ON, has matches
  return (
    <View style={styles.container}>
      <SolaText variant="label" style={styles.sectionTitle}>Travelers on your route</SolaText>
      {matches.map((match) => (
        <View key={match.theirUserId} style={styles.matchCard}>
          <TravelerCard
            profile={match.profile}
            connectionStatus="none"
            contextLabel={
              match.overlapCity
                ? `Both in ${match.overlapCity}`
                : (match.theirStyleTags ?? []).length > 0
                ? `Similar: ${match.theirStyleTags[0]}`
                : undefined
            }
            onPress={() => router.push(`/connect/user/${match.theirUserId}`)}
            onConnect={() => router.push(`/connect/user/${match.theirUserId}`)}
          />
          <MatchContext match={match} />
        </View>
      ))}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <SolaText style={styles.footerText}>Only showing travelers who also opted in</SolaText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stateTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stateBody: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  consentText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  enableButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  matchCard: {
    marginBottom: spacing.lg,
  },
  contextText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
