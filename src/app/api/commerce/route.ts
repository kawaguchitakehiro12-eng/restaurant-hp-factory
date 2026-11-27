import {mediaDevelopmentEnabled,runDevelopmentMediaSync} from '@/lib/media/development-service';
import {issueOffer} from '@/lib/commerce/offers';
import {getOperatorAuth} from '@/lib/auth/operator';
import {isSameOriginRequest} from '@/lib/auth/request-origin';
import {readOperatorJson} from '@/lib/api/operator-input';
import {CommerceError,viewFor,type Actor} from '@/lib/commerce/engine';
import {assertMockMode} from '@/lib/commerce/providers';
import * as repo from '@/lib/commerce/repository';
const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
const actions=['offer','list','snapshot','create','assign','report','application','card-register','apply','cancel','withdraw','reminder','tick','payment-request','collection','adjustment','domain-request','domain-advance','publish','stop','message-dispatch','message-retry','notice','call','cost','inquiry','reply'];
export async function POST(request:Request){try{if(!isSameOriginRequest(request))return response({error:'送信元を確認してください。'},403);assertMockMode();const auth=await getOperatorAuth();if(auth.status==='unauthenticated')return response({error:'ログインしてください。'},401);if(auth.status==='unavailable')return response({error:'認証サービスに接続できません。'},503);
 const b=await readOperatorJson(request,20000);if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!['action','siteId','data','requestId'].includes(k))||!actions.includes(String(b.action)))throw new CommerceError(400,'操作を確認してください。');
 const actor:Actor={id:auth.user.id,role:auth.status==='ok'?'operator':'owner',email:auth.user.email??''};
 if(!b.data||typeof b.data!=='object'||Array.isArray(b.data))throw new CommerceError(400,'入力を確認してください。');const data=b.data as Record<string,unknown>,action=String(b.action);if(action==='card-register'&&Object.keys(data).length)throw new CommerceError(400,'カード情報はこのAPIで受け付けません。');
 if(action==='list')return response({sites:await repo.list(actor),policy:repo.configuredPolicy(),mode:'mock'});
 if(action==='report')return response(await repo.report(actor,String(data.period)));
 if(typeof b.siteId!=='string'||!b.siteId||b.siteId.length>200)throw new CommerceError(400,'店舗を確認してください。');
 if(action==='snapshot'){const v=await repo.readSite(actor,b.siteId);return response({state:viewFor(v.state,v.role),role:v.role,revision:v.revision});}
 if(typeof b.requestId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.requestId))throw new CommerceError(400,'操作IDを確認してください。');
 if(action==='offer')return response(await issueOffer(actor,b.siteId,String(data.shareId??''),String(data.recipient??'')));
 if(action==='create')return response(await repo.create(actor,b.siteId,String(data.owner),String(data.title).slice(0,200)));
 if(action==='assign')return response(await repo.assign(actor,b.siteId,String(data.agent)));
 const result=await repo.execute(actor,b.siteId,action,data,b.requestId);if(mediaDevelopmentEnabled()&&['publish','stop','tick','cancel','withdraw'].includes(action))await runDevelopmentMediaSync();return response(result);
 }catch(e){if(e instanceof CommerceError)return response({error:e.message},e.status);return response({error:'処理結果を確認できません。入力を保持し、保存状態を確認してください。'},503);}}
