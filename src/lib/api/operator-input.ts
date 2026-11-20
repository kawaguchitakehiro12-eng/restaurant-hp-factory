import { isSameOriginRequest } from "@/lib/auth/request-origin";
import { parseCustomerContent, safeUrl } from "@/lib/customer/validation";
import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import type { CustomerAccount } from "@/types/admin";
export class OperatorInputError extends Error { constructor(message:string,public status=400){super(message);} }
export function checkOperatorMutation(request:Request){if(!isSameOriginRequest(request))throw new OperatorInputError("リクエスト元を確認できません。",403);}
export async function readOperatorJson(request:Request,max=4_000_000):Promise<Record<string,unknown>>{
  checkOperatorMutation(request);
  if(!/^application\/json(?:;|$)/i.test(request.headers.get("content-type")??""))throw new OperatorInputError("JSON形式で送信してください。",415);
  if(Number(request.headers.get("content-length"))>max)throw new OperatorInputError("入力が大きすぎます。",413);
  const reader=request.body?.getReader();if(!reader)throw new OperatorInputError("入力がありません。");
  const decoder=new TextDecoder();let size=0,text="";
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new OperatorInputError("入力が大きすぎます。",413);}text+=decoder.decode(value,{stream:true});}}finally{reader.releaseLock();}
  try{return object(JSON.parse(text+decoder.decode()));}catch(error){if(error instanceof OperatorInputError)throw error;throw new OperatorInputError("入力形式を確認してください。");}
}
function object(value:unknown):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))throw new OperatorInputError("入力形式を確認してください。");return value as Record<string,unknown>;}
function text(value:unknown,max=200,optional=false){if(optional&&value===undefined)return;if(typeof value!=="string"||value.length>max||value.includes("\0"))throw new OperatorInputError("文字数・入力形式を確認してください。");}
function one(value:unknown,values:string[]){if(typeof value!=="string"||!values.includes(value))throw new OperatorInputError("選択項目を確認してください。");}
export function validateOperatorContent(value:unknown):DemoSiteContent{
  const c=object(value);if(Object.keys(c).some(k=>!["basicInfo","photos","menus","topics","importedPhotos"].includes(k)))throw new OperatorInputError("変更できない項目です。");
  try{
    const parsed=parseCustomerContent({basicInfo:c.basicInfo,photos:c.photos,menus:c.menus,topics:c.topics});
    if(c.importedPhotos!==undefined){if(!Array.isArray(c.importedPhotos)||c.importedPhotos.length>500)throw Error();for(const value of c.importedPhotos){const photo=object(value);text(photo.id,150);text(photo.alt,1000);safeUrl(photo.url,true);one(photo.source,["tabelog","instagram","official","upload"]);}}
    return {...parsed,...(c.importedPhotos===undefined?{}:{importedPhotos:c.importedPhotos as DemoSiteContent["importedPhotos"]})};
  }catch{throw new OperatorInputError("店舗情報・写真・メニュー・お知らせの入力を確認してください。");}
}
const siteKeys="id storeId storeName storeSlug businessType sourceUrl address templateId templateType prospectName contactPersonName phone email salesStatus salesMemo siteContractStatus publishStatus createdAt lastUpdatedAt isNewlyCreated customerId contractStartDate minimumTermEndDate monthlyFee domainStatus loginEmail initialPassword nextBillingDate billingStatus planName paymentMethod content publishedAt contentRevision".split(" ");
export function validateOperatorSite(value:unknown):DemoSite{
  const s=object(value);if(Object.keys(s).some(k=>!siteKeys.includes(k)))throw new OperatorInputError("変更できない項目です。");
  for(const k of ["id","storeId","storeName","storeSlug","prospectName","contactPersonName","phone","email"])text(s[k]);
  if(!s.id||!s.storeId||!String(s.storeName).trim()||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(s.storeSlug))||String(s.storeSlug).length>80)throw new OperatorInputError("店舗名・URLを確認してください。");
  text(s.sourceUrl,2048);text(s.salesMemo,8000);text(s.address,4000,true);
  one(s.businessType,["japanese","izakaya","cafe","bar","italian","other"]);one(s.templateId,["luxury-japanese","cafe","bar","bal","izakaya-casual"]);one(s.templateType,["luxury-izakaya","cafe","bar","bal","izakaya-casual"]);
  one(s.salesStatus,["not_approached","proposal_scheduled","proposed","considering","contracted","lost"]);one(s.siteContractStatus,["demo","contracted","lost","suspended"]);one(s.publishStatus,["draft","published","suspended"]);
  for(const k of ["createdAt","lastUpdatedAt"]){text(s[k],40);if(!Number.isFinite(Date.parse(String(s[k]))))throw new OperatorInputError("日付を確認してください。");}
  if(s.monthlyFee!==undefined&&(typeof s.monthlyFee!=="number"||!Number.isSafeInteger(s.monthlyFee)||s.monthlyFee<0))throw new OperatorInputError("料金を確認してください。");
  if(s.contentRevision!==undefined&&s.contentRevision!==null&&(typeof s.contentRevision!=="string"||!/^\d{4}-\d{2}-\d{2}T/.test(s.contentRevision)||!Number.isFinite(Date.parse(s.contentRevision))))throw new OperatorInputError("更新状態を確認できません。再読み込みしてください。");
  const content=s.content===undefined?undefined:validateOperatorContent(s.content);
  return {...s,...(content===undefined?{}:{content})} as DemoSite;
}
export function validateOperatorCustomer(value:unknown):CustomerAccount{
  const c=object(value);if(Object.keys(c).some(k=>!["id","name","contactEmail","contactPhone","contactPersonName","createdAt"].includes(k)))throw new OperatorInputError("変更できない顧客項目です。");
  for(const k of ["id","name","contactEmail","contactPhone","createdAt"])text(c[k],254);text(c.contactPersonName,200,true);
  if(!c.id||!String(c.name).trim()||!/^\S+@[^\s@]+\.[^\s@]+$/.test(String(c.contactEmail))||!Number.isFinite(Date.parse(String(c.createdAt))))throw new OperatorInputError("顧客情報を確認してください。");
  return c as CustomerAccount;
}
export function validateShareInput(body:Record<string,unknown>){if(body.expiryOption!==undefined)one(body.expiryOption,["7d","30d","never"]);if(body.demoSiteId!==undefined){text(body.demoSiteId,200);if(!body.demoSiteId)throw new OperatorInputError("案件を選択してください。");}if(body.action!==undefined)one(body.action,["revoke","regenerate","extend"]);}
