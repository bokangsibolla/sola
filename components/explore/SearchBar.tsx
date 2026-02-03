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
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    // Airbnb-style prominent shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    gap: spacing.md,
  },
  placeholder: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
