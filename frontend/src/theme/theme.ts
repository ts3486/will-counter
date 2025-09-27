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
    // Primary sprout green
    primary: '#4CAF50',
    
    // Background gradient colors
    background: {
      top: '#E6F8D9',     // Gradient top
      bottom: '#CDECB0',   // Gradient bottom
      mid: '#DAF2C4',      // Average mid-tone
    },
    
    // Text colors
    text: {
      primary: '#1B5E20',    // Dark green for primary text
      secondary: '#2E7D32',  // Medium green for secondary text
      light: '#66BB6A',      // Light green for muted text
    },
    
    // Surface colors
    surface: {
      primary: '#FFFFFF',     // White surface
      secondary: '#F1F8E9',   // Very light green surface
      elevated: '#E8F5E8',    // Light green elevated surface
    },
    
    // Border colors
    border: {
      light: '#C8E6C9',      // Light green border
      medium: '#A5D6A7',     // Medium green border
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