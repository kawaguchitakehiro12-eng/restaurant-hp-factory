export class OperationsError extends Error { constructor(message:string,public status=400){super(message)} }
export function civilDate(value:unknown):string { if(typeof value!=="string"||!/^20\d{2}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+"T00:00:00Z"))||new Date(value+"T00:00:00Z").toISOString().slice(0,10)!==value)throw new OperationsError("正しい日付を入力してください。");return value; }
export function month(value:unknown):string { if(typeof value!=="string"||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(value))throw new OperationsError("対象月を確認してください。");return value; }
export function firstCancellationDate(start:string):string {const [y,m]=civilDate(start).split('-').map(Number);return new Date(Date.UTC(y,m-1+6,1)).toISOString().slice(0,10);}
export function cancellationEnd(start:string,today:string):string {civilDate(today);if(today<firstCancellationDate(start))throw new OperationsError("最低利用期間中のため解約申請はできません。リマインド登録は解約申請・解約予約ではありません。",409);const [y,m]=today.split('-').map(Number);return new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);}
export function todayJst(now=new Date()):string {return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(now);}
export const actions=['sites','snapshot','metrics','configure','agree','cancel','reminder','issue','pay','void','collection','cost','inquiry','reply','domain','reconcile'] as const;
export type OperationAction=typeof actions[number];
export function parseOperation(value:unknown):{action:OperationAction;siteId:string|null;requestId:string|null;data:Record<string,unknown>} {
 if(!value||typeof value!=='object'||Array.isArray(value))throw new OperationsError('入力形式を確認してください。');const v=value as Record<string,unknown>;
 if(Object.keys(v).some(k=>!['action','siteId','requestId','data'].includes(k))||!actions.includes(v.action as OperationAction))throw new OperationsError('操作を確認してください。');
 if(v.siteId!==null&&(typeof v.siteId!=='string'||!v.siteId||v.siteId.length>200||/[\x00-\x1f]/.test(v.siteId)))throw new OperationsError('店舗を選択してください。');
 if(v.requestId!==null&&(typeof v.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.requestId)))throw new OperationsError('操作IDを確認してください。');
 if(!v.data||typeof v.data!=='object'||Array.isArray(v.data))throw new OperationsError('入力内容を確認してください。');
 if(!['sites','snapshot','metrics'].includes(String(v.action))&&v.requestId===null)throw new OperationsError('操作IDが必要です。');
 return {action:v.action as OperationAction,siteId:v.siteId as string|null,requestId:v.requestId as string|null,data:v.data as Record<string,unknown>};
}
export function normalDomain(value:unknown):string {if(typeof value!=='string'||value.length>253||value!==value.toLowerCase()||!value.split('.').every(s=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(s))||!value.includes('.')||/^[\d.]+$/.test(value))throw new OperationsError('ドメイン名のみを小文字で入力してください。URL・IPアドレスは登録できません。');return value;}
