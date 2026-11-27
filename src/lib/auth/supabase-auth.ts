import { createAdminAuthClient } from "@/lib/supabase/admin";

/** Create or update Supabase Auth user for a customer on publish. */
export async function ensureCustomerAuthUser(
  email: string,
  password: string
): Promise<string | null> {
  const admin = createAdminAuthClient();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { role: "customer" },
  });

  if (!createError && created.user) {
    return created.user.id;
  }

  // メール一致だけで既存ユーザーを更新・紐付けしない。
  // 運営者や別顧客のパスワード変更を防ぐため、重複時は失敗させる。
  throw createError ?? new Error("Customer auth user was not created");
}

/** Create operator auth user (for manual setup / scripts). */
export async function createOperatorAuthUser(
  email: string,
  password: string
): Promise<string> {
  const admin = createAdminAuthClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    app_metadata: { role: "operator" },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Operator user was not created");
  return data.user.id;
}
