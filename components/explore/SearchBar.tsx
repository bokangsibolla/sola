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
        <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenX,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  placeholder: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
