import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/design';

const PILLARS = [
  { label: 'Guides', route: '/(tabs)/explore/all-destinations' },
  { label: 'Travelers', route: '/(tabs)/home' },
  { label: 'Community', route: '/(tabs)/community' },
];

export function PillarsRow() {
  const router = useRouter();

  return (
    <View style={styles.row}>
      {PILLARS.map((pillar, i) => (
        <View key={pillar.label} style={styles.itemWrap}>
          {i > 0 && <View style={styles.dot} />}
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => router.push(pillar.route as any)}
            accessibilityRole="button"
            accessibilityLabel={pillar.label}
            hitSlop={12}
          >
            <Text style={styles.label}>{pillar.label}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
  item: {
    paddingVertical: spacing.xs,
  },
  itemPressed: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.textPrimary,
  },
});
