import "server-only";
import {apiKeyFetch, apiKeyKind} from "@/lib/supabase/api-key-fetch";
import {boundedServerFetch} from "@/lib/supabase/server-fetch";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getAdminCredentials(): { url: string; serviceRoleKey: string } {
  if (typeof window !== "undefined") {
    throw new Error("Supabase admin client must not be called in the browser");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  apiKeyKind(serviceRoleKey,"service_role");
  return { url, serviceRoleKey };
}

/**
 * PostgREST (DB) 用 service_role クライアント。
 * - リクエストごとに新規インスタンス（シングルトン禁止）
 * - legacy Bearer固定を維持。新形式は最終fetchでapikeyのみ送信。
 */
export function createAdminDbClient(): SupabaseClient {
  const { url, serviceRoleKey } = getAdminCredentials();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch:apiKeyFetch(serviceRoleKey,"service_role",boundedServerFetch),
      headers: {
        ...(apiKeyKind(serviceRoleKey,"service_role")==="legacy"?{Authorization: `Bearer ${serviceRoleKey}`} : {}),
        apikey: serviceRoleKey,
      },
    },
  });
}

/**
 * Auth Admin API 専用（createUser 等）。
 * DB クライアントと分離し、auth 処理が REST ヘッダーを汚染しないようにする。
 */
export function createAdminAuthClient(): SupabaseClient {
  const { url, serviceRoleKey } = getAdminCredentials();

  return createClient(url, serviceRoleKey, {
    global:{fetch:apiKeyFetch(serviceRoleKey,"service_role",boundedServerFetch)},
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** @deprecated createAdminDbClient を使用してください */
export function createAdminClient(): SupabaseClient {
  return createAdminDbClient();
}
