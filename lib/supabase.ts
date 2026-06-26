// Supabase client - only used if env vars are properly configured
import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key)
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars not set')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
