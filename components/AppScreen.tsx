import { colors, spacing } from '@/constants/design';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function AppScreen({ children, style }: AppScreenProps) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
