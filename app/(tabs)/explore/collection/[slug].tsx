// app/(tabs)/explore/collection/[slug].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 300;

// Mock data - will be replaced with real API
const MOCK_COLLECTIONS: Record<string, {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  intro: string;
  destinations: { type: 'country' | 'city'; name: string; slug: string; imageUrl: string }[];
}> = {
  'first-solo-trips': {
    title: 'Best destinations for your first solo trip',
    subtitle: 'For first-timers who want ease and charm',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    intro: 'Starting your solo travel journey? These destinations offer the perfect blend of safety, friendliness, and unforgettable experiences.',
    destinations: [
      { type: 'country', name: 'Portugal', slug: 'portugal', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
      { type: 'city', name: 'Lisbon', slug: 'lisbon', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { type: 'country', name: 'Japan', slug: 'japan', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
    ],
  },
  'calm-beach-towns': {
    title: 'Calm beach towns for slow travel',
    subtitle: 'Where the pace is gentle and the views are endless',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    intro: 'Escape the rush and find your rhythm in these serene coastal destinations.',
    destinations: [
      { type: 'city', name: 'Cascais', slug: 'cascais', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
      { type: 'city', name: 'Hoi An', slug: 'hoi-an', imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400' },
    ],
  },
  'cultural-capitals': {
    title: 'Cultural capitals worth exploring',
    subtitle: 'Art, history, and unforgettable experiences',
    heroImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    intro: 'Immerse yourself in world-class museums, historic neighborhoods, and vibrant arts scenes.',
    destinations: [
      { type: 'city', name: 'Paris', slug: 'paris', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400' },
      { type: 'city', name: 'Tokyo', slug: 'tokyo', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    ],
  },
};

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const collection = MOCK_COLLECTIONS[slug ?? ''];

  if (!collection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Collection not found</Text>
      </View>
    );
  }

  const handleBack = () => router.back();

  const handleDestinationPress = (dest: { type: string; slug: string }) => {
    if (dest.type === 'country') {
      router.push(`/(tabs)/explore/country/${dest.slug}`);
    } else {
      router.push(`/(tabs)/explore/city/${dest.slug}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: collection.heroImageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />
        <Pressable
          style={[styles.backButton, { top: insets.top + spacing.md }]}
          onPress={handleBack}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{collection.title}</Text>
          <Text style={styles.heroSubtitle}>{collection.subtitle}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.intro}>{collection.intro}</Text>

        <View style={styles.destinations}>
          {collection.destinations.map((dest) => (
            <Pressable
              key={dest.slug}
              style={styles.destCard}
              onPress={() => handleDestinationPress(dest)}
            >
              <Image
                source={{ uri: dest.imageUrl }}
                style={styles.destImage}
                contentFit="cover"
              />
              <View style={styles.destInfo}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destType}>{dest.type}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  hero: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: spacing.screenX,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  content: {
    padding: spacing.screenX,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  destinations: {
    gap: spacing.md,
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  destImage: {
    width: 80,
    height: 80,
  },
  destInfo: {
    flex: 1,
    padding: spacing.lg,
  },
  destName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  destType: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: spacing.xs,
  },
});
