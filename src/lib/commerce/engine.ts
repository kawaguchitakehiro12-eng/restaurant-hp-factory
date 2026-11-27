import {createHash} from 'node:crypto';
import {civilDate,firstCancellationDate,month,normalDomain} from '@/lib/operations/model';
export class CommerceError extends Error{constructor(public status:number,message:string){super(message)}}
export type Role='owner'|'operator'|'agent'|'system';
export type Actor={id:string;role:Role;email:string};
export type Price={net:number;taxBps:number;gross:number;version:string};
export const PRICE:Price={net:2980,taxBps:1000,gross:3278,version:'sakupage-2980-tax10-v1'};
export type Policy={termsVersion:string;termsText:string;termsHash?:string;agreementMethod:'web'|'electronic'|null};
export type Applicant={kind:'corporation'|'sole';name:string;address:string;phone:string;representative:string;contact:string;storeName:string;storeAddress:string;storePhone:string};
type Agreement={method:string;version:string;text:string;sha256:string;at:string;documentRef:string|null};
export type Contract={id:string;startOn:string;endOn:string|null;finished:boolean;price:Price;agreement:Agreement;cardRef:string;reminderOn:string|null;reminderQueued:boolean};
export type Invoice={id:string;contractId:string;period:string;price:Price;dueOn:string;status:'unpaid'|'failed'|'paid';paidAt:string|null;attempt:number;paymentRef:string|null;dispatched:boolean;fee:number;collection:string};
export type Message={id:string;kind:'cancellation'|'reminder'|'cancellation_withdrawn';dueAt:string;endMonth:string|null;finalServiceMonth:string|null;finalPaymentMonth:string|null;attempts?:number;failure?:'PROVIDER_FAILED'|'OUTCOME_UNKNOWN';state:'pending'|'processing'|'simulated'|'failed'|'unknown';contractId:string};
export type State={siteId:string;title:string;application:Applicant|null;card:{ref:string;valid:boolean;provider:'mock'}|null;contracts:Contract[];invoices:Invoice[];outbox:Message[];events:Record<string,string>;domainHistory:{name:string;expiresOn:string|null;reference:string|null;renew:boolean;publicUse:boolean}[];domain:{quote?:{available:boolean;registrationYen:number;renewalYen:number;currency:'JPY';simulated:true};name:string;state:'none'|'requested'|'registering'|'dns_pending'|'active'|'failed'|'stopped';renew:boolean;publicUse:boolean;expiresOn:string|null;reference:string|null;error:string|null;attempts:number};inquiries:{id:string;subject:string;body:string;reply:string;state:string;createdAt?:string;repliedAt?:string}[];published:boolean;operatorStopped:boolean;notices:{id:string;text:string;at:string}[];calls:{at:string;status:string;note:string}[];costs:{id:string;date:string;category:string;gross:number;source:'manual'|'provider'}[];adjustments:{id:string;invoiceId:string;kind:'refund'|'overpayment';gross:number;reason:string;state:'review_required'}[];audit:{id:string;actor:string;action:string;at:string}[]};
export const blank=(siteId:string,title:string):State=>({siteId,title,application:null,card:null,contracts:[],invoices:[],outbox:[],events:{},domainHistory:[],domain:{name:'',state:'none',renew:false,publicUse:false,expiresOn:null,reference:null,error:null,attempts:0},inquiries:[],published:false,operatorStopped:false,notices:[],calls:[],costs:[],adjustments:[],audit:[]});
function fail(message:string,status=409):never{throw new CommerceError(status,message)};
export function jstDate(now:string){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date(now))}
export function monthEnd(date:string){const[y,m]=civilDate(date).split('-').map(Number);return new Date(Date.UTC(y,m,0)).toISOString().slice(0,10)}
export function nextDue(period:string){const[y,m]=month(period).split('-').map(Number);return new Date(Date.UTC(y,m,20)).toISOString().slice(0,10)}
export function shutdownAt(endOn:string){const[y,m]=civilDate(endOn).split('-').map(Number);return new Date(Date.UTC(y,m,1,1-9)).toISOString()}
export function publicationAllowed(s:State,now:string){const c=s.contracts.at(-1);return !!c&&!c.finished&&(!c.endOn||Date.parse(now)<Date.parse(shutdownAt(c.endOn)))&&s.domain.state==='active'&&!s.operatorStopped}
function inputText(x:unknown,max=200){if(typeof x!=='string'||!x.trim()||x.length>max||/[\x00-\x08]/.test(x))fail('入力項目を確認してください。',400);return (x as string).trim()}
export function applicant(x:Record<string,unknown>):Applicant{
 const keys=['kind','name','address','phone','representative','contact','storeName','storeAddress','storePhone'];
 if(Object.keys(x).some(k=>!keys.includes(k))||!['corporation','sole'].includes(String(x.kind)))fail('契約者情報を確認してください。',400);
 const v=Object.fromEntries(keys.map(k=>[k,k==='kind'?x.kind:inputText(x[k],k.includes('ddress')?500:200)])) as Applicant;
 for(const p of [v.phone,v.storePhone])if(!/^[+0-9() -]{8,30}$/.test(p))fail('電話番号を確認してください。',400);return v;
}
function isAdmin(a:Actor){if(!['operator','system'].includes(a.role))fail('運営者専用の操作です。',403)}
export function transition(source:State,action:string,data:Record<string,unknown>,actor:Actor,now:string,id:string,policy:Policy):State{
 if(!Number.isFinite(Date.parse(now)))fail('時刻を確認できません。',400);
 const s=structuredClone(source),today=jstDate(now),c=s.contracts.at(-1);
 if(actor.role==='agent'&&!['call'].includes(action))fail('代理店にはこの操作を許可していません。',403);
 // Card data is never accepted. Provider references are server adapter results only.
 if(Object.keys(data).some(k=>/card.number|pan|cvc|cvv|security.code/i.test(k)))fail('カード情報は受け付けません。',400);
 if(action==='application'){if(actor.role!=='owner')fail('本人の操作が必要です。',403);s.application=applicant(data);}
 else if(action==='card-result'){if(actor.role!=='system'||data.provider!=='mock'||!String(data.ref).startsWith('mock_setup_')||typeof data.valid!=='boolean')fail('カード確認経路を検証できません。',403);if(c&&(c.finished||(c.endOn&&Date.parse(now)>=Date.parse(shutdownAt(c.endOn))))&&!s.invoices.some(i=>i.status!=='paid'&&i.price.gross>0))fail('契約終了後のカード変更は未払いがある場合のみ可能です。');s.card={ref:String(data.ref),valid:data.valid,provider:'mock'};if(c&&!c.finished&&s.card.valid)c.cardRef=s.card.ref;}
 else if(action==='apply'){
  if(actor.role!=='owner'||!s.application||!s.card?.valid)fail('必要情報・カード登録と有効性確認が未完了です。');
  if(c&&!c.finished)fail('この店舗には継続中の契約があります。');
  if(!policy.agreementMethod||!policy.termsVersion||!policy.termsText||data.accepted!==true||data.termsVersion!==policy.termsVersion||data.termsHash!==createHash('sha256').update(policy.termsText).digest('hex'))fail('契約方式・規約を確認してください。');
  if(policy.agreementMethod==='electronic'&&!String(data.documentRef??'').startsWith('mock_document_'))fail('契約書類確認が未完了です。');
  s.contracts.push({id:'contract-'+id,startOn:today,endOn:null,finished:false,price:{...PRICE},agreement:{method:policy.agreementMethod,version:policy.termsVersion,text:policy.termsText,sha256:createHash('sha256').update(policy.termsText).digest('hex'),at:now,documentRef:policy.agreementMethod==='electronic'?String(data.documentRef):null},cardRef:s.card.ref,reminderOn:null,reminderQueued:false});s.published=false;
 }
 else if(action==='cancel'||action==='withdraw'||action==='reminder'){
  if(actor.role!=='owner'||!c||c.finished)fail('継続中の本人契約を確認してください。',403);
  const first=firstCancellationDate(c.startOn);
  if(action==='reminder'){if(today>=first||c.endOn)fail('リマインド登録の対象期間外です。');c.reminderOn=first;}
  if(action==='cancel'){if(today<first)fail('最低利用期間中です。解約は'+first+'から可能です。');if(c.endOn)fail('解約申請済みです。');c.endOn=monthEnd(today);s.outbox.push({id:c.id+':cancel:'+id,kind:'cancellation',contractId:c.id,dueAt:now,endMonth:c.endOn.slice(0,7),finalServiceMonth:c.endOn.slice(0,7),finalPaymentMonth:nextDue(c.endOn.slice(0,7)).slice(0,7),state:'pending'});}
  if(action==='withdraw'){if(!c.endOn||today>c.endOn)fail('契約終了前のみ解約取消できます。');const previous=c.endOn;c.endOn=null;s.outbox.push({id:c.id+':withdraw:'+id,kind:'cancellation_withdrawn',contractId:c.id,dueAt:now,endMonth:previous.slice(0,7),finalServiceMonth:null,finalPaymentMonth:null,state:'pending'});}
 }
 else if(action==='tick'){
  isAdmin(actor);
  for(const contract of s.contracts){
   if(contract.endOn&&Date.parse(now)>=Date.parse(shutdownAt(contract.endOn))){contract.finished=true;if(contract===c){s.published=false;s.domain.renew=false;s.domain.publicUse=false;s.domain.state='stopped';}}
   if(contract.reminderOn&&today>=contract.reminderOn&&!contract.reminderQueued&&!contract.endOn){s.outbox.push({id:contract.id+':reminder',kind:'reminder',contractId:contract.id,dueAt:contract.reminderOn+'T00:00:00+09:00',endMonth:null,finalServiceMonth:null,finalPaymentMonth:null,state:'pending'});contract.reminderQueued=true;}
   // Only completed service months are invoiced. Final debts survive contract end.
   let period=contract.startOn.slice(0,7);let count=0;
   while(period<today.slice(0,7)&&(!contract.endOn||period<=contract.endOn.slice(0,7))){
    if(++count>1200)fail('請求期間が上限を超えました。');
    const invoiceId=contract.id+':'+period;
    if(!s.invoices.some(i=>i.id===invoiceId))s.invoices.push({id:invoiceId,contractId:contract.id,period,price:{...contract.price},dueOn:nextDue(period),status:'unpaid',paidAt:null,attempt:0,paymentRef:null,dispatched:false,fee:0,collection:''});
    const[y,m]=period.split('-').map(Number);period=new Date(Date.UTC(y,m,1)).toISOString().slice(0,7);
   }
  }
 }
 else if(action==='payment-request'){
  isAdmin(actor);const inv=s.invoices.find(i=>i.id===data.invoiceId);if(!inv||inv.status==='paid'||inv.paymentRef||today<inv.dueOn)fail('決済指示の対象外です。');
  if(inv.status==='failed'&&data.manualRetry!==true)fail('自動再決済は未承認です。');
  inv.attempt++;inv.paymentRef='mock_payment_'+id;inv.dispatched=false;
 }
 else if(action==='payment-dispatch'){if(actor.role!=='system')fail('決済処理専用です。',403);const inv=s.invoices.find(i=>i.id===data.invoiceId);if(!inv?.paymentRef||inv.dispatched)fail('決済送信済み、または結果不明です。');inv.dispatched=true;}
 else if(action==='payment-event'){
  if(actor.role!=='system'||!String(data.eventId).startsWith('mock_event_'))fail('Webhookの検証が必要です。',403);
  const eventHash=createHash('sha256').update(JSON.stringify(data)).digest('hex');if(s.events[String(data.eventId)]){if(s.events[String(data.eventId)]!==eventHash)fail('同一イベントIDの内容が異なります。');return source;}
  const inv=s.invoices.find(i=>i.id===data.invoiceId);if(!inv||!inv.paymentRef||inv.paymentRef!==data.paymentRef||inv.price.gross!==data.gross||!['succeeded','failed'].includes(String(data.status)))fail('決済指示との照合に失敗しました。');
  if(inv.status==='paid')fail('支払済みの決済結果は変更できません。');
  s.events[String(data.eventId)]=eventHash;inv.status=data.status==='succeeded'?'paid':'failed';inv.paidAt=inv.status==='paid'?now:null;inv.paymentRef=null;
  if(inv.status==='paid'){if(!Number.isSafeInteger(data.fee)||Number(data.fee)<0||Number(data.fee)>inv.price.gross)fail('手数料を確認してください。',400);inv.fee=Number(data.fee);}
 }
 else if(action==='collection'){isAdmin(actor);const inv=s.invoices.find(i=>i.id===data.invoiceId);if(!inv)fail('請求がありません。');inv.collection=inputText(data.note,2000);}
 else if(action==='adjustment'){isAdmin(actor);if(!s.invoices.some(i=>i.id===data.invoiceId)||!['refund','overpayment'].includes(String(data.kind))||!Number.isSafeInteger(data.gross)||Number(data.gross)<=0)fail('返金・過払いの確認内容が不正です。',400);s.adjustments.push({id,invoiceId:String(data.invoiceId),kind:data.kind as 'refund'|'overpayment',gross:Number(data.gross),reason:inputText(data.reason,1000),state:'review_required'});}
 else if(action==='domain-request'){if(!c||c.finished||!s.card?.valid)fail('申込完了後に取得を申請できます。');if(!['none','failed','stopped'].includes(s.domain.state))fail('ドメイン処理中です。');const name=normalDomain(data.domain);if(!name.endsWith('.example.invalid'))fail('モックでは架空ドメインのみ利用できます。',400);if(s.domain.name)s.domainHistory.push(structuredClone(s.domain));s.domain={quote:data.quote as State['domain']['quote'],name,state:'requested',renew:true,publicUse:false,expiresOn:null,reference:null,error:null,attempts:s.domain.attempts+1};}
 else if(action==='domain-result'){if(actor.role!=='system'||!['registering','dns_pending','active','failed'].includes(String(data.state))||!s.domain.renew||!c||c.finished)fail('ドメイン結果を確認できません。',403);const allowed:Record<string,string[]>= {requested:['registering','failed'],registering:['dns_pending','failed'],dns_pending:['active','failed']};if(!allowed[s.domain.state]?.includes(String(data.state)))fail('ドメイン状態遷移が不正です。');s.domain.state=data.state as State['domain']['state'];s.domain.reference='mock_domain_'+id;s.domain.error=data.state==='failed'?'PROVIDER_FAILED':null;if(data.state==='active'){s.domain.publicUse=true;const [y,m,d]=today.split('-').map(Number);s.domain.expiresOn=new Date(Date.UTC(y+1,m-1,d)).toISOString().slice(0,10);}}
 else if(action==='publish'){if(typeof data.visible!=='boolean')fail('公開設定を確認してください。',400);if(data.visible&&!publicationAllowed(s,now))fail('申込完了・ドメイン設定・契約状態の確認が必要です。');s.published=data.visible;}
 else if(action==='stop'){isAdmin(actor);if(typeof data.stopped!=='boolean')fail('停止設定を確認してください。',400);s.operatorStopped=data.stopped;if(s.operatorStopped)s.published=false;}
 else if(action==='message-retry'){isAdmin(actor);const msg=s.outbox.find(m=>m.id===data.id);if(!msg||msg.state!=='failed')fail('明確な失敗のみ手動再試行できます。結果不明時は再送しません。');msg.state='pending';}
 else if(action==='message-claim'){if(actor.role!=='system')fail('配信処理専用です。',403);const msg=s.outbox.find(m=>m.id===data.id);if(!msg||msg.state!=='pending'||Date.parse(now)<Date.parse(msg.dueAt))fail('配信対象外、または送信結果確認中です。');msg.state='processing';msg.attempts=(msg.attempts??0)+1;msg.failure=undefined;}
 else if(action==='message-result'){if(actor.role!=='system')fail('配信処理専用です。',403);const msg=s.outbox.find(m=>m.id===data.id);if(!msg||msg.state!=='processing'||Date.parse(now)<Date.parse(msg.dueAt))fail('配信対象外です。');const state=data.status??'simulated';if(!['simulated','failed','unknown'].includes(String(state)))fail('配信結果を確認してください。',400);msg.state=state as 'simulated'|'failed'|'unknown';msg.failure=state==='failed'?'PROVIDER_FAILED':state==='unknown'?'OUTCOME_UNKNOWN':undefined;}
 else if(action==='inquiry'){s.inquiries.push({id,subject:inputText(data.subject,200),body:inputText(data.body,4000),reply:'',state:'open',createdAt:now});}
 else if(action==='reply'){isAdmin(actor);const q=s.inquiries.find(q=>q.id===data.id);if(!q)fail('問い合わせを確認してください。');q.reply=inputText(data.reply,4000);q.state='answered';q.repliedAt=now;}
 else if(action==='notice'){isAdmin(actor);s.notices.push({id,text:inputText(data.text,2000),at:now});}
 else if(action==='call'){if(!['operator','agent'].includes(actor.role))fail('営業担当者専用です。',403);if(!['new','called','interested','negotiating','declined'].includes(String(data.status)))fail('商談状態を確認してください。',400);s.calls.push({at:now,status:String(data.status),note:inputText(data.note,2000)});}
 else if(action==='cost'){isAdmin(actor);if(!['server_db','storage','domain','sms_email','payment_fee','other_direct'].includes(String(data.category))||!Number.isSafeInteger(data.gross)||Number(data.gross)<0)fail('原価を確認してください。',400);s.costs.push({id,date:civilDate(data.date),category:String(data.category),gross:Number(data.gross),source:'manual'});}
 else fail('未対応の操作です。',400);
 s.audit.push({id,actor:actor.id,action,at:now});return s;
}
export function viewFor(s:State,role:Role){
 if(role==='agent')return{siteId:s.siteId,title:s.title,calls:s.calls};
 if(role==='owner')return{siteId:s.siteId,title:s.title,application:s.application,card:s.card?{valid:s.card.valid,provider:s.card.provider}:null,contracts:s.contracts.map(c=>({id:c.id,startOn:c.startOn,endOn:c.endOn,finished:c.finished,price:c.price,agreement:c.agreement,reminderOn:c.reminderOn,reminderQueued:c.reminderQueued})),invoices:s.invoices.map(i=>({id:i.id,contractId:i.contractId,period:i.period,price:i.price,dueOn:i.dueOn,status:i.status,paidAt:i.paidAt})),domain:{name:s.domain.name,state:s.domain.state,renew:s.domain.renew,publicUse:s.domain.publicUse,expiresOn:s.domain.expiresOn},published:s.published,operatorStopped:s.operatorStopped,notices:s.notices,inquiries:s.inquiries};
 return s;
}
export function metrics(states:State[],period:string){const start=month(period)+'-01',end=monthEnd(start),boundary=shutdownAt(end);let billed=0,received=0,outstanding=0,active=0,scheduled=0,unpaid=0,cost=0,fees=0;
 for(const s of states){let debt=false;for(const inv of s.invoices){if(inv.period===period)billed+=inv.price.gross;if(inv.paidAt&&jstDate(inv.paidAt).slice(0,7)===period){received+=inv.price.gross;fees+=inv.fee;}if(inv.period<=period&&(!inv.paidAt||jstDate(inv.paidAt)>end)){outstanding+=inv.price.gross;debt=true;}}if(debt)unpaid++;if(s.contracts.some(c=>c.startOn<=end&&(!c.endOn||shutdownAt(c.endOn)>=boundary)))active++;if(s.contracts.some(c=>c.endOn?.slice(0,7)===period))scheduled++;cost+=s.costs.filter(c=>c.date>=start&&c.date<=end&&c.category!=='payment_fee').reduce((n,c)=>n+c.gross,0);fees+=s.costs.filter(c=>c.date>=start&&c.date<=end&&c.category==='payment_fee').reduce((n,c)=>n+c.gross,0);}
 return{period,billed,received,outstanding,active,scheduled,unpaid,cost:cost+fees,fees,grossProfitReference:billed-cost-fees};
}
