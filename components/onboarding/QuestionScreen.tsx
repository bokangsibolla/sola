import { theme } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuestionScreenProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  primaryButtonLabel: string;
  onPrimaryPress: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
}

export default function QuestionScreen({
  title,
  subtitle,
  children,
  primaryButtonLabel,
  onPrimaryPress,
  secondaryButtonLabel,
  onSecondaryPress,
}: QuestionScreenProps) {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + theme.spacing.md;
  const bottomPadding = insets.bottom + theme.spacing.md;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.content}>{children}</View>
        <View style={[styles.buttons, { paddingBottom: bottomPadding }]}>
          {secondaryButtonLabel && onSecondaryPress && (
            <Pressable style={styles.secondaryButton} onPress={onSecondaryPress}>
              <Text style={styles.secondaryButtonText}>{secondaryButtonLabel}</Text>
            </Pressable>
          )}
          <Pressable style={styles.primaryButton} onPress={onPrimaryPress}>
            <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.mutedText,
  },
  content: {
    flex: 1,
  },
  buttons: {
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
