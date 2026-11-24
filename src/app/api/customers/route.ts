import { readOperatorJson,validateOperatorCustomer,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getCustomerRepository } from "@/lib/repositories";

export async function GET() {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const customers = await getCustomerRepository().list();
    return NextResponse.json(customers);
  } catch (error) {
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[GET /api/customers]");
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const customer = validateOperatorCustomer(await readOperatorJson(request));
    const saved = await getCustomerRepository().upsert(customer);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[POST /api/customers]");
    return NextResponse.json({ error: "Failed to save customer" }, { status: 500 });
  }
}
