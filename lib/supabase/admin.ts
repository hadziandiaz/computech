import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isServiceRoleConfigured,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/env";

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client. Only import this module from server-only code
 * (route handlers, server actions, payment webhooks). It bypasses RLS, so
 * every caller must perform its own authorization checks first.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  if (!isServiceRoleConfigured) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Server-side payment and webhook operations require it.",
    );
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
