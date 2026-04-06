import { createClient } from '@supabase/supabase-js'

// ✅ Use your actual project ref and anon key
const SUPABASE_URL = 'https://njhbnqyamkwlsobqplvm.supabase.co' 
const SUPABASE_ANON_KEY = 'sb_publishable_CuzRSyNGcQ02-iOIQzJbGw_JE9fVTbx'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
