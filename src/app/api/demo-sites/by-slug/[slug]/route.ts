import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireDemoSiteEditorApi } from "@/lib/auth/operator";
import { getDemoSiteRepository } from "@/lib/repositories";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const denied = await requireDemoSiteEditorApi(slug);
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const site = await getDemoSiteRepository().findBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch {
    console.error("[GET /api/demo-sites/by-slug/[slug]]");
    return NextResponse.json({ error: "Failed to load demo site" }, { status: 500 });
  }
}
