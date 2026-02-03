import { FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { spacing } from '@/constants/design';

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
  itemWidth = 280,
  gap = spacing.md,
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

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenX,
  },
});
