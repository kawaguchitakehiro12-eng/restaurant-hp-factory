import {minimumTermEndDate as fixedTermEndDate} from "@/lib/admin/minimum-term";
import {resolveMinimumTermMonths} from "@/lib/admin/minimum-term";
import {readOperatorJson,OperatorInputError} from "@/lib/api/operator-input";
import {NextResponse} from "next/server";
import {isSameOriginRequest} from "@/lib/auth/request-origin";
import {getOperatorAuth} from "@/lib/auth/operator";
import {createAdminDbClient,createAdminAuthClient} from "@/lib/supabase/admin";
import {getDemoSiteRepository,getCustomerRepository} from "@/lib/repositories";
import {isValidEmail,isValidSlug,normalizeSlug,addCalendarMonths} from "@/lib/admin/form-utils";
import {isReservedSlug} from "@/lib/stores/demo-site-registry";
import {getStoreBySlug} from "@/data/stores";
import {createHash} from "node:crypto";
import {ensureDemoContent} from "@/types/demo-content";
import {parseCustomerContent,CustomerInputError} from "@/lib/customer/validation";

const headers={"Cache-Control":"private, no-store"};
const reply=(error:string,status:number,retryable=false)=>NextResponse.json({error,retryable},{status,headers});
type Operation={id:string;site_id:string;operator_id:string;state:string;auth_user_id:string|null;request_hash:string};
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
 let operationId:string|undefined,createdAuthId:string|undefined;
 try {
  if(!isSameOriginRequest(request))return reply("リクエスト元を確認できません。",403);
  const auth=await getOperatorAuth();if(auth.status!=="ok")return reply("運営者ログインが必要です。",auth.status==="unavailable"?503:auth.status==="unauthenticated"?401:403);
  if(process.env.NODE_ENV==="production"&&process.env.OPERATOR_ATOMIC_WRITES_ENABLED!=="true")return reply("承認済みDB設定の確認が必要です。",503);
  if(!request.headers.get("content-type")?.startsWith("application/json"))return reply("JSON形式で送信してください。",415);
  const body=await readOperatorJson(request,20000);
  if(!body||typeof body!=="object"||Array.isArray(body))return reply("入力形式を確認してください。",400,true);
  const {id}=await params;
  if(typeof body.requestId!=="string"||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.requestId))return reply("操作IDを確認してください。",400,true);
  const email=typeof body.loginEmail==="string"?body.loginEmail.trim().toLowerCase():"";
  const password=typeof body.initialPassword==="string"?body.initialPassword:"";
  const slug=typeof body.storeSlug==="string"?normalizeSlug(body.storeSlug):"";
  const date=typeof body.contractStartDate==="string"?body.contractStartDate:"";
  if(!isValidEmail(email)||email.length>254||password.length<12||password.length>128||!isValidSlug(slug)||isReservedSlug(slug)||getStoreBySlug(slug)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||typeof body.monthlyFee!=="number"||!Number.isSafeInteger(body.monthlyFee)||body.monthlyFee<0||body.monthlyFee>1000000||!["unset","planned","configured"].includes(String(body.domainStatus)))return reply("メール、12文字以上のパスワード、公開URL、契約日、料金を確認してください。",400,true);
  let termMonths:number;try{termMonths=resolveMinimumTermMonths(body.minimumTermMonths);}catch{return reply("最低利用期間は契約開始月を含む6か月です。",400,true);}
  const db=createAdminDbClient();
  const requestValues=[body.requestId,id,email,password,slug,date,body.monthlyFee,body.domainStatus];
  if(body.minimumTermMonths!==undefined)requestValues.push(termMonths);
  const requestHash=createHash("sha256").update(JSON.stringify(requestValues)).digest("hex");
  const {data:existing,error:lookupError}=await db.from("contract_operations").select("id,site_id,operator_id,state,auth_user_id,request_hash").eq("id",body.requestId).maybeSingle();
  if(lookupError)return reply("契約機能のDB設定を確認してください。",503);
  if(existing){const op=existing as Operation;if(op.site_id!==id||op.operator_id!==auth.user.id)return reply("この操作は確認できません。",409);if(op.request_hash!==requestHash)return reply("前回の入力と異なります。重ねて実行せず処理結果を確認してください。",409);if(op.state==="complete"){const site=await getDemoSiteRepository().findById(id);const customer=site?.customerId?await getCustomerRepository().findById(site.customerId):null;return NextResponse.json({site,customer},{headers});}return reply("前の処理結果の確認が必要です。重ねて実行せず運営記録を確認してください。",409);}
  const target=await getDemoSiteRepository().findById(id);
  if(!target)return reply("案件が見つかりません。",404);
  if(target.siteContractStatus!=="demo"||target.customerId||target.publishStatus==="suspended")return reply("この案件は新規契約に切り替えられる状態ではありません。",409);
  const source=ensureDemoContent(target.content);
  try{parseCustomerContent({basicInfo:source.basicInfo,photos:source.photos,menus:source.menus,topics:source.topics});}catch(error){return reply(error instanceof CustomerInputError?error.message:"店舗情報を確認してください。",400,true);}
  if(!source.basicInfo.address.trim()||!source.basicInfo.phone.trim()||!(source.basicInfo.businessHours.trim()||source.basicInfo.weekdayHours.trim())||!source.photos.hero.trim()||!source.menus.some(m=>m.visible&&m.name.trim()))return reply("公開前に実際の住所・電話・営業時間・メイン写真・メニューを登録してください。",400,true);
  const taken=await getDemoSiteRepository().findBySlug(slug);if(taken&&taken.id!==id)return reply("このURLは使用されています。",409,true);
  const {error:claimError}=await db.from("contract_operations").insert({id:body.requestId,site_id:id,operator_id:auth.user.id,state:"preparing",request_hash:requestHash});
  if(claimError)return reply("同じ操作が実行中です。結果を確認してください。",409);
  operationId=body.requestId;
  const admin=createAdminAuthClient();
  const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{role:"customer",provisioning_operation:operationId}});
  if(createError||!created.user){const knownFailure=Boolean(createError?.status&&createError.status>=400&&createError.status<500);await db.from("contract_operations").update({state:knownFailure?"failed":"needs_review"}).eq("id",operationId);return reply("アカウントを作成できませんでした。既存のメールアドレスは変更していません。別のメールまたは運営記録を確認してください。",knownFailure?409:503,knownFailure);}
  createdAuthId=created.user.id;
  const {error:recordError}=await db.from("contract_operations").update({state:"auth_created",auth_user_id:createdAuthId}).eq("id",operationId);
  if(recordError)return reply("アカウント準備後の状態確認が必要です。重ねて実行せず運営へご確認ください。",503);
  const customer={id:"cust-"+crypto.randomUUID(),name:target.prospectName,contactEmail:email,contactPhone:target.phone,contactPersonName:target.contactPersonName};
  const contract={storeSlug:slug,contractStartDate:date,minimumTermEndDate:fixedTermEndDate(date),nextBillingDate:addCalendarMonths(date,1),monthlyFee:body.monthlyFee,domainStatus:body.domainStatus};
  const {error:completeError}=await db.rpc("complete_site_contract_v2",{p_operation_id:operationId,p_operator_id:auth.user.id,p_customer:customer,p_contract:contract,p_expected_updated_at:target.contentRevision??null});
  if(completeError){
   // 明確なDBロールバック時だけ、新規作成したアカウントを片付ける。
   // 通信断など結果不明の場合、成立済みの契約を壊す削除はしない。
   if(["23505","42501","22023","PT409","40001"].includes(completeError.code)){
    const {error:cleanupError}=await admin.auth.admin.deleteUser(createdAuthId);
    await db.from("contract_operations").update({state:cleanupError?"needs_review":"failed"}).eq("id",operationId);
    return reply(cleanupError?"後片付けの確認が必要です。運営記録を確認してください。":"契約は保存されていません。URLや顧客メールの重複を確認してください。",409,!cleanupError);
   }
   await db.from("contract_operations").update({state:"needs_review"}).eq("id",operationId).neq("state","complete");
   return reply("処理結果を確認できません。重ねて実行せず運営記録を確認してください。",503);
  }
  const site=await getDemoSiteRepository().findById(id);
  const savedCustomer=site?.customerId?await getCustomerRepository().findById(site.customerId):null;
  return NextResponse.json({site,customer:savedCustomer},{headers});
 }catch(error){
  if(error instanceof OperatorInputError)return reply(error.message,error.status);
  // 秘密情報やリクエスト本文をログに出さない。再試行は同じ操作IDで行う。
  return reply(operationId||createdAuthId?"処理結果の確認が必要です。重ねて実行せず運営記録を確認してください。":"接続できません。設定と通信状況を確認してください。",503);
 }
}
