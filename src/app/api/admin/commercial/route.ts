import {NextResponse} from "next/server";
import {requireOperatorApi} from "@/lib/auth/operator";
import {readOperatorJson,OperatorInputError} from "@/lib/api/operator-input";
import {getDemoSiteRepository,getCommercialRepository} from "@/lib/repositories";
import {CommercialError,parseInvoice,parseTerms,parseTransition} from "@/lib/commercial/model";
const response=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function gate(){const denied=await requireOperatorApi();if(denied)return denied;if(process.env.MANUAL_BILLING_ENABLED!=="true")return response({error:"手動請求台帳は未有効です。SQL承認・適用と運用確認が完了するまで利用できません。"},503);return null;}
async function contracted(id:string){const site=await getDemoSiteRepository().findById(id);if(!site)throw new CommercialError("店舗が見つかりません。",404);if(!site.customerId||!["contracted","suspended"].includes(site.siteContractStatus)||!site.contractStartDate)throw new CommercialError("顧客と契約開始日が登録された契約店舗を選んでください。",409);return site;}
function failure(error:unknown){if(error instanceof CommercialError||error instanceof OperatorInputError)return response({error:error.message},error.status);return response({error:"請求情報を保存・取得できません。入力を保持して再試行してください。"},503);}
export async function GET(request:Request){const blocked=await gate();if(blocked)return blocked;try{const siteId=new URL(request.url).searchParams.get('siteId');if(!siteId||siteId.length>200)throw new CommercialError("店舗を選択してください。");await contracted(siteId);return response(await getCommercialRepository().list(siteId));}catch(e){return failure(e)}}
export async function POST(request:Request){const blocked=await gate();if(blocked)return blocked;try{const body=await readOperatorJson(request,16384);if(Object.keys(body).some(k=>!['action','data'].includes(k)))throw new CommercialError("入力形式を確認してください。");const repository=getCommercialRepository();
 if(body.action==='create'){const input=parseInvoice(body.data),site=await contracted(input.site_id);if(input.period<site.contractStartDate!.slice(0,7))throw new CommercialError("契約開始前の対象月は登録できません。");return response(await repository.create(input),201);}
 if(body.action==='terms'){const input=parseTerms(body.data),site=await contracted(input.site_id);if(input.cancellation_on&&input.cancellation_on<site.contractStartDate!||input.renewal_on&&input.renewal_on<site.contractStartDate!)throw new CommercialError("契約開始日以降の日付を入力してください。");return response(await repository.saveTerms(input));}
 if(body.action==='transition'){const input=parseTransition(body.data),today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());if(input.paid_on&&input.paid_on>today)throw new CommercialError("未来の入金日は登録できません。");return response(await repository.transition(input));}
 throw new CommercialError("操作を確認してください。");}catch(e){return failure(e)}}
