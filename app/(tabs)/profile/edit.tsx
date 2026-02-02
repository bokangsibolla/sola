import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, typography } from '@/constants/design';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Ionicons name="construct-outline" size={40} color={colors.textMuted} />
        <Text style={styles.text}>Profile editing coming soon.</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/(onboarding)/profile')}
        >
          <Text style={styles.buttonText}>Go to onboarding setup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  navTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
});
