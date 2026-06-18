import { createClient } from "@supabase/supabase-js";

// Load Supabase project URL and anon public key from Vite environment variables.
// Includes placeholders to prevent app crashes if environment variables are not set.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
