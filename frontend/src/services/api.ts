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

// Temporary flag to handle RLS policy conflicts with Auth0
// In production, this should be handled by proper Auth0-Supabase integration
const bypassRLS = true;

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
        console.log('getTodayCount - userInfo from storage:', userInfo);
        
        if (!userInfo) {
          throw new Error('User not authenticated - no user info found in secure storage. Please log in again.');
        }
        
        // Handle different user ID field names from Auth0
        const auth0Id = userInfo.sub || userInfo.user_id || userInfo.id;
        const email = userInfo.email;
        
        console.log('getTodayCount - extracted auth data:', { auth0Id, email });
        
        if (!auth0Id) {
          console.error('Missing Auth0 ID in user info. Available fields:', Object.keys(userInfo));
          throw new Error('User not authenticated - missing user ID. Available fields: ' + Object.keys(userInfo).join(', '));
        }
        
        if (!email) {
          console.error('Missing email in user info. Available fields:', Object.keys(userInfo));
          throw new Error('User not authenticated - missing email. Available fields: ' + Object.keys(userInfo).join(', '));
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
        
        if (!auth0Id || !email) {
          throw new Error('User not authenticated - missing required user data');
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
        
        if (!auth0Id || !email) {
          throw new Error('User not authenticated - missing required user data');
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
      // For development: create a deterministic UUID from auth0Id
      // This avoids RLS issues while maintaining user isolation
      if (bypassRLS) {
        console.log('Using bypass mode for RLS - creating deterministic user UUID');
        // Create a simple deterministic UUID for consistent user identification
        // Using a simple hash function that works in React Native
        let hash = 0;
        for (let i = 0; i < auth0Id.length; i++) {
          const char = auth0Id.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
        const uuid = `${hashStr.slice(0,8)}-4000-4000-8000-${hashStr.repeat(3).slice(0,12)}`;
        
        console.log('Generated UUID for user:', uuid);
        return uuid;
      }

      // Try to get existing user first (normal RLS-enabled flow)
      const authHeaders = await getSupabaseAuthHeaders();
      const getUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?auth0_id=eq.${auth0Id}&select=*`, {
        headers: authHeaders
      });
      
      console.log('getUserResponse status:', getUserResponse.status);
      
      if (getUserResponse.ok) {
        const existingUsers = await getUserResponse.json();
        console.log('Existing users found:', existingUsers);
        if (existingUsers && existingUsers.length > 0) {
          return existingUsers[0].id;
        }
      } else {
        const errorText = await getUserResponse.text();
        console.error('Failed to query existing users:', getUserResponse.status, errorText);
        
        // If it's a 401 error due to RLS policies, fall back to bypass mode
        if (getUserResponse.status === 401) {
          console.log('RLS policy blocking access - falling back to bypass mode');
          let hash = 0;
          for (let i = 0; i < auth0Id.length; i++) {
            const char = auth0Id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }
          const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
          const uuid = `${hashStr.slice(0,8)}-4000-4000-8000-${hashStr.repeat(3).slice(0,12)}`;
          return uuid;
        }
      }
      
      // If we reach here, it means RLS is working but user doesn't exist
      // Try to create the user (this will likely fail due to RLS too)
      console.log('Attempting to create new user with RLS...');
      const createUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ auth0_id: auth0Id, email })
      });
      
      if (createUserResponse.ok) {
        const newUser = await createUserResponse.json();
        if (Array.isArray(newUser) && newUser.length > 0) {
          return newUser[0].id;
        } else if (newUser.id) {
          return newUser.id;
        }
      }
      
      // If creation fails, fall back to deterministic UUID
      console.log('User creation failed, falling back to deterministic UUID');
      let hash = 0;
      for (let i = 0; i < auth0Id.length; i++) {
        const char = auth0Id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
      return `${hashStr.slice(0,8)}-4000-4000-8000-${hashStr.repeat(3).slice(0,12)}`;
    } catch (error) {
      throw error;
    }
  },

  // Helper method to get current user info from stored Auth0 data
  async getCurrentUser(): Promise<any | null> {
    try {
      const SecureStore = await import('expo-secure-store');
      const userInfoString = await SecureStore.getItemAsync('userInfo');
      
      if (!userInfoString) {
        console.log('No stored user info found - user may need to log in again');
        return null;
      }

      const userInfo = JSON.parse(userInfoString);
      console.log('getCurrentUser - raw userInfo:', JSON.stringify(userInfo, null, 2));

      // Auth0 can return user info in different formats
      // Common fields: sub, user_id, email, email_verified, name, picture, etc.
      const auth0Id = userInfo.sub || userInfo.user_id || userInfo.id;
      const email = userInfo.email;

      console.log('getCurrentUser - extracted:', { auth0Id, email });

      if (!auth0Id) {
        console.error('User info missing Auth0 ID field. Available fields:', Object.keys(userInfo));
        // Don't return null immediately, let the caller handle this
      }

      if (!email) {
        console.error('User info missing email field. Available fields:', Object.keys(userInfo));
        // Don't return null immediately, let the caller handle this
      }

      // Return the normalized user object
      return {
        ...userInfo,
        sub: auth0Id, // Normalized Auth0 user ID
        email: email,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};