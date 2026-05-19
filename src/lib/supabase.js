import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function loadRsvps() {
  const { data, error } = await supabase
    .from('rsvps')
    .select('id, name, attending, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function saveRsvp({ name, attending }) {
  const { error } = await supabase
    .from('rsvps')
    .insert([{ name, attending }])
  if (error) throw error
  return loadRsvps()
}
