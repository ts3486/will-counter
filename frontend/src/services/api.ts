const API_BASE_URL = 'http://localhost:8080';
const SUPABASE_URL = 'https://mrbyvoccayqxddwrnsye.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnl2b2NjYXlxeGRkd3Juc3llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAwNjYzOCwiZXhwIjoyMDYxNTgyNjM4fQ.XcWsv0uJ4UfrL4usgwUmk40Ktq93u-m8lWQ_V3XlgKA';

// Fallback to Supabase REST API if backend is not available
const useSupabaseDirectly = true; // Set to true to bypass backend

export const apiService = {
  async getTodayCount(userId: string) {
    if (useSupabaseDirectly) {
      // Direct Supabase REST API call
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${SUPABASE_URL}/rest/v1/will_counts?user_id=eq.${userId}&date=eq.${today}`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data[0] || { user_id: userId, count: 0, date: today };
    } else {
      // Use backend API
      const response = await fetch(`${API_BASE_URL}/api/will-counts/${userId}/today`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  },

  async incrementCount(userId: string) {
    if (useSupabaseDirectly) {
      // Direct Supabase function call
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_will_count`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_user_id: userId })
      });
      return await response.json();
    } else {
      // Use backend API
      const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
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
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ auth0_id: auth0Id, email })
      });
      return await response.json();
    } else {
      // Use backend API
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth0_id: auth0Id, email }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  }
};