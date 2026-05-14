import { createClient } from '@supabase/supabase-js';

const legacySupabaseUrl = import.meta.env.VITE_LEGACY_SUPABASE_URL;
const legacySupabaseAnonKey = import.meta.env.VITE_LEGACY_SUPABASE_ANON_KEY;

if (!legacySupabaseUrl || !legacySupabaseAnonKey) {
  console.error("HUOMIO: Legacy Supabasen ympäristömuuttujat puuttuvat .env-tiedostosta!");
}

// Luodaan oma erillinen yhteys vanhaan kantaan
export const legacySupabase = createClient(legacySupabaseUrl, legacySupabaseAnonKey);