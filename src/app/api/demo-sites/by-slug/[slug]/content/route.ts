import {saveFailure} from '@/lib/api/save-failure';
import { readOperatorJson,validateOperatorContent,OperatorInputError } from "@/lib/api/operator-input";
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { mergeContentPatch } from "@/lib/repositories/supabase/mappers";
import { ensureDemoContent } from "@/types/demo-content";
import { requireDemoSiteEditorApi } from "@/lib/auth/operator";
import { getDemoSiteRepository } from "@/lib/repositories";
import type { DemoSiteContent } from "@/types/demo-content";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const denied = await requireDemoSiteEditorApi(slug);
  if (denied) return denied;
  const blocked = requireSupabaseAdmin();
  if (blocked) return blocked;

  try {
    const body=await readOperatorJson(request);
    if(Object.keys(body).some(k=>!["patch","revision"].includes(k))||!body.patch||typeof body.patch!=="object"||!(body.revision===null||typeof body.revision==="string"))throw new OperatorInputError("更新状態を確認できません。再読み込みしてください。");
    const patch=body.patch as Partial<DemoSiteContent>;
    const current=await getDemoSiteRepository().findBySlug(slug);
    if(!current)return NextResponse.json({error:"Not found"},{status:404});
    if((current.contentRevision??null)!==body.revision)return NextResponse.json({error:"別の画面で更新されています。再読み込みしてください。"},{status:409});
    const clean=validateOperatorContent(mergeContentPatch(ensureDemoContent(current.content),patch));
    const updated = await getDemoSiteRepository().update({...current,content:clean,contentRevision:body.revision as string|null});
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if(error&&typeof error==="object"&&"code" in error&&error.code==="PT409")return NextResponse.json({error:"別の画面で更新されています。再読み込みしてください。"},{status:409});
    if(error instanceof OperatorInputError)return NextResponse.json({error:error.message},{status:error.status});

    return NextResponse.json(saveFailure(error,'operator-content'),{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
