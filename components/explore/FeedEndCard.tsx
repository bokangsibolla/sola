// components/explore/FeedEndCard.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

export function FeedEndCard() {
  const router = useRouter();

  const handleSearch = () => {
    router.push('/(tabs)/explore/search');
  };

  const handleAllCountries = () => {
    router.push({
      pathname: '/(tabs)/explore/see-all',
      params: { category: 'countries', title: 'All countries' },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Looking for somewhere specific?</Text>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={handleSearch}>
          <Feather name="search" size={18} color={colors.textPrimary} />
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleAllCountries}>
          <Feather name="globe" size={18} color={colors.textPrimary} />
          <Text style={styles.buttonText}>All countries</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.xl,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
