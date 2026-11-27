import 'server-only';
import {createHash} from 'node:crypto';
import {createAdminDbClient} from '@/lib/supabase/admin';
import type {MigrationJob,MigrationLedger,MigrationSnapshot} from './migration-runner';
async function rpc<T>(name:string,args:Record<string,unknown>):Promise<T>{const {data,error}=await createAdminDbClient().rpc(name,args);if(error||data===null)throw Error('MEDIA_LEDGER_UNKNOWN');return data as T;}
export class SupabaseMigrationLedger implements MigrationLedger {
 snapshot(site:string){return rpc<MigrationSnapshot>('media_migration_snapshot_v2',{p_site:site});}
 async open(site:string,s:MigrationSnapshot){const id=createHash('sha256').update(JSON.stringify([site,s.revision,s.sha])).digest('hex');return rpc<MigrationJob>('media_migration_open_v2',{p_id:id,p_site:site,p_revision:s.revision,p_sha:s.sha});}
 record(job:MigrationJob,expected:number){return rpc<MigrationJob>('media_migration_record_v2',{p_job:job.id,p_expected:expected,p_record:{state:job.state,entries:job.entries,target:job.target,backup_key:job.backup_key,backup_sha:job.backup_sha}});}
 switch(job:MigrationJob){return rpc<'switched'|'conflict'>('media_migration_switch_v2',{p_job:job.id,p_expected:job.revision});}
 async get(id:string,site:string){const {data,error}=await createAdminDbClient().from('media_migration_jobs').select('*').eq('id',id).eq('site_id',site).maybeSingle();if(error||!data)throw Error('MEDIA_LEDGER_MISSING');return data as MigrationJob;}
}
