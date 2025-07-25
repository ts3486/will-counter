import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:8080';
const SUPABASE_URL = 'https://mrbyvoccayqxddwrnsye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnl2b2NjYXlxeGRkd3Juc3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDY2MzgsImV4cCI6MjA2MTU4MjYzOH0.HZvhGXkPsd1Uq_UQRQrfXChVhUy7jb3S5AqYl9x1qkI';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnl2b2NjYXlxeGRkd3Juc3llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAwNjYzOCwiZXhwIjoyMDYxNTgyNjM4fQ.XcWsv0uJ4UfrL4usgwUmk40Ktq93u-m8lWQ_V3XlgKA';

// Fallback to Supabase REST API if backend is not available
const useSupabaseDirectly = true; // Set to true to bypass backend

// Helper function to disable RLS for testing
const getSupabaseHeaders = (useServiceRole: boolean = false) => {
  const key = useServiceRole ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
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
  async getTodayCount(userId: string) {
    if (useSupabaseDirectly) {
      try {
        // First, ensure we have a valid user
        const testUserAuth0Id = 'test-user-1';
        const testUserUuid = await this.ensureUserExists(testUserAuth0Id, 'test@example.com');
        const today = new Date().toISOString().split('T')[0];
        console.log('Fetching today count for user UUID:', testUserUuid, 'date:', today);
        const response = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${testUserUuid}&date=eq.${today}`, {
          headers: {
            ...getSupabaseHeaders(true),
            'Prefer': 'return=representation'
          }
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error details:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        // Return the first record or create a default structure
        if (data && data.length > 0) {
          return data[0];
        } else {
          // Return a default structure that matches our types
          return { 
            id: 'temp-id',
            user_id: testUserUuid, 
            count: 0, 
            date: today,
            timestamps: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('Error fetching today count:', error);
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

  async incrementCount(userId: string) {
    if (useSupabaseDirectly) {
      try {
        // First, ensure we have a valid user
        const testUserAuth0Id = 'test-user-1';
        const testUserUuid = await this.ensureUserExists(testUserAuth0Id, 'test@example.com');
        console.log('Incrementing count for user UUID:', testUserUuid);
      
      // Try to use the increment function first
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_will_count`, {
          method: 'POST',
          headers: getSupabaseHeaders(true),
          body: JSON.stringify({ p_user_id: testUserUuid })
        });
        console.log('Increment response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Increment result:', result);
          return result;
        } else {
          const errorText = await response.text();
          console.error('Increment function error:', errorText);
        }
      } catch (error) {
        console.log('Function call failed, trying direct table operation:', error);
      }
      
      // Fallback: Direct table operations
      const today = new Date().toISOString().split('T')[0];
      
      // First, get current count
      const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${testUserUuid}&date=eq.${today}`, {
        headers: getSupabaseHeaders(true)
      });
      const currentData = await getResponse.json();
      const currentRecord = currentData[0];
      
      if (currentRecord) {
        // Update existing record
        const newCount = currentRecord.count + 1;
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?id=eq.${currentRecord.id}`, {
          method: 'PATCH',
          headers: {
            ...getSupabaseHeaders(true),
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
            ...getSupabaseHeaders(true),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: testUserUuid,
            count: 1,
            date: today,
            timestamps: [new Date().toISOString()],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
        console.log('Create response status:', createResponse.status);
        const newData = await createResponse.json();
        console.log('Create response data:', newData);
        return newData[0] || newData;
      }
      } catch (error) {
        console.error('Error incrementing count:', error);
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

  async resetTodayCount(userId: string) {
    if (useSupabaseDirectly) {
      try {
        // First, ensure we have a valid user
        const testUserAuth0Id = 'test-user-1';
        const testUserUuid = await this.ensureUserExists(testUserAuth0Id, 'test@example.com');
        const today = new Date().toISOString().split('T')[0];
        console.log('Resetting count for user UUID:', testUserUuid, 'date:', today);
        
        // Check if record exists for today
        const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${testUserUuid}&date=eq.${today}`, {
          headers: getSupabaseHeaders(true)
        });
        const currentData = await getResponse.json();
        const currentRecord = currentData[0];
        
        if (currentRecord) {
          // Update existing record to reset count
          const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?id=eq.${currentRecord.id}`, {
            method: 'PATCH',
            headers: {
              ...getSupabaseHeaders(true),
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
              ...getSupabaseHeaders(true),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              user_id: testUserUuid,
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
        console.error('Error resetting count:', error);
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
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ auth0_id: auth0Id, email })
      });
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
      // Try to get existing user first (use service role to bypass RLS)
      console.log('Looking for existing user with auth0_id:', auth0Id);
      const getUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?auth0_id=eq.${auth0Id}`, {
        headers: getSupabaseHeaders(true)
      });
      
      if (!getUserResponse.ok) {
        const errorText = await getUserResponse.text();
        console.error('Error fetching user:', errorText);
      } else {
        const existingUsers = await getUserResponse.json();
        console.log('User lookup response:', existingUsers);
        if (existingUsers && existingUsers.length > 0) {
          console.log('Found existing user:', existingUsers[0].id);
          return existingUsers[0].id;
        }
      }
      
      // Try to find user by email as fallback
      console.log('User not found by auth0_id, trying email lookup for:', email);
      const getUserByEmailResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
        headers: getSupabaseHeaders(true)
      });
      
      if (getUserByEmailResponse.ok) {
        const existingUsersByEmail = await getUserByEmailResponse.json();
        console.log('Email lookup response:', existingUsersByEmail);
        if (existingUsersByEmail && existingUsersByEmail.length > 0) {
          console.log('Found existing user by email:', existingUsersByEmail[0].id);
          // Update the auth0_id for this user
          const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${existingUsersByEmail[0].id}`, {
            method: 'PATCH',
            headers: {
              ...getSupabaseHeaders(true),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ auth0_id: auth0Id })
          });
          
          if (updateResponse.ok) {
            console.log('Updated user with auth0_id');
            return existingUsersByEmail[0].id;
          }
        }
      }
      
      // Create new user if doesn't exist (use service role to bypass RLS)
      console.log('Creating new user for auth0_id:', auth0Id, 'email:', email);
      const createUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          ...getSupabaseHeaders(true),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ auth0_id: auth0Id, email })
      });
      
      if (!createUserResponse.ok) {
        const errorText = await createUserResponse.text();
        console.error('Create user error details:', errorText);
        throw new Error(`Failed to create user: ${errorText}`);
      }
      
      const newUser = await createUserResponse.json();
      console.log('Create user response:', newUser);
      if (Array.isArray(newUser) && newUser.length > 0) {
        console.log('Created new user:', newUser[0].id);
        return newUser[0].id;
      } else if (newUser.id) {
        console.log('Created new user:', newUser.id);
        return newUser.id;
      } else {
        throw new Error('Failed to create user: ' + JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }
};