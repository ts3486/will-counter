import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../shared/types/database';

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    // Disable Supabase auth since we're using Auth0
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Function to set Auth0 JWT token for Supabase
export const setSupabaseAuth = (token: string) => {
  supabase.functions.setAuth(token);
};