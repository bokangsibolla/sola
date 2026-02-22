import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import { HeroModule } from '@/components/home/HeroModule';
import { ForYouRow } from '@/components/home/ForYouRow';
import { CommunityBannerCard } from '@/components/home/CommunityBannerCard';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { useHomeData } from '@/data/home/useHomeData';
import { colors, spacing } from '@/constants/design';

export default function HomeScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  const {
    heroState,
    savedPlaces,
    personalizedCities,
    loading,
    refetch,
  } = useHomeData();

  return (
    <AppScreen>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<HamburgerButton />}
      />

      {loading && !heroState ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.orange}
            />
          }
        >
          <View style={styles.heroSection}>
            <HeroModule hero={heroState} />
          </View>

          <ForYouRow
            heroState={heroState}
            savedPlaces={savedPlaces}
            personalizedCities={personalizedCities}
          />

          <CommunityBannerCard />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.md,
  },
  heroSection: {
    marginTop: spacing.lg,
  },
});
