// app/(tabs)/explore/index.tsx
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/design';
import { SearchBar, SegmentedControl } from '@/components/explore';
import { CountriesTab, PlacesTab, ActivitiesTab } from '@/components/explore/tabs';

type SegmentKey = 'countries' | 'places' | 'activities';

const SEGMENTS = [
  { key: 'countries' as const, label: 'Countries' },
  { key: 'places' as const, label: 'Places' },
  { key: 'activities' as const, label: 'Activities' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>('countries');

  const handleSearchPress = useCallback(() => {
    posthog.capture('explore_search_tapped', { segment: selectedSegment });
    router.push({
      pathname: '/(tabs)/explore/search',
      params: { segment: selectedSegment },
    } as any);
  }, [router, posthog, selectedSegment]);

  const handleSegmentChange = useCallback((key: string) => {
    posthog.capture('explore_segment_changed', { segment: key });
    setSelectedSegment(key as SegmentKey);
  }, [posthog]);

  const handleNavigateToSeeAll = useCallback((category: string, title: string) => {
    posthog.capture('explore_see_all_tapped', { category, title });
    router.push({
      pathname: '/(tabs)/explore/see-all',
      params: { category, title },
    } as any);
  }, [router, posthog]);

  const getSearchPlaceholder = () => {
    switch (selectedSegment) {
      case 'countries': return 'Search countries...';
      case 'places': return 'Search cities...';
      case 'activities': return 'Search activities...';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Search Bar */}
      <SearchBar
        placeholder={getSearchPlaceholder()}
        onPress={handleSearchPress}
      />

      {/* Segmented Control */}
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey={selectedSegment}
        onSelect={handleSegmentChange}
      />

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {selectedSegment === 'countries' && (
          <CountriesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
        {selectedSegment === 'places' && (
          <PlacesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
        {selectedSegment === 'activities' && (
          <ActivitiesTab onNavigateToSeeAll={handleNavigateToSeeAll} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContent: {
    flex: 1,
  },
});
