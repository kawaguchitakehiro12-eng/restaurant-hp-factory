import {mediaDevelopmentEnabled,runDevelopmentMediaSync} from '@/lib/media/development-service';
import { readOperatorJson,validateShareInput,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";
import type { ShareExpiryOption } from "@/types/demo-share";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const body = (await readOperatorJson(request)) as {
      action: "revoke" | "regenerate" | "extend";
      expiryOption?: ShareExpiryOption;
      demoSiteId?: string;
    };

    validateShareInput(body as unknown as Record<string,unknown>);
    const repo = getDemoShareRepository();

    if (body.action === "revoke") {
      await repo.revoke(id);if(mediaDevelopmentEnabled())await runDevelopmentMediaSync();
      return NextResponse.json({ ok: true });
    }

    if (body.action === "extend") {
      const share = await repo.extend(id, body.expiryOption ?? "7d");
      if(mediaDevelopmentEnabled())await runDevelopmentMediaSync();return NextResponse.json({ share });
    }

    if (body.action === "regenerate") {
      const existing = await repo.findById(id);
      if(!existing || (body.demoSiteId && body.demoSiteId!==existing.demoSiteId))return NextResponse.json({error:"Share mismatch"},{status:409});
      const demoSiteId = existing.demoSiteId;
      if (!demoSiteId) {
        return NextResponse.json({ error: "demoSiteId required" }, { status: 400 });
      }
      const share = await repo.regenerate(demoSiteId, body.expiryOption ?? "7d");
      if(mediaDevelopmentEnabled())await runDevelopmentMediaSync();return NextResponse.json({ share });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[PATCH /api/admin/demo-shares/[id]]");
    return NextResponse.json({ error: "Failed to update share" }, { status: 500 });
  }
}
