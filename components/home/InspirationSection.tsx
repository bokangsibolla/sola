import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface InspirationSectionProps {
  items: Array<{
    id: string;
    name: string;
    slug: string;
    heroImageUrl: string | null;
    vibeSummary: string | null;
    entityType: 'city' | 'country';
    countryName?: string;
  }>;
  reason?: 'personalized' | 'popular';
}

const InspirationSection: React.FC<InspirationSectionProps> = ({ items, reason }) => {
  const router = useRouter();

  if (items.length === 0) return null;

  const title = reason === 'personalized'
    ? 'Based on places you saved'
    : 'Popular with solo travelers';

  const handlePress = (item: InspirationSectionProps['items'][0]) => {
    if (item.entityType === 'city') {
      router.push(`/discover/city/${item.slug}` as any);
    } else {
      router.push(`/discover/country/${item.slug}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.map((item, index) => (
        <View key={item.id}>
          <Pressable
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: pressedState.opacity },
            ]}
          >
            {item.heroImageUrl ? (
              <Image
                source={{ uri: item.heroImageUrl }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
            )}
            <View style={styles.textContent}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              {item.vibeSummary && (
                <Text style={styles.summary} numberOfLines={1}>{item.vibeSummary}</Text>
              )}
              {!item.vibeSummary && item.countryName && (
                <Text style={styles.summary} numberOfLines={1}>{item.countryName}</Text>
              )}
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
          {index < items.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    marginRight: spacing.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  textContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  summary: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutralFill,
  },
});

export default InspirationSection;
