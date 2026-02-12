import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';


interface SavedItem {
  entityId: string;
  entityType: string;
  name: string;
  imageUrl: string | null;
  category: string;
}

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  placeType: string;
  imageUrl: string | null;
  cityName: string | null;
}

interface WhileInSectionProps {
  cityName: string;
  tripId: string;
  savedItems: SavedItem[];
  suggestions: Suggestion[];
  onSavePlace?: (placeId: string) => void;
}

const WhileInSection: React.FC<WhileInSectionProps> = ({
  cityName,
  tripId,
  savedItems,
  suggestions,
  onSavePlace,
}) => {
  const router = useRouter();
  const hasSavedItems = savedItems.length > 0;
  const hasSuggestions = suggestions.length > 0;

  if (!hasSavedItems && !hasSuggestions) {
    return null;
  }

  const displayedSuggestions = suggestions.slice(0, 4);
  const showSeeAll = savedItems.length > 6;
  const displayedSavedItems = showSeeAll ? savedItems.slice(0, 6) : savedItems;

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>While in {cityName}</Text>

      {/* Layer 1 — Saved Items */}
      {hasSavedItems && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedScrollContent}
          style={styles.savedScrollView}
        >
          {displayedSavedItems.map((item, index) => (
            <Pressable
              key={`${item.entityId}-${index}`}
              style={({ pressed }) => [
                styles.savedCard,
                pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
              ]}
              onPress={() => {
                router.push(`/discover/place-detail/${item.entityId}` as any);
              }}
            >
              <Image
                source={{ uri: item.imageUrl || undefined }}
                style={styles.savedCardImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.savedCardGradient}
              >
                <Text style={styles.savedCardCategory} numberOfLines={1}>
                  {item.category.toUpperCase()}
                </Text>
                <Text style={styles.savedCardName} numberOfLines={2}>
                  {item.name}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}

          {/* See All Card */}
          {showSeeAll && (
            <Pressable
              style={({ pressed }) => [
                styles.seeAllCard,
                pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
              ]}
              onPress={() => {
                router.push(`/(tabs)/trips/${tripId}?tab=1` as any);
              }}
            >
              <View style={styles.seeAllContent}>
                <Feather
                  name="grid"
                  size={24}
                  color={colors.orange}
                  style={styles.seeAllIcon}
                />
                <Text style={styles.seeAllText}>See all</Text>
                <Text style={styles.seeAllCount}>
                  {savedItems.length} saved
                </Text>
              </View>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Layer 2 — Suggestions */}
      {hasSuggestions && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsSubtitle}>Discover more</Text>

          {displayedSuggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.id}-${index}`}
              style={({ pressed }) => [
                styles.suggestionRow,
                pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
              ]}
              onPress={() => {
                router.push(`/discover/place-detail/${suggestion.id}` as any);
              }}
            >
              <Image
                source={{ uri: suggestion.imageUrl || undefined }}
                style={styles.suggestionImage}
                contentFit="cover"
              />

              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionName} numberOfLines={1}>
                  {suggestion.name}
                </Text>
                <Text style={styles.suggestionType} numberOfLines={1}>
                  {suggestion.placeType}
                </Text>
              </View>

              <Pressable
                style={styles.bookmarkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onSavePlace?.(suggestion.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="bookmark" size={18} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },

  // Saved Items Layer
  savedScrollView: {
    marginBottom: spacing.lg,
  },
  savedScrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  savedCard: {
    width: 160,
    height: 100,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  savedCardImage: {
    width: '100%',
    height: '100%',
  },
  savedCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'flex-end',
  },
  savedCardCategory: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  savedCardName: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
  },

  // See All Card
  seeAllCard: {
    width: 160,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.orangeFill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  seeAllContent: {
    alignItems: 'center',
  },
  seeAllIcon: {
    marginBottom: spacing.xs,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.orange,
    marginBottom: 2,
  },
  seeAllCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },

  // Suggestions Layer
  suggestionsContainer: {
    paddingHorizontal: spacing.screenX,
  },
  suggestionsSubtitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  suggestionImage: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  suggestionName: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  suggestionType: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  bookmarkButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default WhileInSection;
