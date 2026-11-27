import { readOperatorJson,checkOperatorMutation,validateOperatorCustomer,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getCustomerRepository, getDemoSiteRepository } from "@/lib/repositories";
import type { CustomerAccount } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const body = (await readOperatorJson(request)) as CustomerAccount & {
      initialPassword?: string;
    };
    if (body.id !== id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    if(body.initialPassword)return NextResponse.json({error:"アカウント作成には専用の契約処理を使用してください。"},{status:409});
    const saved = await getCustomerRepository().upsert(validateOperatorCustomer(body));

    return NextResponse.json(saved);
  } catch (error) {
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[PATCH /api/customers/[id]]");
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    checkOperatorMutation(request);
    const sites=await getDemoSiteRepository().list();
    if(sites.some(site=>site.customerId===id))return NextResponse.json({error:"店舗に紐付く顧客は削除できません。契約・請求記録を保全し、公開停止を使用してください。"},{status:409});
    await getCustomerRepository().delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if(error && typeof error==='object' && 'code' in error && error.code==='23503')return NextResponse.json({error:'契約・請求などの関連記録がある顧客は削除できません。'},{status:409});
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[DELETE /api/customers/[id]]");
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
