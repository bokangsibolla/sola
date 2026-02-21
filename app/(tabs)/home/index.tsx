import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import { HomeSearchInput } from '@/components/home/HomeSearchInput';
import { HeroModule } from '@/components/home/HeroModule';
import { SavedShortlist } from '@/components/home/SavedShortlist';
import { DestinationCarousel } from '@/components/home/DestinationCarousel';
import { CommunityPeek } from '@/components/home/CommunityPeek';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { useHomeData } from '@/data/home/useHomeData';
import { colors, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

export default function HomeScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  const {
    firstName,
    heroState,
    homeSections,
    loading,
    refetch,
  } = useHomeData();

  return (
    <AppScreen>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<AvatarButton />}
      />

      {loading && homeSections.length === 0 ? (
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
          {homeSections.map((section) => {
            switch (section.type) {
              case 'search':
                return (
                  <HomeSearchInput
                    key="search"
                    chips={section.chips}
                    firstName={firstName}
                    heroState={heroState}
                  />
                );
              case 'saved':
                return (
                  <SavedShortlist
                    key="saved"
                    places={section.places}
                    totalCount={section.totalCount}
                  />
                );
              case 'hero':
                return (
                  <HeroModule
                    key="hero"
                    hero={section.hero}
                    travelUpdate={section.travelUpdate}
                    height={section.height}
                  />
                );
              case 'destinations':
                return (
                  <DestinationCarousel
                    key="destinations"
                    cities={section.cities}
                    title={section.title}
                  />
                );
              case 'community':
                return (
                  <CommunityPeek
                    key="community"
                    threads={section.threads}
                    title={section.title}
                  />
                );
              default:
                return null;
            }
          })}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
