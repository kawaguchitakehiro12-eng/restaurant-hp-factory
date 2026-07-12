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

  const message = createError?.message ?? "";
  if (!message.toLowerCase().includes("already")) {
    throw createError ?? new Error("Failed to create auth user");
  }

  const { data: listData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = listData.users.find(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );
  if (!existing) return null;

  await admin.auth.admin.updateUserById(existing.id, {
    password,
    user_metadata: { role: "customer" },
  });

  return existing.id;
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
