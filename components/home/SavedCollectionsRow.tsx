import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface SavedCollectionsRowProps {
  totalSaved: number;
  collections: Array<{
    id: string;
    name: string;
    emoji: string;
  }>;
  /** Saved places for "All Saved" thumbnail grid */
  savedPlaceImages: string[];
  /** Optional: smart collection for trip destination */
  tripCityName?: string | null;
  tripCityPlaceCount?: number;
}

const SavedCollectionsRow: React.FC<SavedCollectionsRowProps> = ({
  totalSaved,
  collections,
  savedPlaceImages,
  tripCityName,
  tripCityPlaceCount,
}) => {
  const router = useRouter();

  const renderImageGrid = (images: string[]) => {
    const cells = Array.from({ length: 4 }, (_, i) => {
      const imageUrl = images[i];
      return (
        <View key={i} style={styles.gridCell}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.gridCellImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.emptyCell} />
          )}
        </View>
      );
    });

    return <View style={styles.imageGrid}>{cells}</View>;
  };

  const renderCollectionCard = (
    id: string,
    name: string,
    count: number,
    images: string[],
    onPress: () => void
  ) => {
    return (
      <Pressable
        key={id}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
      >
        {renderImageGrid(images)}
        <View style={styles.cardFooter}>
          <Text style={styles.cardName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.cardCount}>
            {count} {count === 1 ? 'place' : 'places'}
          </Text>
        </View>
      </Pressable>
    );
  };

  const handleSeeAll = () => {
    router.push('/home/saved' as any);
  };

  const handleAllSaved = () => {
    router.push('/home/saved' as any);
  };

  const handleCollectionPress = (collectionId: string) => {
    router.push(`/home/collections/${collectionId}` as any);
  };

  const handleNewCollection = () => {
    console.log('Create new collection tapped');
    // TODO: Wire up collection creation flow
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Pressable onPress={handleSeeAll} hitSlop={spacing.md}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {/* All Saved card */}
        {renderCollectionCard(
          'all-saved',
          'All Saved',
          totalSaved,
          savedPlaceImages,
          handleAllSaved
        )}

        {/* Smart "For [City]" card */}
        {tripCityName && tripCityPlaceCount !== undefined && (
          renderCollectionCard(
            'trip-city',
            `For ${tripCityName}`,
            tripCityPlaceCount,
            [], // Empty for now, will be populated with actual trip city places
            () => {
              // TODO: Navigate to trip city collection
              console.log('Trip city collection tapped');
            }
          )
        )}

        {/* User collections */}
        {collections.map((collection) =>
          renderCollectionCard(
            collection.id,
            `${collection.emoji} ${collection.name}`,
            0, // TODO: Fetch actual count per collection
            [], // TODO: Fetch actual images per collection
            () => handleCollectionPress(collection.id)
          )
        )}

        {/* + New card */}
        <Pressable
          onPress={handleNewCollection}
          style={({ pressed }) => [
            styles.card,
            styles.newCard,
            pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
          ]}
        >
          <View style={styles.newCardContent}>
            <Text style={styles.newCardPlus}>+</Text>
            <Text style={styles.newCardLabel}>New</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const CARD_WIDTH = 110;
const CARD_IMAGE_HEIGHT = 110;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.orange,
  },
  scroll: {
    marginLeft: spacing.screenX,
  },
  scrollContent: {
    paddingRight: spacing.screenX,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  imageGrid: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: CARD_WIDTH / 2,
    height: CARD_IMAGE_HEIGHT / 2,
  },
  gridCellImage: {
    width: '100%',
    height: '100%',
  },
  emptyCell: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutralFill,
  },
  cardFooter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cardName: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  newCard: {
    borderStyle: 'dashed',
    borderColor: colors.borderDefault,
    justifyContent: 'center',
    alignItems: 'center',
    height: CARD_IMAGE_HEIGHT + 50, // Match total height of other cards
  },
  newCardContent: {
    alignItems: 'center',
  },
  newCardPlus: {
    fontSize: 24,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  newCardLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});

export default SavedCollectionsRow;
