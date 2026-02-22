import React from 'react';
// eslint-disable-next-line no-restricted-imports -- SolaText wraps the raw RN Text
import { Platform, Text, TextProps } from 'react-native';
import { colors, typography } from '@/constants/design';

type TypographyVariant = keyof typeof typography;

interface SolaTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  uppercase?: boolean;
  letterSpacing?: number;
  children: React.ReactNode;
}

export function SolaText({
  variant,
  color,
  uppercase,
  letterSpacing,
  style,
  maxFontSizeMultiplier = 1.3,
  children,
  ...rest
}: SolaTextProps) {
  const variantStyle = variant ? typography[variant] : undefined;

  // Resolve color: explicit prop > variant built-in > textPrimary fallback
  const resolvedColor =
    color ??
    (variantStyle && 'color' in variantStyle
      ? (variantStyle as Record<string, unknown>).color as string
      : colors.textPrimary);

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        variantStyle,
        { color: resolvedColor },
        Platform.OS === 'android' && { includeFontPadding: false },
        uppercase !== undefined && { textTransform: uppercase ? 'uppercase' as const : 'none' as const },
        letterSpacing !== undefined && { letterSpacing },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
