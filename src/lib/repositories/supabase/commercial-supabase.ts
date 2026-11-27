import {createAdminDbClient} from "@/lib/supabase/admin";
import {CommercialError,canTransition,sameInvoice,type ManualInvoice,type CommercialTerms,type InvoiceInput} from "@/lib/commercial/model";
export type CommercialRepository={
 list(siteId:string):Promise<{invoices:ManualInvoice[];terms:CommercialTerms|null}>;
 create(input:InvoiceInput):Promise<ManualInvoice>;
 transition(input:{id:string;expected_revision:number;status:ManualInvoice["status"];paid_on:string|null}):Promise<ManualInvoice>;
 saveTerms(input:Omit<CommercialTerms,"revision"|"updated_at"> & {expected_revision:number|null}):Promise<CommercialTerms>;
};
export function createSupabaseCommercialRepository():CommercialRepository {
 const db=()=>createAdminDbClient();
 const fail=(e:unknown):never=>{const code=e&&typeof e==='object'&&'code'in e?String(e.code):'';if(code==='23505')throw new CommercialError("同じ店舗・費目・対象月の請求が登録済みです。再読込して確認してください。",409);if(code==='23514'||code==='23503')throw new CommercialError("契約状態・日付・請求状態を再確認してください。",409);throw new CommercialError("請求台帳を利用できません。未適用SQLまたは接続状態を運営担当者が確認してください。",503)};
 return {
 async list(siteId){const [a,b]=await Promise.all([db().from('manual_invoices').select('*').eq('site_id',siteId).order('created_at',{ascending:false}).limit(1001),db().from('commercial_terms').select('*').eq('site_id',siteId).maybeSingle()]);if(a.error)fail(a.error);if(b.error)fail(b.error);if((a.data?.length??0)>1000)throw new CommercialError("請求が1000件を超えています。期間別の確認が必要です。",409);return{invoices:a.data as ManualInvoice[],terms:b.data as CommercialTerms|null};},
 async create(input){const {data,error}=await db().from('manual_invoices').insert({...input,status:'draft',paid_on:null,revision:1}).select('*').single();if(error){if(error.code==='23505'){const old=await db().from('manual_invoices').select('*').eq('id',input.id).maybeSingle();if(!old.error&&old.data&&sameInvoice(old.data as ManualInvoice,input))return old.data as ManualInvoice;}fail(error);}return data as ManualInvoice;},
 async transition(input){const {data:current,error:readError}=await db().from('manual_invoices').select('*').eq('id',input.id).maybeSingle();if(readError)fail(readError);if(!current)throw new CommercialError("請求が見つかりません。",404);if(current.revision===input.expected_revision+1&&current.status===input.status&&current.paid_on===input.paid_on)return current as ManualInvoice;if(current.revision!==input.expected_revision||!canTransition(current.status,input.status))throw new CommercialError("別の画面で更新済みか、変更できない状態です。再読込してください。",409);const {data,error}=await db().from('manual_invoices').update({status:input.status,paid_on:input.paid_on,revision:input.expected_revision+1}).eq('id',input.id).eq('revision',input.expected_revision).select('*').maybeSingle();if(error)fail(error);if(!data)throw new CommercialError("別の画面で更新されました。再読込してください。",409);return data as ManualInvoice;},
 async saveTerms(input){const {expected_revision,...values}=input;const query=expected_revision===null?db().from('commercial_terms').insert({...values,revision:1}):db().from('commercial_terms').update({...values,revision:expected_revision+1}).eq('site_id',input.site_id).eq('revision',expected_revision);const {data,error}=await query.select('*').maybeSingle();if(error){if(error.code==='23505')throw new CommercialError("契約補足はすでに登録されています。入力を控えて最新の内容を再取得してください。",409);fail(error);}if(!data)throw new CommercialError("契約メモが別の画面で更新されました。入力を控えて再読込してください。",409);return data as CommercialTerms;}
 };
}
