import { createClient } from '@supabase/supabase-js'

// Estas llaves son provistas por el emulador de Supabase Local
// IMPORTANTE: En producción (supabase.com) se reemplazan por tus variables de entorno (.env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
