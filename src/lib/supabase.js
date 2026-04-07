import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://njhbnqyamkwlsobqplvm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CuzRSyNGcQ02-iOIQzJbGw_JE9fVTbx';

// ✅ Initialize outside the component to ensure it's a singleton
// This prevents multiple initializations and orphaned locks in development.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

