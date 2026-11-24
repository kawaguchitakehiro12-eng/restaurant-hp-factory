import {safeLogo} from '@/lib/images/logo';
import { createEmptyDemoContent } from "@/types/demo-content";
import type { CustomerContent } from "@/types/customer-site";

export class CustomerInputError extends Error {}
type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CustomerInputError("入力形式が正しくありません。");
  return value as RecordValue;
}
function keys(value: RecordValue, allowed: string[]) {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new CustomerInputError("変更できない項目が含まれています。");
}
function text(value: unknown, max = 4000): string {
  if (typeof value !== "string" || value.length > max || /\u0000/.test(value)) throw new CustomerInputError("文字数または入力形式を確認してください。");
  return value;
}
function array(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new CustomerInputError(`項目は${max}件以内にしてください。`);
  return value;
}
function bool(value: unknown): boolean {
  if (typeof value !== "boolean") throw new CustomerInputError("表示設定が正しくありません。");
  return value;
}
function order(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 10000) throw new CustomerInputError("表示順が正しくありません。");
  return value;
}
function unique<T extends {id:string}>(items:T[]):T[] {
  if (items.some(x=>!x.id) || new Set(items.map(x=>x.id)).size!==items.length) throw new CustomerInputError("項目IDが重複しています。");
  return items;
}
export function safeUrl(value: unknown, image = false): string {
  const url = text(value, image ? 4_000_000 : 2048).trim();
  if (!url) return "";
  if (image && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(url)) return url;
  if (/[\\\u0000-\u0020]/.test(url)) throw new CustomerInputError("URLの形式を確認してください。");
  if (image && url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw Error();
    return url;
  } catch { throw new CustomerInputError("httpまたはhttpsのURLを入力してください。"); }
}
export function parseCustomerContent(value: unknown): CustomerContent {
  const input=record(value);
  keys(input,["basicInfo","photos","menus","topics"]);
  const basic=record(input.basicInfo),empty=createEmptyDemoContent();
  keys(basic,Object.keys(empty.basicInfo));
  const basicInfo={...empty.basicInfo};
  for(const key of Object.keys(empty.basicInfo) as (keyof typeof basicInfo)[]) {
    if(key==="subCopyLines") basicInfo.subCopyLines=array(basic[key],12).map(x=>text(x,500));
    else if(["mapEmbedUrl","instagramUrl","reservationUrl"].includes(key)) basicInfo[key]=safeUrl(basic[key]);
    else basicInfo[key]=text(basic[key]);
  }
  if(basicInfo.mapEmbedUrl) {
    const map=new URL(basicInfo.mapEmbedUrl);
    if(!["www.google.com","maps.google.com","www.google.co.jp"].includes(map.hostname) || !map.pathname.startsWith("/maps")) throw new CustomerInputError("地図にはGoogleマップの埋め込みURLを入力してください。");
  }
  const photo=record(input.photos);
  keys(photo,["logo","hero","interior","food","exterior","gallery","heroFit","heroObjectPosition"]);
  if(photo.heroFit!==undefined && !["cover","contain"].includes(String(photo.heroFit))) throw new CustomerInputError("写真表示の設定が正しくありません。");
  const positions=["center center","center top","center bottom","left center","right center"] as const;
  if(photo.heroObjectPosition!==undefined && !positions.includes(photo.heroObjectPosition as typeof positions[number])) throw new CustomerInputError("写真の位置が正しくありません。");
  const photos:CustomerContent["photos"]={logo:safeLogo(photo.logo),hero:safeUrl(photo.hero,true),interior:safeUrl(photo.interior,true),food:safeUrl(photo.food,true),exterior:safeUrl(photo.exterior,true),
    heroFit:photo.heroFit as "cover"|"contain"|undefined,heroObjectPosition:photo.heroObjectPosition as typeof positions[number]|undefined,
    gallery:unique(array(photo.gallery,40).map(value=>{const x=record(value);keys(x,["id","url","alt","caption","sortOrder"]);return {id:text(x.id,100),url:safeUrl(x.url,true),alt:text(x.alt,300),caption:text(x.caption,1000),sortOrder:order(x.sortOrder)};}))};
  const menus=unique(array(input.menus,100).map(value=>{const x=record(value);keys(x,["id","name","price","description","imageUrl","visible","sortOrder"]);return {id:text(x.id,100),name:text(x.name,200),price:text(x.price,80),description:text(x.description,2000),imageUrl:safeUrl(x.imageUrl,true),visible:bool(x.visible),sortOrder:order(x.sortOrder)};}));
  const topics=unique(array(input.topics,100).map(value=>{const x=record(value);keys(x,["id","title","body","date","visible"]);const date=text(x.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new CustomerInputError("日付を確認してください。");return {id:text(x.id,100),title:text(x.title,200),body:text(x.body,4000),date,visible:bool(x.visible)};}));
  return {basicInfo,photos,menus,topics};
}

export function parseCustomerSave(value:unknown):{content:CustomerContent;revision:string|null} {
  const input=record(value);keys(input,["content","revision"]);
  if(input.revision!==null && (typeof input.revision!=="string" || !/^\d{4}-\d{2}-\d{2}T/.test(input.revision) || !Number.isFinite(Date.parse(input.revision)))) throw new CustomerInputError("更新状態を確認できません。再読み込みしてください。");
  return {content:parseCustomerContent(input.content),revision:input.revision as string|null};
}
