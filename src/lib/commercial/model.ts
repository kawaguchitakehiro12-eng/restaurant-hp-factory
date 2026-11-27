export type InvoiceStatus = "draft" | "issued" | "paid" | "void";
export type InvoiceKind = "initial" | "monthly";
export type ManualInvoice = {
 id:string; site_id:string; kind:InvoiceKind; period:string; amount_yen:number;
 due_on:string; status:InvoiceStatus; paid_on:string|null; revision:number;
 created_at:string; updated_at:string;
};
export type CommercialTerms = {
 site_id:string; initial_fee_yen:number; renewal_on:string|null; cancellation_on:string|null;
 notes:string; revision:number; updated_at:string;
};
export type InvoiceInput = Pick<ManualInvoice,"id"|"site_id"|"kind"|"period"|"amount_yen"|"due_on">;
export class CommercialError extends Error {constructor(message:string,public status=400){super(message)}}
const object=(value:unknown):Record<string,unknown>=>{if(!value||typeof value!=="object"||Array.isArray(value))throw new CommercialError("入力形式を確認してください。");return value as Record<string,unknown>};
function keys(v:Record<string,unknown>,allowed:string[]){if(Object.keys(v).some(k=>!allowed.includes(k)))throw new CommercialError("変更できない項目が含まれています。");}
export function date(value:unknown):string {if(typeof value!=="string"||!/^20\d{2}-\d{2}-\d{2}$/.test(value)||(!Number.isFinite(Date.parse(value+"T00:00:00Z"))||new Date(value+"T00:00:00Z").toISOString().slice(0,10)!==value))throw new CommercialError("日付を確認してください。");return value;}
function id(v:unknown){if(typeof v!=="string"||!v||v.length>200||/[\x00-\x1f]/.test(v))throw new CommercialError("対象店舗を確認してください。");return v;}
function money(v:unknown){if(!Number.isSafeInteger(v)||Number(v)<0||Number(v)>999999999)throw new CommercialError("金額は0〜999,999,999円の整数で入力してください。");return Number(v);}
export function revision(v:unknown){if(!Number.isSafeInteger(v)||Number(v)<1||Number(v)>2147483646)throw new CommercialError("更新情報がありません。再読込してください。");return Number(v);}
export function parseInvoice(value:unknown):InvoiceInput {const v=object(value);keys(v,["id","site_id","kind","period","amount_yen","due_on"]);if(typeof v.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.id))throw new CommercialError("請求の識別情報を確認してください。");if(!["initial","monthly"].includes(String(v.kind))||typeof v.period!=="string"||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(v.period))throw new CommercialError("費目と対象月を確認してください。");return{id:v.id,site_id:id(v.site_id),kind:v.kind as InvoiceKind,period:v.period,amount_yen:money(v.amount_yen),due_on:date(v.due_on)};}
export function parseTerms(value:unknown):Omit<CommercialTerms,"revision"|"updated_at"> & {expected_revision:number|null} {const v=object(value);keys(v,["site_id","initial_fee_yen","renewal_on","cancellation_on","notes","expected_revision"]);if(typeof v.notes!=="string"||v.notes.length>2000||/[\x00-\x08]/.test(v.notes))throw new CommercialError("契約メモは2000文字以内で入力してください。");return{site_id:id(v.site_id),initial_fee_yen:money(v.initial_fee_yen),renewal_on:v.renewal_on===null?null:date(v.renewal_on),cancellation_on:v.cancellation_on===null?null:date(v.cancellation_on),notes:v.notes,expected_revision:v.expected_revision===null?null:revision(v.expected_revision)};}
export function parseTransition(value:unknown):{id:string;expected_revision:number;status:InvoiceStatus;paid_on:string|null} {const v=object(value);keys(v,["id","expected_revision","status","paid_on"]);if(!["issued","paid","void"].includes(String(v.status)))throw new CommercialError("請求状態を確認してください。");if(v.status!=="paid"&&v.paid_on!==null)throw new CommercialError("入金日を確認してください。");return{id:id(v.id),expected_revision:revision(v.expected_revision),status:v.status as InvoiceStatus,paid_on:v.status==="paid"?date(v.paid_on):null};}
export function canTransition(from:InvoiceStatus,to:InvoiceStatus){return from==="draft"&&(to==="issued"||to==="void")||from==="issued"&&(to==="paid"||to==="void");}
export function overdue(invoice:ManualInvoice,today:string){return invoice.status==="issued"&&invoice.due_on<today;}
export function nextMonth(period:string){if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period))throw new CommercialError("対象月を確認してください。");const [y,m]=period.split('-').map(Number);return new Date(Date.UTC(y,m,1)).toISOString().slice(0,7);}
export function sameInvoice(a:InvoiceInput,b:InvoiceInput){return (["id","site_id","kind","period","amount_yen","due_on"] as const).every(k=>a[k]===b[k]);}
