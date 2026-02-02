import { colors, spacing } from '@/constants/design';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export default function OnboardingScreen({ children, style, contentStyle }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView 
      style={[styles.container, style]} 
      edges={['top', 'bottom']}
    >
      <View 
        style={[
          styles.content, 
          { 
            paddingTop: spacing.lg,
            paddingBottom: spacing.lg,
          },
          contentStyle
        ]}
      >
        {children}
      </View>
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
