import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";

export async function GET(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("demoSiteIds");
  if (!idsParam) {
    return NextResponse.json({ summaries: {} });
  }

  const demoSiteIds = [...new Set(idsParam.split(",").filter(Boolean))];
  if (demoSiteIds.length>100 || demoSiteIds.some(id=>!/^[A-Za-z0-9_-]{1,128}$/.test(id))) return NextResponse.json({error:"店舗IDは100件以内で指定してください。"},{status:400});
  try {
    const summaries = await getDemoShareRepository().getSummariesForSites(demoSiteIds);
    return NextResponse.json({ summaries });
  } catch {
    console.error("[GET /api/admin/demo-shares/summary]");
    return NextResponse.json({ error: "Failed to load summaries" }, { status: 500 });
  }
}
