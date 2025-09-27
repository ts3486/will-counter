import { ResponsiveDimensions } from '../hooks/useResponsiveDimensions';

export const RESPONSIVE_SPACING = {
  // Base spacing units
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RESPONSIVE_BREAKPOINTS = {
  TABLET_MIN_WIDTH: 768,
  PHONE_MAX_WIDTH: 767,
} as const;

export const getResponsiveSpacing = (
  baseSpacing: keyof typeof RESPONSIVE_SPACING,
  { isTablet }: Pick<ResponsiveDimensions, 'isTablet'>
): number => {
  const base = RESPONSIVE_SPACING[baseSpacing];
  return isTablet ? Math.round(base * 1.5) : base;
};

export const getResponsivePadding = (
  { isTablet }: Pick<ResponsiveDimensions, 'isTablet'>
): number => {
  return isTablet ? 32 : 24;
};

export const getResponsiveFontSize = (
  baseFontSize: number,
  { isTablet }: Pick<ResponsiveDimensions, 'isTablet'>
): number => {
  return isTablet ? Math.round(baseFontSize * 1.1) : baseFontSize;
};

export const getResponsiveCircleSize = (
  screenWidth: number,
  { isTablet }: Pick<ResponsiveDimensions, 'isTablet'>
): number => {
  if (isTablet) {
    return Math.min(screenWidth * 0.5, 400);
  }
  return Math.min(screenWidth * 0.7, 300);
};

export const getMaxContentWidth = (
  { isTablet }: Pick<ResponsiveDimensions, 'isTablet'>
): number | undefined => {
  return isTablet ? 800 : undefined;
};