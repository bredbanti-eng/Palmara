import { createClient } from "@supabase/supabase-js";

// Lazily created so a missing env var fails at request time with a clear
// error, rather than crashing the entire Next.js build.
let client = null;

export function getSupabase() {
  if (!client) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
      );
    }
    client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return client;
}
