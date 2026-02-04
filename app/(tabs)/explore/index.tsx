// app/(tabs)/explore/index.tsx
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { colors, fonts, spacing, radius } from '@/constants/design';

// Placeholder card component
function PlaceholderCard({ title, height = 180 }: { title: string; height?: number }) {
  return (
    <Pressable
      style={[styles.card, { height }]}
      onPress={() => console.log(`Tapped: ${title}`)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>Placeholder</Text>
      </View>
    </Pressable>
  );
}

// Small card for the 2-up row
function SmallCard({ title }: { title: string }) {
  return (
    <Pressable style={styles.smallCard} onPress={() => console.log(`Tapped: ${title}`)}>
      <View style={styles.smallCardContent}>
        <Text style={styles.smallCardTitle}>{title}</Text>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader title="Explore" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Collection 1 */}
        <PlaceholderCard title="Editorial Collection 1" height={200} />

        {/* Country Pair - 2 cards side by side */}
        <View style={styles.pairRow}>
          <SmallCard title="Country 1" />
          <SmallCard title="Country 2" />
        </View>

        {/* City Spotlight */}
        <PlaceholderCard title="City Spotlight" height={220} />

        {/* Editorial Collection 2 */}
        <PlaceholderCard title="Editorial Collection 2" height={200} />

        {/* Another Country Pair */}
        <View style={styles.pairRow}>
          <SmallCard title="Country 3" />
          <SmallCard title="Country 4" />
        </View>

        {/* Activity Cluster */}
        <PlaceholderCard title="Activities" height={160} />

        {/* End Card */}
        <View style={styles.endCard}>
          <Text style={styles.endCardText}>You've seen it all!</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.card,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  pairRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  smallCard: {
    flex: 1,
    height: 140,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  smallCardContent: {
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  smallCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  endCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  endCardText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
