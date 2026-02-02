import { theme } from '@/constants/theme';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

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
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.muted,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  label: {
    ...theme.typography.helper,
    color: theme.colors.muted,
    fontWeight: '500',
  },
});
