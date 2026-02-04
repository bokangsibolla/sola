// app/(tabs)/explore/index.tsx
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { colors, spacing } from '@/constants/design';
import { IconTabs } from '@/components/explore';
import { CountriesTab, PlacesTab, ActivitiesTab } from '@/components/explore/tabs';

type SegmentKey = 'countries' | 'places' | 'activities';

const TABS = [
  { key: 'countries' as const, label: 'Countries', icon: 'globe-outline' as const },
  { key: 'places' as const, label: 'Places', icon: 'compass-outline' as const },
  { key: 'activities' as const, label: 'Things to do', icon: 'ticket-outline' as const },
];

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [selectedTab, setSelectedTab] = useState<SegmentKey>('countries');

  const handleTabChange = useCallback((key: string) => {
    posthog.capture('explore_tab_changed', { tab: key });
    setSelectedTab(key as SegmentKey);
  }, [posthog]);

  const handleNavigateToSeeAll = useCallback((category: string, title: string) => {
    posthog.capture('explore_see_all_tapped', { category, title });
    router.push({
      pathname: '/(tabs)/explore/see-all',
      params: { category, title },
    } as any);
  }, [router, posthog]);

  return (
    <AppScreen style={styles.screen}>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        }
        rightComponent={
          <Pressable
            onPress={() => {
              posthog.capture('inbox_opened');
              router.push('/home/dm');
            }}
            hitSlop={12}
            style={styles.inboxBtn}
          >
            <Feather name="message-circle" size={20} color={colors.orange} />
          </Pressable>
        }
      />

      {/* Icon Tabs */}
      <IconTabs
        tabs={TABS}
        selectedKey={selectedTab}
        onSelect={handleTabChange}
      />

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {selectedTab === 'countries' && (
          <CountriesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
        {selectedTab === 'places' && (
          <PlacesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
        {selectedTab === 'activities' && (
          <ActivitiesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  logo: {
    height: 30,
    width: 90,
  },
  inboxBtn: {
    backgroundColor: colors.orangeFill,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flex: 1,
  },
});
