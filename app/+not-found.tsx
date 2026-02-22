import { useGlobalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing } from '@/constants/design';

export default function NotFoundScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <SolaText style={styles.title}>Page not found</SolaText>
      <SolaText style={styles.debug}>
        Attempted: {JSON.stringify(params, null, 2)}
      </SolaText>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <SolaText style={styles.buttonText}>Go home</SolaText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  debug: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
