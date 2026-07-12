import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";
import type { ShareExpiryOption } from "@/types/demo-share";

export async function GET(request: Request) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const demoSiteId = searchParams.get("demoSiteId");
  if (!demoSiteId) {
    return NextResponse.json({ error: "demoSiteId is required" }, { status: 400 });
  }

  try {
    const repo = getDemoShareRepository();
    const share = await repo.findActiveByDemoSiteId(demoSiteId);
    return NextResponse.json({ share });
  } catch (error) {
    console.error("[GET /api/admin/demo-shares]", error);
    return NextResponse.json({ error: "Failed to load share" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as {
      demoSiteId: string;
      expiryOption: ShareExpiryOption;
    };
    if (!body.demoSiteId) {
      return NextResponse.json({ error: "demoSiteId is required" }, { status: 400 });
    }

    const share = await getDemoShareRepository().createOrReuse(
      body.demoSiteId,
      body.expiryOption ?? "30d"
    );
    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/demo-shares]", error);
    return NextResponse.json({ error: "Failed to create share" }, { status: 500 });
  }
}
