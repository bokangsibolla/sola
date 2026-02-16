import { useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import NotificationButton from '@/components/NotificationButton';
import { IntentHeader } from '@/components/home/IntentHeader';
import { TripBlock } from '@/components/home/TripBlock';
import { PersonalizedCarousel } from '@/components/home/PersonalizedCarousel';
import { QuickUpdate } from '@/components/home/QuickUpdate';
import { CommunityHighlight } from '@/components/home/CommunityHighlight';
import { useData } from '@/hooks/useData';
import { getConversations } from '@/data/api';
import { useHomeData } from '@/data/home/useHomeData';
import { colors, spacing } from '@/constants/design';
import type { Conversation } from '@/data/types';

export default function HomeScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('home_viewed');
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

  // Home data
  const {
    tripBlock,
    personalizedCities,
    travelUpdate,
    communityHighlights,
    loading,
    refetch,
  } = useHomeData();

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
          <View style={styles.headerRight}>
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
        <IntentHeader />
        <TripBlock tripBlock={tripBlock} />
        <PersonalizedCarousel cities={personalizedCities} />
        <QuickUpdate update={travelUpdate} />
        <CommunityHighlight threads={communityHighlights} />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerLogo: {
    height: 22,
    width: 76,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
