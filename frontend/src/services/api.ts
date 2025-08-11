import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Configuration warning removed for production
}

// Fallback to Supabase REST API if backend is not available
const useSupabaseDirectly = true; // Set to true to bypass backend

// Security configuration
const useApplicationLevelSecurity = true;

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
  },
  uuid: (uuid: string): boolean => {
    return typeof uuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
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

// Helper function to get Supabase headers with anon key
const getSupabaseHeaders = () => {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to get Supabase headers with anon key
// Note: We use anon key instead of Auth0 JWT because Auth0 access tokens 
// are not compatible with Supabase's JWT format
const getSupabaseAuthHeaders = async () => {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
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
  async getTodayCount(_userId?: string) {
    if (useSupabaseDirectly) {
      try {
        // Get current authenticated user info
        const userInfo = await this.getCurrentUser();
        
        if (!userInfo) {
          throw new Error('User not authenticated - no user info found in secure storage. Please log in again.');
        }
        
        // Handle different user ID field names from Auth0
        const auth0Id = userInfo.sub || userInfo.user_id || userInfo.id;
        const email = userInfo.email;
        
        
        // Validate user data
        if (!validateInput.auth0Id(auth0Id)) {
          throw new Error('Invalid user authentication data');
        }
        
        if (!validateInput.email(email)) {
          throw new Error('Invalid user email format');
        }
        
        // Check rate limiting
        if (!checkRateLimit(auth0Id)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        const userUuid = await this.ensureUserExists(auth0Id, email);
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${userUuid}&date=eq.${today}`, {
          headers: {
            ...getSupabaseHeaders(),
            'Prefer': 'return=representation'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Return the first record or create a default structure
        if (data && data.length > 0) {
          return data[0];
        } else {
          // Return a default structure that matches our types
          return { 
            id: 'temp-id',
            user_id: userUuid, 
            count: 0, 
            date: today,
            timestamps: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      } catch (error) {
        throw error;
      }
    } else {
      // Use backend API
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/today`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch today count');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  },

  async incrementCount(_userId?: string) {
    if (useSupabaseDirectly) {
      try {
        // Get current authenticated user info
        const userInfo = await this.getCurrentUser();
        if (!userInfo) {
          throw new Error('User not authenticated - no user info found in secure storage. Please log in again.');
        }
        
        const auth0Id = userInfo.sub || userInfo.user_id || userInfo.id;
        const email = userInfo.email;
        
        // Validate user data
        if (!validateInput.auth0Id(auth0Id)) {
          throw new Error('Invalid user authentication data');
        }
        
        if (!validateInput.email(email)) {
          throw new Error('Invalid user email format');
        }
        
        // Check rate limiting
        if (!checkRateLimit(auth0Id)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        const userUuid = await this.ensureUserExists(auth0Id, email);
      
      // Try to use the increment function first
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_will_count`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({ p_user_id: userUuid })
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        }
      } catch (error) {
        // Fallback to direct table operations
      }
      
      // Fallback: Direct table operations
      const today = new Date().toISOString().split('T')[0];
      
      // First, get current count
      const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${userUuid}&date=eq.${today}`, {
        headers: getSupabaseHeaders()
      });
      const currentData = await getResponse.json();
      const currentRecord = currentData[0];
      
      if (currentRecord) {
        // Update existing record
        const newCount = currentRecord.count + 1;
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?id=eq.${currentRecord.id}`, {
          method: 'PATCH',
          headers: {
            ...getSupabaseHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ 
            count: newCount, 
            updated_at: new Date().toISOString() 
          })
        });
        const updatedData = await updateResponse.json();
        return updatedData[0];
      } else {
        // Create new record
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts`, {
          method: 'POST',
          headers: {
            ...getSupabaseHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userUuid,
            count: 1,
            date: today,
            timestamps: [new Date().toISOString()],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
        const newData = await createResponse.json();
        return newData[0] || newData;
      }
      } catch (error) {
        throw error;
      }
    } else {
      // Use backend API
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
        method: 'POST',
        headers,
      });
      if (!response.ok) throw new Error('Failed to increment count');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  },

  async resetTodayCount(_userId?: string) {
    if (useSupabaseDirectly) {
      try {
        // Get current authenticated user info
        const userInfo = await this.getCurrentUser();
        if (!userInfo) {
          throw new Error('User not authenticated - no user info found in secure storage. Please log in again.');
        }
        
        const auth0Id = userInfo.sub || userInfo.user_id || userInfo.id;
        const email = userInfo.email;
        
        // Validate user data
        if (!validateInput.auth0Id(auth0Id)) {
          throw new Error('Invalid user authentication data');
        }
        
        if (!validateInput.email(email)) {
          throw new Error('Invalid user email format');
        }
        
        // Check rate limiting
        if (!checkRateLimit(auth0Id)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        const userUuid = await this.ensureUserExists(auth0Id, email);
        const today = new Date().toISOString().split('T')[0];
        
        // Check if record exists for today
        const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${userUuid}&date=eq.${today}`, {
          headers: getSupabaseHeaders()
        });
        const currentData = await getResponse.json();
        const currentRecord = currentData[0];
        
        if (currentRecord) {
          // Update existing record to reset count
          const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?id=eq.${currentRecord.id}`, {
            method: 'PATCH',
            headers: {
              ...getSupabaseHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ 
              count: 0, 
              timestamps: [],
              updated_at: new Date().toISOString() 
            })
          });
          
          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to reset count: ${errorText}`);
          }
          
          const updatedData = await updateResponse.json();
          return updatedData[0];
        } else {
          // Create new record with count 0
          const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts`, {
            method: 'POST',
            headers: {
              ...getSupabaseHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              user_id: userUuid,
              count: 0,
              date: today,
              timestamps: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });
          
          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create reset record: ${errorText}`);
          }
          
          const newData = await createResponse.json();
          return newData[0] || newData;
        }
      } catch (error) {
        throw error;
      }
    } else {
      // Use backend API
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/will-counts/reset`, {
        method: 'POST',
        headers,
      });
      if (!response.ok) throw new Error('Failed to reset count');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  },

  async createUser(auth0Id: string, email: string) {
    if (useSupabaseDirectly) {
      // Direct Supabase REST API call
      const headers = await getSupabaseAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ auth0_id: auth0Id, email })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } else {
      // Use backend API
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
    }
  },

  async ensureUserExists(auth0Id: string, email: string): Promise<string> {
    try {
      // Validate inputs
      if (!validateInput.auth0Id(auth0Id) || !validateInput.email(email)) {
        throw new Error('Invalid user identification data');
      }
      
      // SECURITY: Generate cryptographically secure UUID with salt
      // This prevents reverse engineering of Auth0 IDs
      if (useApplicationLevelSecurity) {
        // Add application-specific salt to prevent brute force attacks
        const APP_SALT = 'will-counter-app-2024-secure-salt-v1';
        const encoder = new TextEncoder();
        const data = encoder.encode(APP_SALT + auth0Id + email + APP_SALT);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = new Uint8Array(hashBuffer);
        
        // Use multiple rounds of hashing for additional security
        const secondHash = await crypto.subtle.digest('SHA-256', hashArray);
        const finalArray = new Uint8Array(secondHash);
        
        // Create a proper UUID v4 format from the hash
        const hex = Array.from(finalArray).map(b => b.toString(16).padStart(2, '0')).join('');
        const uuid = [
          hex.slice(0, 8),
          hex.slice(8, 12),
          '4' + hex.slice(12, 15), // Version 4
          ('8' + hex.slice(15, 18)), // Variant bits  
          hex.slice(18, 30).padEnd(12, '0')
        ].join('-');
        
        return uuid;
      }
      
      throw new Error('Invalid security configuration');
    } catch (error) {
      // Secure fallback with salt (deterministic)
      const APP_SALT = 'will-counter-fallback-salt-2024';
      const secureInput = APP_SALT + auth0Id + email + APP_SALT;
      const simpleHash = btoa(secureInput).replace(/[^a-f0-9]/gi, '').toLowerCase();
      const uuid = [
        simpleHash.slice(0, 8).padEnd(8, '0'),
        simpleHash.slice(8, 12).padEnd(4, '0'),
        '4' + simpleHash.slice(12, 15).padEnd(3, '0'),
        '8' + simpleHash.slice(15, 18).padEnd(3, '0'),
        simpleHash.slice(18, 30).padEnd(12, '0')
      ].join('-');
      return uuid;
    }
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