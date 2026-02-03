import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface SearchBarProps {
  placeholder?: string;
  onPress: () => void;
}

export default function SearchBar({
  placeholder = 'Start your search',
  onPress,
}: SearchBarProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.inner}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.background,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  placeholder: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
