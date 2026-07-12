import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getDemoSiteRepository } from "@/lib/repositories";
import type { DemoSiteContent } from "@/types/demo-content";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { slug } = await context.params;
  try {
    const patch = (await request.json()) as Partial<DemoSiteContent>;
    const updated = await getDemoSiteRepository().updateContent(slug, patch);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/demo-sites/by-slug/[slug]/content]", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
