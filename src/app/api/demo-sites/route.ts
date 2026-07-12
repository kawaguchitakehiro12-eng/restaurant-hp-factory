import { NextResponse } from "next/server";
import { requireSupabaseAdmin, seedDemoSitesIfNeeded } from "@/lib/api/supabase-route";
import { getDemoSiteRepository } from "@/lib/repositories";
import type { DemoSite } from "@/types/demo";

export async function GET() {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    await seedDemoSitesIfNeeded();
    const sites = await getDemoSiteRepository().list();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("[GET /api/demo-sites]", error);
    return NextResponse.json({ error: "Failed to load demo sites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const site = (await request.json()) as DemoSite;
    const created = await getDemoSiteRepository().create(site);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/demo-sites]", error);
    return NextResponse.json({ error: "Failed to create demo site" }, { status: 500 });
  }
}
