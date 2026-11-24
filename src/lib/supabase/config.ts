import { assertPreviewBaseUrl } from "./preview-boundary";

/** Returns true when Supabase is configured (client + server). */
export function isSupabaseConfigured(): boolean {
  assertPreviewBaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
