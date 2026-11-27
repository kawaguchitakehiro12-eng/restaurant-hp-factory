import {saveFailure} from '@/lib/api/save-failure';
import {mediaDevelopmentEnabled,prepareDevelopmentContent,runDevelopmentMediaSync} from '@/lib/media/development-service';
import {assertCustomerMedia} from '@/lib/media/customer-ownership';
import type {DemoSiteContent} from '@/types/demo-content';
import type { DemoSite } from "@/types/demo";
import { readOperatorJson,checkOperatorMutation,validateOperatorSite,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { requireOperatorApi } from "@/lib/auth/operator";
import { getDemoSiteRepository } from "@/lib/repositories";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const site = await getDemoSiteRepository().findById(id);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch {
    console.error("[GET /api/demo-sites/[id]]");
    return NextResponse.json({ error: "Failed to load demo site" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const site = validateOperatorSite(await readOperatorJson(request));
    if (site.id !== id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }
    const current=await getDemoSiteRepository().findById(id);
    if(!current)return NextResponse.json({error:"Not found"},{status:404});
    if(["contracted","suspended"].includes(current.siteContractStatus)&&site.salesStatus!==current.salesStatus)return NextResponse.json({error:"契約済み店舗の営業状態は変更できません。対応履歴は営業メモに記録してください。"},{status:409});
    const contractFields:(keyof DemoSite)[]=["storeId","createdAt","customerId","contractStartDate","minimumTermEndDate","monthlyFee","domainStatus","loginEmail","nextBillingDate","billingStatus","planName","paymentMethod","publishedAt"];
    if(site.initialPassword || contractFields.some(key=>site[key]!==current[key]) || (site.siteContractStatus!==current.siteContractStatus && !(current.siteContractStatus==="demo" && site.siteContractStatus==="lost")) || site.publishStatus!==current.publishStatus) {
      return NextResponse.json({error:"契約・公開状態の変更には専用の契約処理を使用してください。"},{status:409});
    }
    if(mediaDevelopmentEnabled()&&site.content){site.content=await prepareDevelopmentContent(site.content,'operator',site.id) as DemoSiteContent;await assertCustomerMedia(site.content,site.id);}const updated = await getDemoSiteRepository().update(site);if(mediaDevelopmentEnabled())await runDevelopmentMediaSync();
    return NextResponse.json(updated);
  } catch (error) {
    if(error && typeof error==='object' && 'code' in error && ['PT409','23505'].includes(String(error.code)))return NextResponse.json({error:'別の画面で更新されたか、URLが重複しています。編集内容を控えて再読み込みしてください。'},{status:409});
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});

    return NextResponse.json(saveFailure(error,'operator-site'),{status:503,headers:{'Cache-Control':'no-store'}});
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    checkOperatorMutation(request);
    await getDemoSiteRepository().delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if(error && typeof error==='object' && 'code' in error && error.code==='23503')return NextResponse.json({error:'契約・請求などの関連記録がある店舗は削除できません。公開停止と記録の保管を行ってください。'},{status:409});
    if(error && typeof error==='object' && 'code' in error && ['PT409','23505'].includes(String(error.code)))return NextResponse.json({error:'別の画面で更新されたか、URLが重複しています。編集内容を控えて再読み込みしてください。'},{status:409});
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});
    console.error("[DELETE /api/demo-sites/[id]]");
    return NextResponse.json({ error: "Failed to delete demo site" }, { status: 500 });
  }
}
