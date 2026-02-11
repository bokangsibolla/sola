import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { useData } from '@/hooks/useData';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import {
  getProfileById,
  getPopularCitiesWithCountry,
  getConversations,
  getSavedPlacesWithDetails,
} from '@/data/api';
import { getRecentCity } from '@/data/explore/recentBrowsing';
import { getCommunityLastVisit } from '@/data/community/lastVisit';
import { getNewCommunityActivity } from '@/data/community/communityApi';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';
import type { RecentCity } from '@/data/explore/recentBrowsing';
import type { Profile, Conversation } from '@/data/types';
import type { ThreadWithAuthor } from '@/data/community/types';
import type { ActiveTripInfo } from '@/state/AppModeContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SavedPlaceItem {
  placeId: string;
  placeName: string;
  imageUrl: string | null;
  cityName: string | null;
}

interface CommunityActivity {
  newReplyCount: number;
  threads: { id: string; title: string }[];
}

// ---------------------------------------------------------------------------
// Helpers
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
// Zone 2: Trip Status
// ---------------------------------------------------------------------------

function TripStatusZone({
  tripInfo,
  mode,
}: {
  tripInfo: ActiveTripInfo;
  mode: 'discover' | 'travelling';
}) {
  const router = useRouter();
  const isTravelling = mode === 'travelling';

  if (!isTravelling) {
    const days = daysUntil(tripInfo.arriving);
    if (days > 30) return null;

    return (
      <View style={styles.zone}>
        <Pressable
          style={({ pressed }) => [styles.alertRow, styles.alertRowOrange, pressed && { opacity: pressedState.opacity }]}
          onPress={() => router.push(`/trips/${tripInfo.tripId}`)}
        >
          <Feather name="navigation" size={16} color={colors.orange} />
          <Text style={styles.alertRowText}>
            <Text style={styles.alertRowBold}>{tripInfo.city.name}</Text> in {days} {days === 1 ? 'day' : 'days'}
          </Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  // Currently travelling — hero card
  const day = dayOfTrip(tripInfo.arriving);
  const total = tripDuration(tripInfo.arriving, tripInfo.leaving);

  return (
    <View style={styles.zone}>
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
    </View>
  );
}

// ---------------------------------------------------------------------------
// Zone 3: Alerts Strip
// ---------------------------------------------------------------------------

function AlertsZone({
  unreadCount,
  communityActivity,
}: {
  unreadCount: number;
  communityActivity: CommunityActivity | null;
}) {
  const router = useRouter();
  const hasMessages = unreadCount > 0;
  const hasReplies = communityActivity !== null && communityActivity.newReplyCount > 0;

  if (!hasMessages && !hasReplies) return null;

  return (
    <View style={styles.zone}>
      <View style={styles.alertsContainer}>
        {hasMessages && (
          <Pressable
            style={({ pressed }) => [styles.alertRow, pressed && { opacity: pressedState.opacity }]}
            onPress={() => router.push('/connect/dm')}
          >
            <Feather name="message-circle" size={16} color={colors.orange} />
            <Text style={styles.alertRowText}>
              <Text style={styles.alertRowBold}>{unreadCount}</Text> unread {unreadCount === 1 ? 'message' : 'messages'}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        )}
        {hasMessages && hasReplies && <View style={styles.alertDivider} />}
        {hasReplies && (
          <Pressable
            style={({ pressed }) => [styles.alertRow, pressed && { opacity: pressedState.opacity }]}
            onPress={() => router.push('/(tabs)/connect')}
          >
            <Feather name="message-square" size={16} color={colors.orange} />
            <Text style={styles.alertRowText}>
              <Text style={styles.alertRowBold}>{communityActivity!.newReplyCount}</Text> new {communityActivity!.newReplyCount === 1 ? 'reply' : 'replies'} on your threads
            </Text>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Zone 4: Quick Actions
// ---------------------------------------------------------------------------

interface QuickAction {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

function QuickActionsZone({
  mode,
  tripInfo,
}: {
  mode: 'discover' | 'travelling';
  tripInfo: ActiveTripInfo | null;
}) {
  const router = useRouter();

  const actions: QuickAction[] = useMemo(() => {
    if (mode === 'travelling' && tripInfo) {
      return [
        {
          icon: 'compass' as const,
          label: `Explore ${tripInfo.city.name}`,
          onPress: () => router.push(`/discover/city/${tripInfo.city.name.toLowerCase().replace(/\s+/g, '-')}`),
        },
        {
          icon: 'shield' as const,
          label: 'Safety info',
          onPress: () => router.push('/home/sos'),
        },
        {
          icon: 'book-open' as const,
          label: 'Trip journal',
          onPress: () => router.push(`/trips/${tripInfo.tripId}`),
        },
      ];
    }

    return [
      {
        icon: 'compass' as const,
        label: 'Explore',
        onPress: () => router.push('/(tabs)/discover'),
      },
      {
        icon: 'edit-3' as const,
        label: 'Ask community',
        onPress: () => router.push('/(tabs)/connect/new'),
      },
      {
        icon: 'map' as const,
        label: 'Plan a trip',
        onPress: () => router.push('/(tabs)/trips'),
      },
    ];
  }, [mode, tripInfo, router]);

  return (
    <View style={styles.zone}>
      <View style={styles.quickActionsRow}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [styles.quickActionCard, pressed && { opacity: pressedState.opacity, transform: pressedState.transform }]}
            onPress={action.onPress}
          >
            <View style={styles.quickActionIcon}>
              <Feather name={action.icon} size={20} color={colors.orange} />
            </View>
            <Text style={styles.quickActionLabel} numberOfLines={2}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Zone 5: Your Shortlist
// ---------------------------------------------------------------------------

function ShortlistZone({ places }: { places: SavedPlaceItem[] }) {
  const router = useRouter();
  const isEmpty = places.length === 0;

  return (
    <View style={styles.zone}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Shortlist</Text>
        {!isEmpty && (
          <Pressable onPress={() => router.push('/home/saved')} hitSlop={8}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>

      {isEmpty ? (
        <Pressable
          style={({ pressed }) => [styles.emptyShortlist, pressed && { opacity: pressedState.opacity }]}
          onPress={() => router.push('/(tabs)/discover')}
        >
          <Feather name="bookmark" size={20} color={colors.textMuted} />
          <View style={styles.emptyShortlistContent}>
            <Text style={styles.emptyShortlistText}>
              Save places as you explore
            </Text>
            <Text style={styles.emptyShortlistHint}>
              They'll appear here as your shortlist
            </Text>
          </View>
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortlistScroll}
        >
          {places.map((place) => (
            <Pressable
              key={place.placeId}
              style={({ pressed }) => [styles.shortlistCard, pressed && { opacity: pressedState.opacity, transform: pressedState.transform }]}
              onPress={() => router.push(`/discover/place-detail/${place.placeId}`)}
            >
              {place.imageUrl ? (
                <Image
                  source={{ uri: place.imageUrl }}
                  style={styles.shortlistImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.shortlistImage, styles.shortlistImagePlaceholder]}>
                  <Feather name="bookmark" size={18} color={colors.textMuted} />
                </View>
              )}
              <Text style={styles.shortlistName} numberOfLines={1}>
                {place.placeName}
              </Text>
              {place.cityName && (
                <Text style={styles.shortlistCity} numberOfLines={1}>
                  {place.cityName}
                </Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Zone 6: Continue
// ---------------------------------------------------------------------------

function ContinueZone({ recentCity }: { recentCity: RecentCity }) {
  const router = useRouter();

  return (
    <View style={styles.zone}>
      <Pressable
        style={({ pressed }) => [styles.continueCard, pressed && { opacity: pressedState.opacity }]}
        onPress={() => router.push(`/discover/city/${recentCity.citySlug}`)}
      >
        {recentCity.heroImageUrl ? (
          <Image
            source={{ uri: recentCity.heroImageUrl }}
            style={styles.continueImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.continueImage, styles.continueImagePlaceholder]}>
            <Feather name="compass" size={18} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.continueContent}>
          <Text style={styles.continueLabel}>CONTINUE EXPLORING</Text>
          <Text style={styles.continueName}>{recentCity.cityName}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Zone 7: Discover
// ---------------------------------------------------------------------------

function DiscoverZone({
  cities,
  hasPersonalContent,
}: {
  cities: CityWithCountry[];
  hasPersonalContent: boolean;
}) {
  const router = useRouter();
  if (cities.length === 0) return null;

  // Active users see fewer suggestions
  const displayCities = hasPersonalContent ? cities.slice(0, 2) : cities.slice(0, 4);
  const isSingleRow = displayCities.length <= 2;

  const rows: CityWithCountry[][] = [];
  for (let i = 0; i < displayCities.length; i += 2) {
    rows.push(displayCities.slice(i, i + 2));
  }

  return (
    <View style={styles.zone}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular with solo travelers</Text>
        <Pressable onPress={() => router.push('/(tabs)/discover')} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <View style={styles.destinationGridWrap}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.destinationGrid}>
            {row.map((city) => (
              <Pressable
                key={city.id}
                style={({ pressed }) => [
                  styles.destinationCard,
                  isSingleRow && styles.destinationCardTall,
                  pressed && { opacity: pressedState.opacity },
                ]}
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
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Zone 8: Community
// ---------------------------------------------------------------------------

function CommunityZone({ threads }: { threads: ThreadWithAuthor[] }) {
  const router = useRouter();
  if (threads.length === 0) return null;

  return (
    <View style={styles.zone}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>From the community</Text>
        <Pressable onPress={() => router.push('/(tabs)/connect')} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
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
          <Feather name="chevron-right" size={14} color={colors.textMuted} />
        </Pressable>
      ))}
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

  // User profile
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

  // Community threads (generic highlights)
  const { threads: communityThreads } = useCommunityFeed();
  const highlightThreads = useMemo(
    () => communityThreads.slice(0, 2),
    [communityThreads],
  );

  // Popular destinations
  const { data: popularCities } = useData<CityWithCountry[]>(
    () => getPopularCitiesWithCountry(4),
    ['popular-cities-home'],
  );

  // Saved places (increased limit for shortlist)
  const { data: savedPlaces } = useData<SavedPlaceItem[]>(
    () => (userId ? getSavedPlacesWithDetails(userId, 8) : Promise.resolve([])),
    ['saved-places-home', userId ?? ''],
  );

  // Recent city browsing
  const [recentCity, setRecentCity] = useState<RecentCity | null>(null);
  useEffect(() => {
    getRecentCity().then(setRecentCity);
  }, []);

  // Community activity since last visit
  const [communityActivity, setCommunityActivity] = useState<CommunityActivity | null>(null);
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const lastVisit = await getCommunityLastVisit();
      if (!lastVisit) return;
      const activity = await getNewCommunityActivity(userId, lastVisit);
      if (activity.newReplyCount > 0) {
        setCommunityActivity(activity);
      }
    })();
  }, [userId]);

  // Content flags
  const hasTrip = activeTripInfo !== null;
  const hasSavedPlaces = (savedPlaces ?? []).length > 0;
  const hasRecentCity = recentCity !== null;
  const hasCommunityActivity = communityActivity !== null && communityActivity.newReplyCount > 0;
  const hasPersonalContent = hasTrip || hasSavedPlaces || hasRecentCity;

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
        rightComponent={<MenuButton unreadCount={unreadCount} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Zone 2: Trip Status */}
        {hasTrip && (
          <TripStatusZone tripInfo={activeTripInfo!} mode={mode} />
        )}

        {/* Zone 3: Alerts */}
        <AlertsZone
          unreadCount={unreadCount}
          communityActivity={communityActivity}
        />

        {/* Zone 4: Quick Actions */}
        <QuickActionsZone mode={mode} tripInfo={activeTripInfo} />

        {/* Zone 5: Your Shortlist */}
        <ShortlistZone places={savedPlaces ?? []} />

        {/* Zone 6: Continue */}
        {hasRecentCity && (
          <ContinueZone recentCity={recentCity!} />
        )}

        {/* Zone 7: Discover */}
        <DiscoverZone
          cities={popularCities ?? []}
          hasPersonalContent={hasPersonalContent}
        />

        {/* Zone 8: Community (only if no personal activity) */}
        {!hasCommunityActivity && (
          <CommunityZone threads={highlightThreads} />
        )}

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

  // Header
  headerLogo: {
    height: 22,
    width: 76,
  },

  // Zones
  zone: {
    marginBottom: spacing.xl,
  },

  // Section headers (Shortlist, Discover, Community)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },

  // Active trip — hero card
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

  // Alerts strip
  alertsContainer: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  alertRowOrange: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.orangeFill,
  },
  alertRowText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  alertRowBold: {
    fontFamily: fonts.semiBold,
  },
  alertDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.lg,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Shortlist — empty state
  emptyShortlist: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyShortlistContent: {
    flex: 1,
  },
  emptyShortlistText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  emptyShortlistHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Shortlist — active state scroll
  shortlistScroll: {
    gap: spacing.md,
  },
  shortlistCard: {
    width: 140,
  },
  shortlistImage: {
    width: 140,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  shortlistImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortlistName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  shortlistCity: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Continue card
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.md,
    gap: spacing.md,
  },
  continueImage: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  continueImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueContent: {
    flex: 1,
  },
  continueLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  continueName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginTop: 2,
  },

  // Destinations
  destinationGridWrap: {
    gap: spacing.md,
  },
  destinationGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  destinationCard: {
    flex: 1,
    height: 120,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  destinationCardTall: {
    height: 140,
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

  bottomSpacer: {
    height: spacing.xxl,
  },
});
