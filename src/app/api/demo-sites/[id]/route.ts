import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getDemoSiteRepository } from "@/lib/repositories";
import type { DemoSite } from "@/types/demo";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const site = await getDemoSiteRepository().findById(id);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error("[GET /api/demo-sites/[id]]", error);
    return NextResponse.json({ error: "Failed to load demo site" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const site = (await request.json()) as DemoSite;
    if (site.id !== id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }
    const updated = await getDemoSiteRepository().update(site);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/demo-sites/[id]]", error);
    return NextResponse.json({ error: "Failed to update demo site" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    await getDemoSiteRepository().delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/demo-sites/[id]]", error);
    return NextResponse.json({ error: "Failed to delete demo site" }, { status: 500 });
  }
}
