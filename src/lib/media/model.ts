export const STORE_LIMIT = 50_000_000;
export type Asset = {id:string;site:string;key:string;bytes:number;format:'webp';width:number;height:number;hash:string;state:'reserved'|'ready'|'retired'|'review';created:number};
export type Policy = {site:string;revision:number;published:boolean;demoUntil:number|null;contractEnds:number|null;validUntil:number;assets:string[]};
export type MediaState = {revision:number;assets:Asset[];policy:Policy|null};
/** The implementation must provide a serializable, durable transaction per site. */
export interface MetadataStore {transaction<T>(site:string,action:(state:MediaState)=>T):Promise<T>;read(site:string):Promise<MediaState>}
export interface ObjectStore {put(key:string,bytes:Uint8Array,type:string):Promise<void>;get(key:string):Promise<Uint8Array|null>;remove(key:string):Promise<void>}
export function identifier(value:string):string {if(!/^[a-zA-Z0-9_-]{1,100}$/.test(value))throw Error('MEDIA_INPUT');return value;}
export function objectKey(site:string,id:string):string{return `sites/${identifier(site)}/${identifier(id)}.webp`;}
export function permit(p:Policy,now:number):boolean{return p.validUntil>now&&(p.published||(p.demoUntil!==null&&p.demoUntil>now))&&(p.contractEnds===null||p.contractEnds>now);}
