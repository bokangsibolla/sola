import { FlatList, StyleSheet, ListRenderItem, Dimensions } from 'react-native';
import { spacing } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
// Calculate default card width to show ~1.3 cards (with peek)
const DEFAULT_ITEM_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2) * 0.82;
const DEFAULT_GAP = 12;

interface HorizontalCarouselProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemWidth?: number;
  gap?: number;
}

export default function HorizontalCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  itemWidth = DEFAULT_ITEM_WIDTH,
  gap = DEFAULT_GAP,
}: HorizontalCarouselProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, { gap }]}
      snapToInterval={itemWidth + gap}
      decelerationRate="fast"
      removeClippedSubviews
      initialNumToRender={3}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
}

// Export for use in tabs
export { DEFAULT_ITEM_WIDTH, DEFAULT_GAP };

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenX,
  },
});
