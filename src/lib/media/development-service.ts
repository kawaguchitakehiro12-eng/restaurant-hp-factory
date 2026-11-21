import 'server-only';
import {assertMockMode} from '@/lib/commerce/providers';
import {ImageWorkflow} from './workflow';
import {DurableMetadata} from './metadata';
import {SupabaseMediaDatabase} from './supabase-metadata';
import {HttpObjects} from './http-objects';
import {mediaUrl} from './reference';
import {migrateImages} from './migrate';
import {SupabaseSnapshotSource} from './snapshot-supabase';
import {synchronizeMedia} from './synchronize';
import {SupabaseMigrationLedger} from './migration-ledger';
import {preserveLegacy} from './preserve-legacy';
/** Deliberately unavailable in Vercel/production; no implicit backend fallback. */
export function mediaDevelopmentEnabled(){return process.env.MEDIA_STORAGE_MODE==='development';}
export function developmentMedia(actor:string,site:string){assertMockMode();if(process.env.NODE_ENV==='production'||process.env.VERCEL)throw Error('MEDIA_DEVELOPMENT_ONLY');const origin=process.env.NEXT_PUBLIC_MEDIA_ORIGIN??'',secret=process.env.MEDIA_CONTROL_SECRET??'';const metadata=new DurableMetadata(new SupabaseMediaDatabase()),objects=new HttpObjects(origin,secret);return {metadata,objects,workflow:new ImageWorkflow(metadata,objects,async(a,s)=>a===actor&&s===site)};}
export async function prepareDevelopmentContent(content:unknown,actor:string,site:string){const {workflow,objects}=developmentMedia(actor,site),ledger=new SupabaseMigrationLedger(),snapshot=await ledger.snapshot(site);await preserveLegacy(site,snapshot,ledger,objects,process.env.MEDIA_MIGRATION_BACKUP_KEY??'');return migrateImages(content,actor,site,workflow,new Map(),id=>mediaUrl(site,id));}
/** Invoke after content CAS and periodically from an isolated scheduler (<=30s). */
const syncSource=new SupabaseSnapshotSource();
export async function syncDevelopmentPolicy(actor:string,site:string,_slug:string,_stagedContent?:unknown){void _slug;void _stagedContent;const {objects}=developmentMedia(actor,site);return synchronizeMedia(syncSource,objects);}
export async function runDevelopmentMediaSync(){const {objects}=developmentMedia('system','system');return synchronizeMedia(syncSource,objects);}
