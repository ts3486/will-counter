import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Validate required environment variables
if (!API_BASE_URL) {
  console.warn('API_BASE_URL is not configured');
}

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

// Input validation and sanitization
const validateInput = {
  auth0Id: (id: string): boolean => {
    return typeof id === 'string' && /^[a-zA-Z0-9\-_|]+$/.test(id) && id.length > 0 && id.length < 256;
  },
  email: (email: string): boolean => {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 256;
  }
};

// Rate limiting check
const checkRateLimit = (auth0Id: string): boolean => {
  const now = Date.now();
  const userLimit = userRequestCounts.get(auth0Id);
  
  if (!userLimit || now > userLimit.resetTime) {
    userRequestCounts.set(auth0Id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Helper function to get access token
const getAccessToken = async () => {
  try {
    const SecureStoreModule = await import('expo-secure-store');
    return await SecureStoreModule.getItemAsync('accessToken');
  } catch (error) {
    return null;
  }
};

const getAuthHeaders = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
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
  async ensureUser() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/ensure`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to ensure user');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async getTodayCount(_userId?: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/will-counts/today`, {
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch today count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async incrementCount(_userId?: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to increment count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async resetTodayCount(_userId?: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/will-counts/reset`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to reset count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async createUser(auth0Id: string, email: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ auth0_id: auth0Id, email }),
    });
    if (!response.ok) throw new Error('Failed to create user');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

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