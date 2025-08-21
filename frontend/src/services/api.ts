import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Configuration warning removed for production
}

// Use secure backend API (recommended approach)
const useSupabaseDirectly = false; // Always use backend for security

// Backend API handles all rate limiting and validation server-side

// No direct Supabase access - all requests go through secure backend API

// Helper function removed - getAuthHeaders handles token retrieval

const getAuthHeaders = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    
    if (!accessToken) {
      return {
        'Content-Type': 'application/json',
      };
    }
    
    // Handle case where token might be stored as object or corrupted
    let tokenString = accessToken;
    if (typeof accessToken !== 'string') {
      try {
        tokenString = String(accessToken);
      } catch (e) {
        tokenString = '';
      }
    }
    
    // Check if token looks like a JWT or JWE
    const parts = tokenString.split('.');
    if (parts.length === 5) {
      // JWE tokens are valid and more secure
    } else if (parts.length === 3) {
      // Validate JWT token
      try {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp < now) {
          await SecureStore.deleteItemAsync('accessToken');
          return {
            'Content-Type': 'application/json',
          };
        }
      } catch (e) {
        await SecureStore.deleteItemAsync('accessToken');
        return {
          'Content-Type': 'application/json',
        };
      }
    } else {
      // Clear invalid token
      await SecureStore.deleteItemAsync('accessToken');
      return {
        'Content-Type': 'application/json',
      };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    };
  } catch (error) {
    return {
      'Content-Type': 'application/json',
    };
  }
};

export const apiService = {
  async getTodayCount(_userId?: string) {
    if (useSupabaseDirectly) {
      throw new Error('Direct Supabase access has been disabled for security. Please use the backend API.');
    } else {
      // Use secure backend API
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/today`, {
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to continue.');
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch today count: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      
      // Handle direct WillCount response or wrapped ApiResponse
      if (result.success !== undefined) {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }
      
      // Direct WillCount response
      return result;
    }
  },

  async incrementCount(_userId?: string) {
    if (useSupabaseDirectly) {
      throw new Error('Direct Supabase access has been disabled for security. Please use the backend API.');
    } else {
      // Use secure backend API
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
        method: 'POST',
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to continue.');
        }
        const errorText = await response.text();
        throw new Error(`Failed to increment count: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      
      // Handle direct WillCount response or wrapped ApiResponse
      if (result.success !== undefined) {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }
      
      // Direct WillCount response
      return result;
    }
  },

  async resetTodayCount(_userId?: string) {
    if (useSupabaseDirectly) {
      throw new Error('Direct Supabase access has been disabled for security. Please use the backend API.');
    } else {
      // Use secure backend API
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/reset`, {
        method: 'POST',
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to continue.');
        }
        const errorText = await response.text();
        throw new Error(`Failed to reset count: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      
      // Handle direct WillCount response or wrapped ApiResponse
      if (result.success !== undefined) {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }
      
      // Direct WillCount response
      return result;
    }
  },

  async createUser(_auth0Id?: string, _email?: string) {
    // Use secure backend API for user creation
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/will-counts/users/ensure`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to continue.');
      }
      const errorText = await response.text();
      throw new Error(`Failed to ensure user exists: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  // User creation is now handled securely by the backend API
  // No need for client-side UUID generation or user management

  // Helper method to get current user info from stored Auth0 data
  async getCurrentUser(): Promise<any | null> {
    try {
      const SecureStore = await import('expo-secure-store');
      const userInfoString = await SecureStore.getItemAsync('userInfo');
      
      if (!userInfoString) {
        return null;
      }

      const userInfo = JSON.parse(userInfoString);

      // Auth0 can return user info in different formats
      // Common fields: sub, user_id, email, email_verified, name, picture, etc.
      const auth0Id = userInfo.sub || userInfo.user_id || userInfo.id;
      const email = userInfo.email;

      if (!auth0Id || !email) {
        return null;
      }

      // Return the normalized user object
      return {
        ...userInfo,
        sub: auth0Id, // Normalized Auth0 user ID
        email: email,
      };
    } catch (error) {
      return null;
    }
  }
};