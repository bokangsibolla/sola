import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface SearchBarProps {
  onPress: () => void;
}

export default function SearchBar({ onPress }: SearchBarProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search destinations and experiences"
    >
      <View style={styles.iconWrap}>
        <Feather name="search" size={16} color={colors.textMuted} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Where feels right?</Text>
        <Text style={styles.subtitle}>A country, city, or vibe</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
});
