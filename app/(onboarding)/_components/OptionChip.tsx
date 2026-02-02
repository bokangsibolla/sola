import { colors, radius, spacing } from '@/constants/design';
import { Pressable, StyleSheet, Text } from 'react-native';

interface OptionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function OptionChip({ label, selected, onPress }: OptionChipProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  chipText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
  },
  chipTextSelected: {
    color: colors.background,
  },
});
