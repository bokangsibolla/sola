import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, radius, spacing } from '@/constants/design';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <SolaText variant="body" color={colors.textMuted} style={styles.message}>{message ?? 'Something went wrong'}</SolaText>
      {onRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <SolaText variant="button" color={colors.background}>Retry</SolaText>
        </Pressable>
      )}
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
  message: {
    textAlign: 'center' as const,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
});
