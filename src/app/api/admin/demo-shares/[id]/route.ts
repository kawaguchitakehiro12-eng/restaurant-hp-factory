import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";
import type { ShareExpiryOption } from "@/types/demo-share";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const body = (await request.json()) as {
      action: "revoke" | "regenerate" | "extend";
      expiryOption?: ShareExpiryOption;
      demoSiteId?: string;
    };

    const repo = getDemoShareRepository();

    if (body.action === "revoke") {
      await repo.revoke(id);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "extend") {
      const share = await repo.extend(id, body.expiryOption ?? "30d");
      return NextResponse.json({ share });
    }

    if (body.action === "regenerate") {
      const existing = await repo.findById(id);
      const demoSiteId = body.demoSiteId ?? existing?.demoSiteId;
      if (!demoSiteId) {
        return NextResponse.json({ error: "demoSiteId required" }, { status: 400 });
      }
      const share = await repo.regenerate(demoSiteId, body.expiryOption ?? "30d");
      return NextResponse.json({ share });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[PATCH /api/admin/demo-shares/[id]]", error);
    return NextResponse.json({ error: "Failed to update share" }, { status: 500 });
  }
}
