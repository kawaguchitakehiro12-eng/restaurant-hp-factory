import {MINIMUM_TERM_MONTHS} from "@/lib/admin/contract-templates";
/** Positive whole calendar months only; this input bound is not a contract offer. */
export function isMinimumTermMonths(value:unknown):value is number {return typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=120;}
export function resolveMinimumTermMonths(value:unknown):number {const months=value===undefined?MINIMUM_TERM_MONTHS:value;if(!isMinimumTermMonths(months))throw new Error('最低利用期間は1〜120か月の整数で入力してください。');return months;}
