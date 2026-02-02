import AppHeader from '@/components/AppHeader';
import AppScreen from '@/components/AppScreen';
import ImageCard from '@/components/ui/ImageCard';
import { colors, spacing, typography } from '@/constants/design';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// TODO: replace with Supabase saved places query
const savedPlaces = [
  { id: '1', name: 'Kyoto, Japan', subtitle: 'Ancient temples and modern culture', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  { id: '2', name: 'Santorini, Greece', subtitle: 'Stunning sunsets and white buildings', imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800' },
  { id: '3', name: 'Lisbon, Portugal', subtitle: 'Historic charm by the sea', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=800' },
];

export default function SavedScreen() {
  return (
    <AppScreen>
      <AppHeader
        title="Saved"
        subtitle="View your saved places and plan your travel itinerary."
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {savedPlaces.length > 0 ? (
          <View style={styles.list}>
            {savedPlaces.map((place) => (
              <View key={place.id} style={styles.cardWrapper}>
                <ImageCard
                  title={place.name}
                  subtitle={place.subtitle}
                  imageUrl={place.imageUrl}
                  onPress={() => {}}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved places yet</Text>
            <Text style={styles.emptySubtext}>Start exploring and save places you love</Text>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
