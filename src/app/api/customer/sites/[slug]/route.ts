import {customerAccess} from '@/lib/customer/access';
import {mediaDevelopmentEnabled,prepareDevelopmentContent,syncDevelopmentPolicy} from '@/lib/media/development-service';
import type {CustomerContent} from '@/types/customer-site';
import {assertCustomerMedia} from '@/lib/media/customer-ownership';
import {sanitizeLogo} from '@/lib/images/logo-server';
import { NextResponse } from "next/server";
import { CustomerAccessError, getCustomerSite, requireCustomerUser } from "@/lib/customer/server";
import { CustomerInputError, parseCustomerSave } from "@/lib/customer/validation";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { isSameOriginRequest } from "@/lib/auth/request-origin";

const headers={"Cache-Control":"private, no-store"};
function failure(error:unknown) {
  if(error instanceof CustomerAccessError) return NextResponse.json({error:error.status===401?"ログインし直してください。":error.status===404?"店舗が見つかりません。":"現在接続できません。"},{status:error.status,headers});
  if(error instanceof CustomerInputError) return NextResponse.json({error:error.message},{status:400,headers});
  return NextResponse.json({error:"処理に失敗しました。時間をおいて再度お試しください。"},{status:503,headers});
}
type Context={params:Promise<{slug:string}>};
export async function GET(_request:Request,{params}:Context) {
 try {const user=await requireCustomerUser();return NextResponse.json(await getCustomerSite(user.id,(await params).slug),{headers});}catch(error){return failure(error);}
}
export async function PATCH(request:Request,{params}:Context) {
 try {
  if(!isSameOriginRequest(request)) return NextResponse.json({error:"リクエスト元を確認できません。"},{status:403,headers});
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({error:"JSON形式で送信してください。"},{status:415,headers});
  const user=await requireCustomerUser(),slug=(await params).slug;
  const current=await getCustomerSite(user.id,slug);
  if(!customerAccess(current).edit)return NextResponse.json({error:"契約終了後はホームページを編集できません。"},{status:403,headers});
  const max=4_000_000;
  if(Number(request.headers.get("content-length")??0)>max) return NextResponse.json({error:"画像を減らすか小さくしてください。"},{status:413,headers});
  const reader=request.body?.getReader();if(!reader)throw new CustomerInputError("入力がありません。");
  const chunks:Uint8Array[]=[];let length=0;
  while(true){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>max){await reader.cancel();return NextResponse.json({error:"画像を減らすか小さくしてください。"},{status:413,headers});}chunks.push(part.value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  let body:unknown;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new CustomerInputError("入力形式が正しくありません。");}
  const save=parseCustomerSave(body);
  if(mediaDevelopmentEnabled())save.content=await prepareDevelopmentContent(save.content,user.id,current.id) as CustomerContent;
  await assertCustomerMedia(save.content,current.id);
  if(mediaDevelopmentEnabled())await syncDevelopmentPolicy(user.id,current.id,slug,save.content);
  try{save.content.photos.logo=await sanitizeLogo(save.content.photos.logo)}catch{throw new CustomerInputError("ロゴ画像を検証できません。形式・容量を確認してください。");}
  const {error}=await createAdminDbClient().rpc("save_customer_site_content",{p_user_id:user.id,p_slug:slug,p_content:save.content,p_expected_updated_at:save.revision});
  if(error){
    if(["PT409","40001"].includes(error.code))return NextResponse.json({error:"別の画面で更新されています。再読み込みしてから編集してください。"},{status:409,headers});
    if(error.code==="42501")throw new CustomerAccessError(404);
    throw new CustomerAccessError(503);
  }
  if(mediaDevelopmentEnabled())await syncDevelopmentPolicy(user.id,current.id,slug);
  return NextResponse.json(await getCustomerSite(user.id,slug),{headers});
 }catch(error){return failure(error);}
}
