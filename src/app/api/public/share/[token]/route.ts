import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { loadSharedDemoPage } from "@/lib/share/load-shared-demo";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { token } = await context.params;
  try {
    const data = await loadSharedDemoPage(token);

    if (data.status === "expired") {
      return NextResponse.json({ status: "expired" });
    }
    if (data.status === "not_found") {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "found",
      prospectLabel: data.prospectLabel,
      resolution: {
        status: "found",
        store: data.store,
        sampleFlags: data.sampleFlags,
        heroFit: data.heroFit,
        heroObjectPosition: data.heroObjectPosition,
        demoSite: data.demoSite,
      },
    });
  } catch (error) {
    console.error("[GET /api/public/share/[token]]", error);
    return NextResponse.json({ error: "Failed to load shared site" }, { status: 500 });
  }
}
