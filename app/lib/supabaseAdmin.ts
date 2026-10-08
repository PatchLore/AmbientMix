import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily created so that importing this module (e.g. during `next build`
// page-data collection) never throws when environment variables are absent.
// Callers receive null when the service-role key is not configured and must
// handle that case instead of crashing the build.
let cachedAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // NOTE: never expose this to client

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (!cachedAdmin) {
    cachedAdmin = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return cachedAdmin;
}

