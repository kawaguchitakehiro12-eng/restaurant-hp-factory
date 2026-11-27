import {NextResponse} from 'next/server';
import {getOperatorAuth} from '@/lib/auth/operator';
import {isSameOriginRequest} from '@/lib/auth/request-origin';
import {readOperatorJson,OperatorInputError} from '@/lib/api/operator-input';
import {executeOperation} from '@/lib/operations/repository';
import {OperationsError,parseOperation,normalDomain} from '@/lib/operations/model';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(request:Request){try{
 if(!isSameOriginRequest(request))return reply({error:'同じ画面から操作してください。'},403);
 if(process.env.SALES_OPERATIONS_ENABLED!=='true')return reply({error:'運用機能は未有効です。専用SQLと運用設定の承認が必要です。'},503);
 const auth=await getOperatorAuth();if(auth.status==='unavailable')return reply({error:'認証に接続できません。入力は保持されています。'},503);if(auth.status==='unauthenticated')return reply({error:'ログインしてください。'},401);
 const op=parseOperation(await readOperatorJson(request,16000));
 const customerActions=['sites','snapshot','agree','cancel','reminder','inquiry'];if(auth.status!=='ok'&&!customerActions.includes(op.action))return reply({error:'運営者専用の操作です。'},403);
 if(op.action==='domain')op.data.domain=normalDomain(op.data.domain);
 return reply(await executeOperation(auth.user.id,auth.status==='ok',op.action,op.siteId,op.data,op.requestId));
 }catch(error){if(error instanceof OperationsError||error instanceof OperatorInputError)return reply({error:error.message},error.status);return reply({error:'処理結果を確認できません。入力を控え、再操作前に状態を確認してください。'},503);}}
