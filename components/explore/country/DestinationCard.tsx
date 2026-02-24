import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import type { City, PlaceKind } from '@/data/types';

interface DestinationCardProps {
  city: City;
  showBorder?: boolean;
}

function humanizeKind(kind: PlaceKind): string {
  return kind.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayKindLabel(city: City): string {
  return city.placeKindDescriptor ?? humanizeKind(city.placeKind);
}

export function DestinationCard({ city, showBorder = true }: DestinationCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        showBorder && styles.border,
        pressed && pressedState,
      ]}
      onPress={() => router.push(`/(tabs)/discover/city/${city.slug}` as any)}
    >
      {city.heroImageUrl ? (
        <Image source={{ uri: city.heroImageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.kindLabel} numberOfLines={1}>{displayKindLabel(city)}</Text>
      </View>
      <BookmarkButton entityType="city" entityId={city.id} size={18} />
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const IMAGE_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    minHeight: 72,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  content: {
    flex: 1,
    marginLeft: spacing.lg,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  kindLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
});
