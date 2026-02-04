// components/explore/sections/SectionLabel.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionLabelProps {
  label: string;
  onSeeAll?: () => void;
}

export function SectionLabel({ label, onSeeAll }: SectionLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
