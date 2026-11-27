export const STORE_LIMIT = 50_000_000;
export type Asset = {id:string;site:string;key:string;bytes:number;format:'webp';width:number;height:number;hash:string;state:'reserved'|'ready'|'retired'|'review';created:number};
export type Policy = {site:string;revision:number;published:boolean;demoUntil:number|null;contractEnds:number|null;validUntil:number;assets:string[];previewAssets?:string[];shareEpoch?:string};
export type MediaState = {revision:number;assets:Asset[];policy:Policy|null};
/** The implementation must provide a serializable, durable transaction per site. */
export interface MetadataStore {transaction<T>(site:string,action:(state:MediaState)=>T):Promise<T>;read(site:string):Promise<MediaState>}
export interface ObjectStore {put(key:string,bytes:Uint8Array,type:string):Promise<void>;get(key:string):Promise<Uint8Array|null>;remove(key:string):Promise<void>}
export function identifier(value:string):string {if(!/^[a-zA-Z0-9_-]{1,100}$/.test(value))throw Error('MEDIA_INPUT');return value;}
export function objectKey(site:string,id:string):string{return `sites/${identifier(site)}/${identifier(id)}.webp`;}
export function permit(p:Policy,now:number):boolean{return p.validUntil>now&&(p.published||(p.demoUntil!==null&&p.demoUntil>now))&&(p.contractEnds===null||p.contractEnds>now);}
export function validPolicy(value:unknown,site:string,now:number):value is Policy {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;const p=value as Policy;
 const ids=(v:unknown)=>Array.isArray(v)&&v.length<=2000&&new Set(v).size===v.length&&v.every(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id));
 return p.site===site&&/^[a-zA-Z0-9_-]{1,100}$/.test(p.site)&&Number.isSafeInteger(p.revision)&&p.revision>0&&typeof p.published==='boolean'&&Number.isFinite(p.validUntil)&&p.validUntil>now&&p.validUntil<=now+86400000&&[p.demoUntil,p.contractEnds].every(v=>v===null||Number.isFinite(v))&&ids(p.assets)&&(p.previewAssets===undefined||ids(p.previewAssets))&&(p.shareEpoch===undefined||/^[a-f0-9]{64}$/.test(p.shareEpoch));
}
