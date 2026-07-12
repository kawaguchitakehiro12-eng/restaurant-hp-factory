import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { ensureCustomerAuthUser } from "@/lib/auth/supabase-auth";
import { getCustomerRepository } from "@/lib/repositories";
import type { CustomerAccount } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const body = (await request.json()) as CustomerAccount & {
      initialPassword?: string;
    };
    if (body.id !== id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    const saved = await getCustomerRepository().upsert(body);

    if (body.initialPassword && body.contactEmail) {
      const authUserId = await ensureCustomerAuthUser(
        body.contactEmail,
        body.initialPassword
      );
      if (authUserId) {
        await getCustomerRepository().linkAuthUser(id, authUserId);
      }
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error("[PATCH /api/customers/[id]]", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    await getCustomerRepository().delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/customers/[id]]", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
