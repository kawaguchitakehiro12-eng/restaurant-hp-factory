import {MINIMUM_TERM_MONTHS} from "@/lib/admin/contract-templates";
import {firstCancellationDate} from "@/lib/operations/model";
/** New contracts use six calendar months. Historical records remain unchanged. */
export function isMinimumTermMonths(value:unknown):value is number {return value===MINIMUM_TERM_MONTHS;}
export function resolveMinimumTermMonths(value:unknown):number {if(value!==undefined&&!isMinimumTermMonths(value))throw new Error('最低利用期間は契約開始月を含む6か月です。');return MINIMUM_TERM_MONTHS;}
export function minimumTermEndDate(start:string):string {const end=new Date(firstCancellationDate(start)+'T00:00:00Z');end.setUTCDate(end.getUTCDate()-1);return end.toISOString().slice(0,10);}
