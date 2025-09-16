import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using placeholder configuration for development.')
}

// Use fallback values for development if env vars are missing
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseKey || 'placeholder_key'

// Create regular client for frontend operations
export const supabase = createClient(url, key)

// Create admin client for backend operations (only use server-side)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(url, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase