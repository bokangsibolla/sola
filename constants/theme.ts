import { Platform } from 'react-native';

// Premium design tokens matching website
export const theme = {
  colors: {
    background: '#FFFFFF', // White background like website
    card: '#FFFFFF',
    text: '#111111', // Dark charcoal/black
    muted: 'rgba(17,17,17,0.6)', // Softer gray for subtitles
    border: 'rgba(0,0,0,0.08)', // Subtle border
    shadow: 'rgba(0,0,0,0.08)',
    brand: '#E5653A', // Vibrant orange matching website
    // Legacy color keys for backward compatibility
    bg: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: 'rgba(17,17,17,0.55)',
    mutedText: 'rgba(17,17,17,0.55)',
    primary: '#E5653A',
    orange: '#E5653A',
    borderSubtle: 'rgba(0,0,0,0.06)',
    surfaceMuted: '#FAFAFA',
  },
  radii: {
    card: 22,
    pill: 999,
    input: 16,
    button: 16,
  },
  // Alias for backward compatibility
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  spacing: {
    // Premium spacing tokens
    screenX: 24,
    cardPad: 22,
    gapSm: 10,
    gapMd: 14,
    gapLg: 18,
    // Legacy spacing keys for backward compatibility
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  typography: {
    h1: {
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: -0.3,
      fontFamily: 'Inter-SemiBold',
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Inter-Regular',
    },
    helper: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter-Regular',
    },
    button: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
  },
  shadow: Platform.select({
    ios: {
      shadowColor: 'rgba(0,0,0,0.08)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: 'rgba(0,0,0,0.08)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
  }),
};

// Runtime guard for development
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  if (!theme.spacing || !theme.radius) {
    console.error(
      'Theme Error: theme.spacing or theme.radius is missing. ' +
      'Please check constants/theme.ts to ensure all required keys are present.'
    );
  }
  // Validate required spacing keys
  const requiredSpacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];
  const missingSpacing = requiredSpacingKeys.filter(key => !(key in theme.spacing));
  if (missingSpacing.length > 0) {
    console.error(
      `Theme Error: Missing spacing keys: ${missingSpacing.join(', ')}. ` +
      'Please add them to theme.spacing in constants/theme.ts'
    );
  }
  // Validate required radius keys
  const requiredRadiusKeys = ['sm', 'md', 'lg', 'xl'];
  const missingRadius = requiredRadiusKeys.filter(key => !(key in theme.radius));
  if (missingRadius.length > 0) {
    console.error(
      `Theme Error: Missing radius keys: ${missingRadius.join(', ')}. ` +
      'Please add them to theme.radius in constants/theme.ts'
    );
  }
}

// Legacy exports for compatibility
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
