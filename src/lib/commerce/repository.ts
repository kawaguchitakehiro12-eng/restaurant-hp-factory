import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import {createAdminDbClient} from '@/lib/supabase/admin';
import {CommerceError,blank,transition,viewFor,metrics,type Actor,type Policy,type State} from './engine';
import {assertMockMode,MockCardGateway,MockDomainGateway,MockMailGateway} from './providers';
type Snapshot={state:State;revision:number;role:'owner'|'agent'|'operator';replayed:boolean};
async function rpc<T>(name:string,args:Record<string,unknown>):Promise<T>{assertMockMode();const{data,error}=await createAdminDbClient().rpc(name,args);if(error)throw new CommerceError(['42501'].includes(error.code)?403:['PT409','23505'].includes(error.code)?409:503,'店舗の権限・更新競合・DB設定を確認してください。保存状態が不明な場合は再実行前に確認してください。');return data as T;}
export function configuredPolicy():Policy{const method=process.env.COMMERCE_AGREEMENT_METHOD;return{termsVersion:process.env.COMMERCE_TERMS_VERSION??'',termsText:process.env.COMMERCE_TERMS_TEXT??'',termsHash:createHash('sha256').update(process.env.COMMERCE_TERMS_TEXT??'').digest('hex'),agreementMethod:method==='web'||method==='electronic'?method:null}}
export async function list(actor:Actor){return rpc<{siteId:string;title:string;role:string}[]>('commerce_list_v2',{p_actor:actor.id,p_admin:actor.role==='operator'});}
export async function readSite(actor:Actor,site:string,request:string|null=null,hash:string|null=null){return rpc<Snapshot>('commerce_read_v2',{p_actor:actor.id,p_admin:actor.role==='operator',p_site:site,p_request:request,p_hash:hash});}
export async function create(actor:Actor,site:string,owner:string,title:string){if(actor.role!=='operator'||! /^[0-9a-f-]{36}$/i.test(owner))throw new CommerceError(403,'運営者と顧客アカウントを確認してください。');await rpc('commerce_create_v2',{p_admin:true,p_site:site,p_owner:owner,p_document:blank(site,title)});return{saved:true}}
export async function assign(actor:Actor,site:string,agent:string){if(actor.role!=='operator'||! /^[0-9a-f-]{36}$/i.test(agent))throw new CommerceError(403,'代理店割当は運営者専用です。');await rpc('commerce_assign_v2',{p_admin:true,p_site:site,p_agent:agent});return{saved:true}}
export async function execute(actor:Actor,site:string,action:string,data:Record<string,unknown>,id:string,now=new Date().toISOString()){
 const hash=createHash('sha256').update(JSON.stringify([actor.id,site,action,data])).digest('hex'),old=await readSite(actor,site,id,hash);
 if(old.replayed)return{state:viewFor(old.state,old.role),revision:old.revision,replayed:true};
 const user={...actor,role:old.role};let next:State;let appliedAction=action;
 if(action==='card-register'){if(old.role!=='owner')throw new CommerceError(403,'本人のカード登録操作が必要です。');next=transition(old.state,'card-result',await new MockCardGateway().setup(id),{...user,role:'system'},now,id,configuredPolicy());appliedAction='card-result';}
 else if(action==='domain-advance'){if(old.role!=='operator')throw new CommerceError(403,'処理担当者専用です。');next=transition(old.state,'domain-result',await new MockDomainGateway().advance(old.state.domain.state,id),{...user,role:'system'},now,id,configuredPolicy());appliedAction='domain-result';}
 else if(action==='payment-dispatch'){if(old.role!=='operator')throw new CommerceError(403,'決済処理専用です。');next=transition(old.state,action,data,{...user,role:'system'},now,id,configuredPolicy());}
 else if(action==='message-dispatch'){
  if(old.role!=='operator')throw new CommerceError(403,'配信担当者専用です。');
  const claimed=transition(old.state,'message-claim',data,{...user,role:'system'},now,id,configuredPolicy());
  const claim=await rpc<Snapshot>('commerce_commit_v2',{p_actor:actor.id,p_admin:true,p_site:site,p_revision:old.revision,p_document:claimed,p_request:id,p_hash:hash,p_action:'message-claim',p_email:''});
  // Claim is persisted before provider invocation. Unknown outcomes stay processing, never auto-retry.
  if(claim.replayed)return{state:viewFor(claim.state,old.role),replayed:true};
  await new MockMailGateway().send(String(data.id));const finish=randomUUID();
  const completed=transition(claim.state,'message-result',data,{...user,role:'system'},now,finish,configuredPolicy());
  const saved=await rpc<Snapshot>('commerce_commit_v2',{p_actor:actor.id,p_admin:true,p_site:site,p_revision:claim.revision,p_document:completed,p_request:finish,p_hash:createHash('sha256').update(id+':complete').digest('hex'),p_action:'message-result',p_email:''});
  return{state:viewFor(saved.state,old.role),revision:saved.revision};
 }
 else{if(['payment-event','domain-result','card-result','message-result','message-claim'].includes(action))throw new CommerceError(403,'検証済みの外部結果のみ受け付けます。');next=transition(old.state,action,data,user,now,id,configuredPolicy());}
 const saved=await rpc<Snapshot>('commerce_commit_v2',{p_actor:actor.id,p_admin:old.role==='operator',p_site:site,p_revision:old.revision,p_document:next,p_request:id,p_hash:hash,p_action:appliedAction,p_email:actor.email});
 return{state:viewFor(saved.state,old.role),revision:saved.revision,replayed:saved.replayed};
}
export async function acceptPayment(actor:Actor,site:string,event:Record<string,unknown>,id:string){
 if(actor.role!=='operator')throw new CommerceError(403,'外部結果の処理専用です。');const now=new Date().toISOString(),hash=createHash('sha256').update(JSON.stringify(event)).digest('hex'),old=await readSite(actor,site,id,hash);if(old.replayed)return{saved:true,replayed:true};
 const next=transition(old.state,'payment-event',event,{...actor,role:'system'},now,id,configuredPolicy());await rpc('commerce_commit_v2',{p_actor:actor.id,p_admin:true,p_site:site,p_revision:old.revision,p_document:next,p_request:id,p_hash:hash,p_action:'payment-event',p_email:''});return{saved:true};
}
export async function report(actor:Actor,period:string){if(actor.role!=='operator')throw new CommerceError(403,'運営者専用です。');const rows=await list(actor),states=[];for(const row of rows)states.push((await readSite(actor,row.siteId)).state);return metrics(states,period);}
