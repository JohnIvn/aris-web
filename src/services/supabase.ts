import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ggsxkogutptvxcwoojoy.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc3hrb2d1dHB0dnhjd29vam95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDUzMDAsImV4cCI6MjEwMTY4MTMwMH0.EdRolIZ4tBxSQ5_CuAUV9CqXNGTvUwEzafhoY2LiNRY";

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  DEFAULT_SUPABASE_URL;
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
