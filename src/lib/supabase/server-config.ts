import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Server-only presence check. Never return or serialize a credential value. */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
