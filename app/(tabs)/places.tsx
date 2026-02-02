import AppHeader from '@/components/AppHeader';
import AppScreen from '@/components/AppScreen';
import ImageCard from '@/components/ui/ImageCard';
import { spacing } from '@/constants/design';
import { ScrollView, StyleSheet, View } from 'react-native';

// TODO: replace with Supabase places query
const places = [
  { id: '1', name: 'Japan', subtitle: 'Ancient temples and modern culture', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  { id: '2', name: 'Iceland', subtitle: 'Northern lights and hot springs', imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800' },
  { id: '3', name: 'Portugal', subtitle: 'Historic charm by the sea', imageUrl: 'https://images.unsplash.com/photo-1555881403-274dd6c6938d?w=800' },
  { id: '4', name: 'New Zealand', subtitle: 'Adventure capital of the world', imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800' },
  { id: '5', name: 'Morocco', subtitle: 'Vibrant souks and riads', imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800' },
  { id: '6', name: 'Greece', subtitle: 'Stunning sunsets and white buildings', imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800' },
  { id: '7', name: 'Bali, Indonesia', subtitle: 'Tropical paradise and culture', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  { id: '8', name: 'Prague, Czech Republic', subtitle: 'Historic beauty and charm', imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800' },
];

export default function PlacesScreen() {
  return (
    <AppScreen>
      <AppHeader
        title="Places"
        subtitle="Browse places by location to find your perfect destination."
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {places.map((place) => (
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
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  cardWrapper: {
    width: '50%',
    padding: spacing.sm,
  },
});
