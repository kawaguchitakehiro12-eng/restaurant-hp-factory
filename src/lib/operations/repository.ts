import {createAdminDbClient} from '@/lib/supabase/admin';
import {OperationsError,type OperationAction} from './model';
export async function executeOperation(actor:string,operator:boolean,action:OperationAction,siteId:string|null,data:Record<string,unknown>,requestId:string|null):Promise<Record<string,unknown>> {
 const {data:result,error}=await createAdminDbClient().rpc('sales_operation_v1',{p_actor:actor,p_operator:operator,p_action:action,p_site:siteId,p_data:data,p_request:requestId});
 if(error){const code=String(error.code);if(code==='42501')throw new OperationsError('この店舗・操作への権限がありません。',403);if(['PT409','23505'].includes(code))throw new OperationsError('最低利用期間・重複・更新競合を確認してください。解約リマインドは解約予約ではありません。',409);if(['22023','23514','22007','22P02'].includes(code))throw new OperationsError('入力内容、契約条件、日付を確認してください。');throw new OperationsError('運用機能を利用できません。入力を保持して、未適用SQL・接続状態を確認してください。',503);}
 if(!result||typeof result!=='object'||Array.isArray(result))throw new OperationsError('結果が確認できません。再操作前に保存状態を確認してください。',503);
 return result as Record<string,unknown>;
}
