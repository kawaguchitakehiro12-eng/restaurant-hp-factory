import 'server-only';
import {assertMockMode} from '@/lib/commerce/providers';
import {ImageWorkflow} from './workflow';
import {DurableMetadata} from './metadata';
import {SupabaseMediaDatabase} from './supabase-metadata';
import {HttpObjects} from './http-objects';
import {mediaReference,mediaUrl} from './reference';
import {migrateImages} from './migrate';
import {getDemoSiteRepository} from '@/lib/repositories';
import {isPublicSiteVisible} from '@/lib/stores/site-visibility';
/** Deliberately unavailable in Vercel/production; no implicit backend fallback. */
export function mediaDevelopmentEnabled(){return process.env.MEDIA_STORAGE_MODE==='development';}
export function developmentMedia(actor:string,site:string){assertMockMode();if(process.env.NODE_ENV==='production'||process.env.VERCEL)throw Error('MEDIA_DEVELOPMENT_ONLY');const origin=process.env.NEXT_PUBLIC_MEDIA_ORIGIN??'',secret=process.env.MEDIA_CONTROL_SECRET??'';const metadata=new DurableMetadata(new SupabaseMediaDatabase()),objects=new HttpObjects(origin,secret);return {metadata,objects,workflow:new ImageWorkflow(metadata,objects,async(a,s)=>a===actor&&s===site)};}
export async function prepareDevelopmentContent(content:unknown,actor:string,site:string){const {workflow}=developmentMedia(actor,site);return migrateImages(content,actor,site,workflow,new Map(),id=>mediaUrl(site,id));}
/** Invoke after content CAS and periodically from an isolated scheduler (<=30s). */
export async function syncDevelopmentPolicy(actor:string,site:string,slug:string,stagedContent?:unknown){const {metadata,objects,workflow}=developmentMedia(actor,site),current=await getDemoSiteRepository().findBySlug(slug);if(!current||current.id!==site)throw Error('MEDIA_DENIED');const ids=new Set<string>();function collect(v:unknown){if(typeof v==='string'){const r=mediaReference(v);if(r){if(r.site!==site)throw Error('MEDIA_DENIED');ids.add(r.id);}}else if(Array.isArray(v))v.forEach(collect);else if(v&&typeof v==='object')Object.values(v).forEach(collect);}collect(current.content);if(stagedContent)collect(stagedContent);const snapshot=await metadata.read(site);const p=await workflow.policy(actor,site,{published:isPublicSiteVisible(current),demoUntil:null,contractEnds:null,validUntil:Date.now()+60000},[...ids],snapshot.revision);await objects.publish(p);}
