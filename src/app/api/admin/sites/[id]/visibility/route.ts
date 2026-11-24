import { NextResponse } from "next/server";
import { requireOperatorApi } from "@/lib/auth/operator";
import { readOperatorJson,OperatorInputError } from "@/lib/api/operator-input";
import { getDemoSiteRepository } from "@/lib/repositories";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { parseCustomerContent } from "@/lib/customer/validation";
import { ensureDemoContent } from "@/types/demo-content";
const headers={"Cache-Control":"private, no-store"};
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const denied=await requireOperatorApi();if(denied)return denied;
 try{
  const body=await readOperatorJson(request,2048);
  if(Object.keys(body).some(k=>!["action","expectedPublishStatus"].includes(k))||!["suspend","resume"].includes(String(body.action))||!["draft","published","suspended"].includes(String(body.expectedPublishStatus)))throw new OperatorInputError("操作内容を確認してください。");
  const {id}=await params,repo=getDemoSiteRepository(),site=await repo.findById(id);
  if(!site)return NextResponse.json({error:"店舗が見つかりません。"},{status:404,headers});
  if(site.publishStatus!==body.expectedPublishStatus||!["demo","contracted"].includes(site.siteContractStatus))return NextResponse.json({error:"店舗状態が変わりました。一覧を再読み込みしてください。"},{status:409,headers});
  const status=body.action==="suspend"?"suspended":site.siteContractStatus==="demo"?"draft":"published";
  if(status==="published"){
   const c=ensureDemoContent(site.content);
   try{parseCustomerContent({basicInfo:c.basicInfo,photos:c.photos,menus:c.menus,topics:c.topics});}catch{throw new OperatorInputError("公開する店舗情報を確認してください。");}
   if(!site.customerId||!c.basicInfo.address.trim()||!c.basicInfo.phone.trim()||!(c.basicInfo.businessHours.trim()||c.basicInfo.weekdayHours.trim())||!c.photos.hero||!c.menus.some(m=>m.visible&&m.name.trim()))throw new OperatorInputError("公開前に住所・店舗電話・営業時間・写真・メニューを登録してください。");
  }
  const {error}=await createAdminDbClient().rpc('set_site_visibility_v1',{p_id:id,p_action:body.action,p_expected_publish_status:site.publishStatus,p_expected_contract_status:site.siteContractStatus,p_expected_updated_at:site.contentRevision??null});
  if(error){if(error.code==='PT409')return NextResponse.json({error:'店舗情報が変わりました。再読み込みしてから操作してください。'},{status:409,headers});if(error.code==='22023')throw new OperatorInputError('公開する店舗情報を確認してください。');return NextResponse.json({error:'状態を保存できませんでした。再操作前に一覧を確認してください。'},{status:503,headers});}
  return NextResponse.json({site:await repo.findById(id)},{headers});
 }catch(error){return NextResponse.json({error:error instanceof OperatorInputError?error.message:"現在接続できません。再操作前に状態を確認してください。"},{status:error instanceof OperatorInputError?error.status:503,headers});}
}
