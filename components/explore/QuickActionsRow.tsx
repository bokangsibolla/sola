import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface QuickAction {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

export function QuickActionsRow() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      label: 'Countries',
      icon: 'globe',
      onPress: () => router.push('/explore/all-countries'),
    },
    {
      label: 'Destinations',
      icon: 'map-pin',
      onPress: () => router.push('/explore/all-destinations'),
    },
    {
      label: 'Activities',
      icon: 'compass',
      onPress: () => router.push('/explore/all-activities'),
    },
    {
      label: 'My trips',
      icon: 'briefcase',
      onPress: () => router.navigate('/(tabs)/trips'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Feather name={action.icon} size={14} color={colors.textPrimary} />
            <Text style={styles.pillLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
  },
  pillPressed: pressedState,
  pillLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
