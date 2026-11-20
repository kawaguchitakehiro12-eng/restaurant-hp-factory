import { readOperatorJson,validateOperatorSite,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getDemoSiteRepository } from "@/lib/repositories";

export async function GET() {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const sites = await getDemoSiteRepository().list();
    return NextResponse.json(sites);
  } catch (error) {
    if(error&&typeof error==="object"&&"code" in error&&["PT409","23505"].includes(String(error.code)))return NextResponse.json({error:"別の画面で更新されたか、URLが重複しています。編集内容を控えて再読み込みしてください。"},{status:409});
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[GET /api/demo-sites]");
    return NextResponse.json({ error: "Failed to load demo sites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const site = validateOperatorSite(await readOperatorJson(request));
    if(site.siteContractStatus!=="demo" || site.publishStatus!=="draft" || site.customerId || site.initialPassword) {
      return NextResponse.json({error:"新規デモ以外の作成には専用の契約処理を使用してください。"},{status:400});
    }
    const created = await getDemoSiteRepository().create(site);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if(error&&typeof error==="object"&&"code" in error&&["PT409","23505"].includes(String(error.code)))return NextResponse.json({error:"別の画面で更新されたか、URLが重複しています。編集内容を控えて再読み込みしてください。"},{status:409});
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[POST /api/demo-sites]");
    return NextResponse.json({ error: "Failed to create demo site" }, { status: 500 });
  }
}
