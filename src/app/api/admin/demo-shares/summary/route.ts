import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";

export async function GET(request: Request) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("demoSiteIds");
  if (!idsParam) {
    return NextResponse.json({ summaries: {} });
  }

  const demoSiteIds = idsParam.split(",").filter(Boolean);
  try {
    const summaries = await getDemoShareRepository().getSummariesForSites(demoSiteIds);
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("[GET /api/admin/demo-shares/summary]", error);
    return NextResponse.json({ error: "Failed to load summaries" }, { status: 500 });
  }
}
