import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const hasSupabaseConfig = Boolean(url && anonKey && !url.includes('your-project'))
export const supabase: SupabaseClient | null = hasSupabaseConfig ? createClient(url, anonKey) : null

