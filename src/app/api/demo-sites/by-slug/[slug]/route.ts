import { NextResponse } from "next/server";
import { requireSupabaseAdmin, seedDemoSitesIfNeeded } from "@/lib/api/supabase-route";
import { getDemoSiteRepository } from "@/lib/repositories";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { slug } = await context.params;
  try {
    await seedDemoSitesIfNeeded();
    const site = await getDemoSiteRepository().findBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error("[GET /api/demo-sites/by-slug/[slug]]", error);
    return NextResponse.json({ error: "Failed to load demo site" }, { status: 500 });
  }
}
