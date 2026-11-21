import 'server-only';
import type {ImageWorkflow} from './workflow';
import {migrateImages} from './migrate';
import {mediaReference} from './reference';
import {ensureMigrationBackup,type BackupStore} from './migration-backup';
export type MigrationSnapshot={content:unknown;revision:string;sha:string};
export type MigrationJob={id:string;site_id:string;source_revision:string;source_sha:string;revision:number;state:'planned'|'prepared'|'switched'|'conflict'|'review';entries:Record<string,string>;target:unknown|null;backup_key:string|null;backup_sha:string|null};
export interface MigrationLedger {
 open(site:string,snapshot:MigrationSnapshot):Promise<MigrationJob>;
 record(job:MigrationJob,expected:number):Promise<MigrationJob>;
 switch(job:MigrationJob):Promise<'switched'|'conflict'>;
}
export async function runImageMigration(input:{site:string;actor:string;snapshot:MigrationSnapshot;ledger:MigrationLedger;workflow:ImageWorkflow;backup:BackupStore;backupSecret:string;url:(id:string)=>string;stage:(target:unknown)=>Promise<void>;resume?:boolean}){
 let job=await input.ledger.open(input.site,input.snapshot);if(job.state==='switched')return {state:'switched',replayed:true};if(job.state==='conflict')throw Error('MEDIA_MIGRATION_CONFLICT');if(job.state==='review'&&!input.resume)throw Error('MEDIA_MIGRATION_REVIEW');
 try{
 const archive=await ensureMigrationBackup(job.id,input.snapshot.content,input.backup,input.backupSecret);
 if(job.backup_key!==archive.key||job.backup_sha!==archive.sha){job=await input.ledger.record({...job,backup_key:archive.key,backup_sha:archive.sha},job.revision);}
 for(const url of Object.values(job.entries)){const r=mediaReference(url);if(!r||r.site!==input.site)throw Error('MEDIA_LEDGER');await input.workflow.verify(input.actor,input.site,r.id);}
 if(job.state!=='prepared'){
 const target=await migrateImages(input.snapshot.content,input.actor,input.site,input.workflow,{async get(key){const url=job.entries[key];if(!url)return;const r=mediaReference(url);if(!r||r.site!==input.site)throw Error('MEDIA_LEDGER');await input.workflow.verify(input.actor,input.site,r.id);return url;},async set(key,value){job=await input.ledger.record({...job,state:'planned',entries:{...job.entries,[key]:value}},job.revision);}},input.url);
 job=await input.ledger.record({...job,state:'prepared',target},job.revision);
 }
 await input.stage(job.target);const state=await input.ledger.switch(job);if(state==='conflict')throw Error('MEDIA_MIGRATION_CONFLICT');return {state,replayed:false};
 }catch{if(job.state!=='switched'){try{await input.ledger.record({...job,state:'review'},job.revision);}catch{/* Unknown/competing commit: keep durable state; no automatic overwrite. */}}throw Error('MEDIA_MIGRATION_REVIEW');}
}
