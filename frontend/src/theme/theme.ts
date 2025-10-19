export interface AppTheme {
  colors: {
    primary: string;
    background: {
      top: string;
      bottom: string;
      mid: string;
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
    };
    surface: {
      primary: string;
      secondary: string;
      elevated: string;
    };
    border: {
      light: string;
      medium: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const theme: AppTheme = {
  colors: {
    // Primary accent color - dark green for good contrast on light green backgrounds
    primary: '#2E7D32',
    
    // Green background colors - using your specified color codes
    background: {
      top: '#E6F8D9',        // Background Top (gradient)
      bottom: '#CDECB0',     // Background Bottom (gradient)  
      mid: '#DAF2C4',        // Background Mid (average)
    },
    
    // Text colors optimized for green backgrounds
    text: {
      primary: '#1B5E20',       // Dark green for primary text - excellent contrast
      secondary: '#2E7D32',     // Medium dark green for secondary text
      light: '#4CAF50',         // Primary green for muted text
    },
    
    // Surface colors for green background theme
    surface: {
      primary: '#FFFFFF',                    // Pure white for cards/modals
      secondary: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
      elevated: 'rgba(255, 255, 255, 0.95)', // More opaque white for elevation
    },
    
    // Border colors using green tones
    border: {
      light: 'rgba(46, 125, 50, 0.2)',      // Light green border
      medium: 'rgba(46, 125, 50, 0.3)',     // Medium green border
    },
    
    // Status colors
    status: {
      success: '#4CAF50',    // Primary green for success
      warning: '#FF9800',    // Orange for warnings  
      error: '#F44336',      // Red for errors
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius scale
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
};

export default theme;