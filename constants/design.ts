export const colors = {
  background: '#FFFFFF',
  textPrimary: '#0E0E0E',
  textMuted: '#9A9A9A',
  orange: '#E5653A',
  orangeFill: '#FFF5F1',
  borderDefault: '#E8E8E8',
  warning: '#D4940A',
  warningFill: '#FDF8EC',
  overlayDark: 'rgba(0,0,0,0.45)',
  textSecondary: '#6B6B6B',
  borderSubtle: '#F0F0F0',
  greenSoft: '#2D8A4E',
  greenFill: '#EEFBF3',
  blueSoft: '#3B82F6',
  blueFill: '#EFF6FF',
  // Emergency/danger colors
  emergency: '#D32F2F',
  emergencyFill: '#FDEAEA',
  // Neutral fills
  neutralFill: '#F3F3F3',
  // Overlay gradients (standardized)
  overlaySoft: 'rgba(0,0,0,0.35)',
  overlayMedium: 'rgba(0,0,0,0.55)',
  overlayStrong: 'rgba(0,0,0,0.7)',
  // Tab bar (legacy — kept for reference)
  tabBarBackground: '#FAF9F7',
  tabBarBorder: '#EBE7E3',
  tabBarInactive: '#B8B0AA',
  // Floating navigation
  floatingNavBg: '#FFFFFF',
  floatingNavBorder: '#F0F0F0',
  floatingNavIconInactive: '#9A9A9A',
  // Dashboard surfaces
  surfacePage: '#FAFAF8',
  surfaceCard: '#FFFFFF',
  // Editorial overlay system
  heroGradientEnd: 'rgba(0,0,0,0.55)',
  cardGradientEnd: 'rgba(0,0,0,0.5)',
  frostedPillBg: 'rgba(255,255,255,0.15)',
  frostedPillBorder: 'rgba(255,255,255,0.25)',
  textOnImage: '#FFFFFF',
  textOnImageMuted: 'rgba(255,255,255,0.7)',
};

export const spacing = {
  screenX: 24,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
  moduleInset: 20,
};

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  pill: 4,
  input: 12,
  card: 8,
  button: 14,
  module: 16,
  cardLg: 12,
  full: 999,
};

export const cardHeight = {
  sm: 160,
  md: 220,
  lg: 300,
  hero: 280,
};

export const pressedState = {
  opacity: 0.9,
  transform: [{ scale: 0.98 }] as const,
};

export const elevation = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.06,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.10,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.12,
    elevation: 10,
  },
} as const;

export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
};

export const typography = {
  h1: { fontFamily: fonts.semiBold, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: fonts.semiBold, fontSize: 28, lineHeight: 36 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  label: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  captionSmall: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  button: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
  tabLabel: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 12 },
  screenTitle: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 22 },
  tabRootTitle: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 28 },
  greeting: { fontFamily: fonts.semiBold, fontSize: 24, lineHeight: 32 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24 },
  heroTitle: { fontFamily: fonts.semiBold, fontSize: 28, lineHeight: 34 },
  heroSubtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 22 },
  cardSubtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  filterLabel: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  pillLabel: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
};
