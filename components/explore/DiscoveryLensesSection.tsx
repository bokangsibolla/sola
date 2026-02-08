import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { DiscoveryLens } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  sunrise: 'sunrise',
  home: 'home',
  cloud: 'cloud',
  navigation: 'navigation',
  users: 'users',
  heart: 'heart',
  compass: 'compass',
  map: 'map-pin',
};

function LensPill({ lens }: { lens: DiscoveryLens }) {
  const router = useRouter();
  const iconName = ICON_MAP[lens.iconName] ?? 'compass';

  return (
    <Pressable
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      onPress={() => router.push(`/explore/lens/${lens.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={lens.title}
    >
      <Feather name={iconName} size={14} color={colors.orange} />
      <Text style={styles.pillText} numberOfLines={1}>{lens.title}</Text>
    </Pressable>
  );
}

export function DiscoveryLensesSection({ lenses }: { lenses: DiscoveryLens[] }) {
  if (lenses.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {lenses.map((lens) => (
        <LensPill key={lens.slug} lens={lens} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
    height: 40,
  },
  pillPressed: pressedState,
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
