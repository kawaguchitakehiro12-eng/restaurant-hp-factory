import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getCustomerRepository } from "@/lib/repositories";
import type { CustomerAccount } from "@/types/admin";

export async function GET() {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const customers = await getCustomerRepository().list();
    return NextResponse.json(customers);
  } catch (error) {
    console.error("[GET /api/customers]", error);
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const customer = (await request.json()) as CustomerAccount;
    const saved = await getCustomerRepository().upsert(customer);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("[POST /api/customers]", error);
    return NextResponse.json({ error: "Failed to save customer" }, { status: 500 });
  }
}
