import { useEffect, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import NotificationButton from '@/components/NotificationButton';
import VibeSection from '@/components/home/VibeSection';
import { useData } from '@/hooks/useData';
import { getConversations } from '@/data/api';
import { useHomeMoodboard } from '@/data/home/useHomeMoodboard';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { Conversation } from '@/data/types';
import type { SavedPlaceItem } from '@/data/home/useHomeMoodboard';

// ---------------------------------------------------------------------------
// Search Bar (compact, inline)
// ---------------------------------------------------------------------------

function MiniSearchBar() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.searchBar,
        pressed && { opacity: pressedState.opacity },
      ]}
      onPress={() => router.push('/discover/search')}
    >
      <Text style={styles.searchText}>You can go anywhere</Text>
      <Feather name="search" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Community Banner
// ---------------------------------------------------------------------------

function CommunityBanner() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.communityBanner,
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push('/(tabs)/connect')}
    >
      <Image
        source={require('@/assets/images/pexels-paddleboarding.png')}
        style={styles.communityImage}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.communityGradient}
      />
      <View style={styles.communityOverlay}>
        <Text style={styles.communityLabel}>COMMUNITY</Text>
        <Text style={styles.communityTitle}>Real stories from women traveling solo</Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Shortlist
// ---------------------------------------------------------------------------

function ShortlistSection({ places }: { places: SavedPlaceItem[] }) {
  const router = useRouter();
  if (places.length === 0) return null;

  return (
    <View style={styles.shortlistContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Places you're drawn to</Text>
        <Pressable onPress={() => router.push('/home/saved')} hitSlop={8}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shortlistScroll}
      >
        {places.map((place) => (
          <Pressable
            key={place.placeId}
            style={({ pressed }) => [
              styles.shortlistCard,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(`/discover/place-detail/${place.placeId}` as any)}
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
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('home_moodboard_viewed');
  }, [posthog]);

  // Conversations for unread count (menu badge)
  const { data: conversations } = useData<Conversation[]>(
    () => getConversations(),
    ['conversations-home'],
  );

  const unreadCount = useMemo(() => {
    if (!conversations) return 0;
    return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  }, [conversations]);

  // Moodboard data
  const { sections, savedPlaces, loading, refetch } = useHomeMoodboard();

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
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationButton />
            <MenuButton unreadCount={unreadCount} />
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.orange} />
        }
      >
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <MiniSearchBar />
        </View>

        {/* Vibe sections */}
        {sections.map((section) => (
          <VibeSection
            key={section.config.id}
            title={section.config.title}
            cities={section.cities}
            countries={section.countries}
            activities={section.activities}
          />
        ))}

        {/* Community banner */}
        <View style={styles.communityWrap}>
          <CommunityBanner />
        </View>

        {/* Shortlist */}
        <ShortlistSection places={savedPlaces} />

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

  // Search bar
  searchWrap: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  searchText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  // Community banner
  communityWrap: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xxl,
  },
  communityBanner: {
    height: 160,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  communityImage: {
    ...StyleSheet.absoluteFillObject,
  },
  communityGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  communityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  communityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  communityTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.background,
  },

  // Shortlist
  shortlistContainer: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },
  shortlistScroll: {
    paddingHorizontal: spacing.screenX,
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

  bottomSpacer: {
    height: spacing.xxl,
  },
});
