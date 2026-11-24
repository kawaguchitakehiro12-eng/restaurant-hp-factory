import type { User } from "@supabase/supabase-js";

export const OPERATOR_ROLE = "operator";

/** user_metadata は本人が書き換えられるため、権限判定には app_metadata のみを使う */
export function isOperatorUser(user: Pick<User, "app_metadata"> | null | undefined): boolean {
  return user?.app_metadata?.role === OPERATOR_ROLE;
}

/** ログイン後の遷移先。オープンリダイレクトを防ぐため運営者が使う /admin・/dashboard 配下のみ許可する */
export function sanitizeAdminNextPath(raw: string | null | undefined): string {
  if (!raw || raw.includes("\\")) return "/admin";
  const isAdminPath =
    raw === "/admin" || raw.startsWith("/admin/") || raw.startsWith("/admin?") ||
    raw === "/dashboard" || raw.startsWith("/dashboard/") || raw.startsWith("/dashboard?");
  return isAdminPath ? raw : "/admin";
}
