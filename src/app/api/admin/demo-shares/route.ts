import { readOperatorJson,validateShareInput,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";
import type { ShareExpiryOption } from "@/types/demo-share";

export async function GET(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const demoSiteId = searchParams.get("demoSiteId");
  if (!demoSiteId) {
    return NextResponse.json({ error: "demoSiteId is required" }, { status: 400 });
  }

  try {
    const repo = getDemoShareRepository();
    const share = await repo.findLatestByDemoSiteId(demoSiteId);
    return NextResponse.json({ share });
  } catch (error) {
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[GET /api/admin/demo-shares]");
    return NextResponse.json({ error: "Failed to load share" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const body = (await readOperatorJson(request)) as {
      demoSiteId: string;
      expiryOption: ShareExpiryOption;
    };
    if (!body.demoSiteId) {
      return NextResponse.json({ error: "demoSiteId is required" }, { status: 400 });
    }

    validateShareInput(body as unknown as Record<string,unknown>);
    const share = await getDemoShareRepository().createOrReuse(
      body.demoSiteId,
      body.expiryOption ?? "30d"
    );
    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[POST /api/admin/demo-shares]");
    return NextResponse.json({ error: "Failed to create share" }, { status: 500 });
  }
}
