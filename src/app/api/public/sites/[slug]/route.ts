import { NextResponse } from "next/server";
import { requireSupabaseAdmin, seedDemoSitesIfNeeded } from "@/lib/api/supabase-route";
import { getDemoSiteRepository } from "@/lib/repositories";
import {
  isDemoSitePubliclyVisible,
  resolvePublicStoreBySlug,
} from "@/lib/stores/demo-to-store";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { slug } = await context.params;
  try {
    await seedDemoSitesIfNeeded();
    const site = await getDemoSiteRepository().findBySlug(slug);
    if (!site) {
      return NextResponse.json({ status: "not_found" });
    }

    const resolution = resolvePublicStoreBySlug(slug, [site]);
    return NextResponse.json({
      resolution,
      visible: isDemoSitePubliclyVisible(site),
    });
  } catch (error) {
    console.error("[GET /api/public/sites/[slug]]", error);
    return NextResponse.json({ error: "Failed to resolve public site" }, { status: 500 });
  }
}
