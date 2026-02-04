// app/(tabs)/explore/index.tsx
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { ExploreFeed } from '@/components/explore/ExploreFeed';
import { colors, spacing } from '@/constants/design';

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();

  const handleSearchPress = () => {
    posthog.capture('explore_search_opened');
    router.push('/(tabs)/explore/search');
  };

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
            onPress={handleSearchPress}
            hitSlop={12}
            style={styles.searchBtn}
          >
            <Feather name="search" size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ExploreFeed />
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
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
});
