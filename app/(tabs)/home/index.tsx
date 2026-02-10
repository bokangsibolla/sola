import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { useData } from '@/hooks/useData';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { getProfileById, getPopularCitiesWithCountry, getConversations } from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { colors, fonts, radius, spacing, typography, pressedState } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';
import type { Profile, Conversation } from '@/data/types';
import type { ThreadWithAuthor } from '@/data/community/types';
import type { ActiveTripInfo } from '@/state/AppModeContext';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function dayOfTrip(arrivingStr: string): number {
  const arriving = new Date(arrivingStr);
  arriving.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil((today.getTime() - arriving.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function tripDuration(arrivingStr: string, leavingStr: string): number {
  const a = new Date(arrivingStr);
  a.setHours(0, 0, 0, 0);
  const b = new Date(leavingStr);
  b.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UserAvatar({ profile, onPress }: { profile: Profile | null; onPress: () => void }) {
  const avatarUri = profile?.avatarUrl
    ? getImageUrl(profile.avatarUrl, { width: 64, height: 64 })
    : null;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => pressed ? { opacity: pressedState.opacity } : undefined}
    >
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri ?? undefined }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Feather name="user" size={16} color={colors.textMuted} />
        </View>
      )}
    </Pressable>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function ActiveTripCard({
  tripInfo,
  mode,
}: {
  tripInfo: ActiveTripInfo;
  mode: 'discover' | 'travelling';
}) {
  const router = useRouter();
  const isTravelling = mode === 'travelling';

  if (!isTravelling) {
    // Upcoming trip countdown
    const days = daysUntil(tripInfo.arriving);
    if (days > 30) return null;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, styles.upcomingTripCard, pressed && { opacity: pressedState.opacity }]}
        onPress={() => router.push(`/trips/${tripInfo.tripId}`)}
      >
        <Feather name="navigation" size={18} color={colors.orange} />
        <View style={styles.upcomingTripContent}>
          <Text style={styles.upcomingTripTitle}>
            {tripInfo.city.name} in {days} {days === 1 ? 'day' : 'days'}
          </Text>
          <Text style={styles.upcomingTripSubtitle}>
            Tap to review your trip details
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </Pressable>
    );
  }

  // Currently travelling — hero card
  const day = dayOfTrip(tripInfo.arriving);
  const total = tripDuration(tripInfo.arriving, tripInfo.leaving);

  return (
    <Pressable
      style={({ pressed }) => [styles.activeTripCard, pressed && { opacity: pressedState.opacity }]}
      onPress={() => router.push(`/trips/${tripInfo.tripId}`)}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={styles.activeTripGradient}
      />
      <View style={styles.activeTripOverlay}>
        <View style={styles.activeTripBadge}>
          <View style={styles.activeTripDot} />
          <Text style={styles.activeTripBadgeText}>TRAVELLING</Text>
        </View>
        <Text style={styles.activeTripCity}>{tripInfo.city.name}</Text>
        <Text style={styles.activeTripDay}>
          Day {day} of {total}  ·  {tripInfo.daysLeft} {tripInfo.daysLeft === 1 ? 'day' : 'days'} left
        </Text>
      </View>
    </Pressable>
  );
}

function UnreadMessagesCard({ count }: { count: number }) {
  const router = useRouter();
  if (count <= 0) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, styles.unreadCard, pressed && { opacity: pressedState.opacity }]}
      onPress={() => router.push('/connect/dm')}
    >
      <View style={styles.unreadIcon}>
        <Feather name="message-circle" size={18} color={colors.orange} />
      </View>
      <View style={styles.unreadContent}>
        <Text style={styles.unreadTitle}>
          {count} new {count === 1 ? 'message' : 'messages'}
        </Text>
        <Text style={styles.unreadSubtitle}>Tap to read your conversations</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function CommunityHighlightCard({ threads }: { threads: ThreadWithAuthor[] }) {
  const router = useRouter();
  if (threads.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionLabel label="FROM THE COMMUNITY" />
      {threads.map((thread, index) => (
        <Pressable
          key={thread.id}
          style={({ pressed }) => [
            styles.communityRow,
            index < threads.length - 1 && styles.communityRowBorder,
            pressed && { opacity: pressedState.opacity },
          ]}
          onPress={() => router.push(`/connect/thread/${thread.id}`)}
        >
          <View style={styles.communityRowContent}>
            <Text style={styles.communityTitle} numberOfLines={2}>
              {thread.title}
            </Text>
            <Text style={styles.communityMeta}>
              {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              {thread.cityName ? `  ·  ${thread.cityName}` : ''}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

function DestinationSuggestionCard({ cities }: { cities: CityWithCountry[] }) {
  const router = useRouter();
  if (cities.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionLabel label="DISCOVER" />
      <View style={styles.destinationGrid}>
        {cities.map((city) => (
          <Pressable
            key={city.id}
            style={({ pressed }) => [styles.destinationCard, pressed && { opacity: pressedState.opacity }]}
            onPress={() => router.push(`/discover/city/${city.slug}`)}
          >
            {city.heroImageUrl ? (
              <Image
                source={{ uri: city.heroImageUrl }}
                style={styles.destinationImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.destinationImage, styles.destinationImagePlaceholder]} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.destinationGradient}
            />
            <View style={styles.destinationOverlay}>
              <Text style={styles.destinationName}>{city.name}</Text>
              <Text style={styles.destinationCountry}>{city.countryName}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function EmptyState() {
  const router = useRouter();

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Welcome to Sola</Text>
      <Text style={styles.emptySubtitle}>
        Your personal travel dashboard. Start by exploring a destination or planning your first trip.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: pressedState.opacity }]}
        onPress={() => router.push('/trips/new')}
      >
        <Feather name="plus" size={18} color={colors.background} />
        <Text style={styles.primaryButtonText}>Plan your first trip</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: pressedState.opacity }]}
        onPress={() => router.push('/(tabs)/discover')}
      >
        <Text style={styles.secondaryButtonText}>Discover destinations</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const { mode, activeTripInfo } = useAppMode();

  useEffect(() => {
    posthog.capture('home_dashboard_viewed');
  }, [posthog]);

  // User profile for avatar
  const { data: profile } = useData<Profile | undefined>(
    () => (userId ? getProfileById(userId) : Promise.resolve(undefined)),
    ['profile', userId ?? ''],
  );

  // Conversations for unread count
  const { data: conversations } = useData<Conversation[]>(
    () => getConversations(),
    ['conversations-home'],
  );

  const unreadCount = useMemo(() => {
    if (!conversations) return 0;
    return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  }, [conversations]);

  // Community threads
  const { threads: communityThreads } = useCommunityFeed();
  const highlightThreads = useMemo(
    () => communityThreads.slice(0, 2),
    [communityThreads],
  );

  // Popular destinations
  const { data: popularCities } = useData<CityWithCountry[]>(
    () => getPopularCitiesWithCountry(2),
    ['popular-cities-home'],
  );

  // Determine if user has any personalized content
  const hasTrip = activeTripInfo !== null;
  const hasMessages = unreadCount > 0;
  const hasCommunity = highlightThreads.length > 0;
  const hasDestinations = (popularCities ?? []).length > 0;
  const isNewUser = !hasTrip && !hasMessages;

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = profile?.firstName ?? '';

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <UserAvatar
            profile={(profile as Profile) ?? null}
            onPress={() => router.push('/home/profile')}
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {greeting}{firstName ? `, ${firstName}` : ''}
          </Text>
        </View>

        {/* Active / Upcoming Trip */}
        {hasTrip && (
          <View style={styles.section}>
            <ActiveTripCard tripInfo={activeTripInfo!} mode={mode} />
          </View>
        )}

        {/* Unread Messages */}
        {hasMessages && (
          <View style={styles.section}>
            <UnreadMessagesCard count={unreadCount} />
          </View>
        )}

        {/* Community Highlights */}
        {hasCommunity && (
          <CommunityHighlightCard threads={highlightThreads} />
        )}

        {/* Destination Suggestions */}
        {hasDestinations && (
          <DestinationSuggestionCard cities={popularCities ?? []} />
        )}

        {/* Empty state for brand new users */}
        {isNewUser && !hasCommunity && !hasDestinations && <EmptyState />}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Header avatar
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Greeting
  greetingContainer: {
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 28,
    lineHeight: 36,
    color: colors.textPrimary,
  },

  // Generic section
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  // Cards (shared base)
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Active trip (travelling) — hero card
  activeTripCard: {
    height: 180,
    borderRadius: radius.card,
    backgroundColor: colors.orange,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  activeTripGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  activeTripOverlay: {
    padding: spacing.lg,
  },
  activeTripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  activeTripDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  activeTripBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.background,
    textTransform: 'uppercase',
  },
  activeTripCity: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.background,
  },
  activeTripDay: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },

  // Upcoming trip — subtle card
  upcomingTripCard: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orangeFill,
  },
  upcomingTripContent: {
    flex: 1,
  },
  upcomingTripTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  upcomingTripSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Unread messages
  unreadCard: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orangeFill,
  },
  unreadIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadContent: {
    flex: 1,
  },
  unreadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  unreadSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Community
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  communityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  communityRowContent: {
    flex: 1,
  },
  communityTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  communityMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Destinations
  destinationGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  destinationCard: {
    flex: 1,
    height: 160,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  destinationImage: {
    ...StyleSheet.absoluteFillObject,
  },
  destinationImagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  destinationGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  destinationName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.background,
  },
  destinationCountry: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    lineHeight: 36,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.md,
    minHeight: 44,
    width: '100%',
    maxWidth: 280,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.background,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    width: '100%',
    maxWidth: 280,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});
