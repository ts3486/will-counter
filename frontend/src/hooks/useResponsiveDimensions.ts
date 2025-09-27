import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ResponsiveDimensions {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  deviceType: 'phone' | 'tablet';
  orientationType: 'portrait' | 'landscape';
}

export const BREAKPOINTS = {
  TABLET_MIN_WIDTH: 768,
  PHONE_MAX_WIDTH: 767,
} as const;

export const useResponsiveDimensions = (): ResponsiveDimensions => {
  const [dimensions, setDimensions] = useState<ResponsiveDimensions>(() => {
    const { width, height } = Dimensions.get('window');
    const isTablet = width >= BREAKPOINTS.TABLET_MIN_WIDTH;
    const isLandscape = width > height;
    
    return {
      width,
      height,
      isTablet,
      isLandscape,
      deviceType: isTablet ? 'tablet' : 'phone',
      orientationType: isLandscape ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      const { width, height } = window;
      const isTablet = width >= BREAKPOINTS.TABLET_MIN_WIDTH;
      const isLandscape = width > height;
      
      setDimensions({
        width,
        height,
        isTablet,
        isLandscape,
        deviceType: isTablet ? 'tablet' : 'phone',
        orientationType: isLandscape ? 'landscape' : 'portrait',
      });
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};