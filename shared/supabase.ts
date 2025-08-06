import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase configuration not set. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export * from './types/database'