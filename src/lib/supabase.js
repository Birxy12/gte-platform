import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://njhbnqyamkwlsobqplvm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_CuzRSyNGcQ02-iOIQzJbGw_JE9fVTbx'

// ✅ SINGLE instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
