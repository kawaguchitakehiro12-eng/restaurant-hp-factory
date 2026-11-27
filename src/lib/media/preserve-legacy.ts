import 'server-only';
import {ensureMigrationBackup,type BackupStore} from './migration-backup';
import type {MigrationLedger,MigrationSnapshot} from './migration-runner';
/** Normal edits must also preserve any existing Base64 before reference conversion. */
export async function preserveLegacy(site:string,snapshot:MigrationSnapshot,ledger:MigrationLedger,backup:BackupStore,secret:string){if(!JSON.stringify(snapshot.content).includes('data:image/'))return;
 let job=await ledger.open(site,snapshot);if(job.state==='switched'||job.state==='conflict')throw Error('MEDIA_LEGACY_CONFLICT');const archived=await ensureMigrationBackup(job.id,snapshot.content,backup,secret);
 if(!job.backup_key)job=await ledger.record({...job,backup_key:archived.key,backup_sha:archived.sha},job.revision);
 if(job.backup_key!==archived.key||job.backup_sha!==archived.sha)throw Error('MEDIA_BACKUP_CHANGED');
 return job.id;
}
