import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors, fonts, typography } from '@/constants/design';

interface SolaTextProps extends Omit<TextProps, 'style'> {
  style?: TextStyle | TextStyle[];
}

export function Title({ children, style, ...props }: SolaTextProps) {
  return (
    <Text style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, style, ...props }: SolaTextProps) {
  return (
    <Text style={[styles.subtitle, style]} {...props}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...props }: SolaTextProps) {
  return (
    <Text style={[styles.body, style]} {...props}>
      {children}
    </Text>
  );
}

export function Label({ children, style, ...props }: SolaTextProps) {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    fontFamily: fonts.medium,
  },
});
