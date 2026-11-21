import 'server-only';
import {createHash} from 'node:crypto';
import type {ImageWorkflow} from './workflow';
/** Caller owns durable journal and content CAS. Failure never mutates old content. */
export interface MigrationEntries {get(key:string):string|undefined|Promise<string|undefined>;set(key:string,value:string):unknown|Promise<unknown>}
export async function migrateImages(content:unknown,actor:string,site:string,workflow:ImageWorkflow,journal:MigrationEntries,makeUrl:(id:string)=>string){
 const copy=structuredClone(content);
 async function walk(value:unknown,logo=false):Promise<unknown>{
 if(typeof value==='string'&&value.startsWith('data:image/')){const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);if(!match||match[2].length>11_000_000)throw Error('MEDIA_MIGRATION_INPUT');const bytes=Buffer.from(match[2],'base64');if(bytes.toString('base64')!==match[2])throw Error('MEDIA_MIGRATION_INPUT');const fingerprint=createHash('sha256').update(site+'\0'+String(logo)+'\0'+value).digest('hex');const known=await journal.get(fingerprint);if(known)return known;const a=await workflow.upload(actor,site,bytes,match[1],logo),url=makeUrl(a.id);await journal.set(fingerprint,url);return url;}
 if(Array.isArray(value)){const result:unknown[]=[];for(const v of value)result.push(await walk(v));return result;}
 if(value&&typeof value==='object'){const out:Record<string,unknown>={};for(const [k,v]of Object.entries(value))out[k]=await walk(v,k==='logo');return out;}return value;
 }
 return walk(copy);
}
