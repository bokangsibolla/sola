export const colors = {
  background: '#FFFFFF',
  textPrimary: '#0E0E0E',
  textMuted: '#9A9A9A',
  orange: '#E5653A',
  orangeFill: '#FFF5F1',
  borderDefault: '#E8E8E8',
  overlayDark: 'rgba(0,0,0,0.45)',
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
};

export const radius = {
  sm: 8,
  md: 12,
  pill: 12,
  input: 14,
  card: 14,
  button: 16,
  full: 999,
};

export const fonts = {
  serif: 'InstrumentSerif-Regular',
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
};
