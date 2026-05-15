import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseUrl.startsWith('https://')

// Create client — only if credentials look valid
let _supabase: SupabaseClient

if (isSupabaseConfigured && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
} else {
  // Create with known-good demo values — actual API calls will fail gracefully
  // This prevents crashing the UI before users add their credentials
  _supabase = createClient(
    'https://demo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.demo',
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  if (import.meta.env.DEV) {
    console.warn(
      '⚠️  ResumeIQ: Supabase credentials not configured.\n' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
      'Auth, database, and storage features will not work until configured.'
    )
  }
}

export const supabase = _supabase
