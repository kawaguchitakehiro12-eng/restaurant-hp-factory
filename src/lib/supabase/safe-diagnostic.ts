/** Fixed diagnostic codes only: never serialize messages, keys, URLs or provider payloads. */
export function safeSupabaseDiagnostic(error: unknown): string {
  if (!error || typeof error !== "object") return "UPSTREAM_UNKNOWN";
  const value = error as { code?: unknown; message?: unknown };
  const allowed = ["PGRST002", "PGRST200", "PGRST202", "PGRST205", "PGRST301", "PGRST302", "PGRST303", "42501", "42P01", "42703"];
  if (typeof value.code === "string" && allowed.includes(value.code)) return value.code;
  if (value.message === "Preview Supabase destination rejected") return "PREVIEW_BASE_REJECTED";
  if (value.message === "Preview Supabase request rejected") return "PREVIEW_REQUEST_REJECTED";
  if (value.message === "Invalid Supabase API key configuration") return "KEY_FORMAT_REJECTED";
  if (value.message === "Supabase admin credentials are not configured") return "SERVER_CONFIG_MISSING";
  return "UPSTREAM_UNKNOWN";
}
