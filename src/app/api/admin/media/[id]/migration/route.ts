import {requireOperatorApi} from '@/lib/auth/operator';
import {isSameOriginRequest} from '@/lib/auth/request-origin';
import {readOperatorJson} from '@/lib/api/operator-input';
import {developmentMedia,mediaDevelopmentEnabled,runDevelopmentMediaSync} from '@/lib/media/development-service';
import {SupabaseMigrationLedger} from '@/lib/media/migration-ledger';
import {runImageMigration,type MigrationSnapshot} from '@/lib/media/migration-runner';
import {decryptMigrationBackup} from '@/lib/media/migration-backup';
import {mediaUrl} from '@/lib/media/reference';
import {getDemoSiteRepository} from '@/lib/repositories';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
type Context={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:Context){const denied=await requireOperatorApi();if(denied)return denied;try{
 if(!mediaDevelopmentEnabled())throw Error();if(!isSameOriginRequest(request))return Response.json({error:'拒否されました。'},{status:403,headers});
 const site=(await params).id;if(!await getDemoSiteRepository().findById(site))return Response.json({error:'店舗が見つかりません。'},{status:404,headers});
 const body=await readOperatorJson(request,2000);if(Object.keys(body).some(k=>!['action','jobId'].includes(k))||!['start','resume'].includes(String(body.action)))throw Error();
 const ledger=new SupabaseMigrationLedger(),{workflow,objects}=developmentMedia('operator',site),secret=process.env.MEDIA_MIGRATION_BACKUP_KEY??'';let snapshot:MigrationSnapshot;
 if(body.action==='resume'){if(typeof body.jobId!=='string'||!/^[a-f0-9]{64}$/.test(body.jobId))throw Error();const job=await ledger.get(body.jobId,site);if(job.state==='switched')return Response.json({state:'switched',replayed:true},{headers});const archive=await objects.readBackup(job.id);if(!archive)throw Error('MEDIA_BACKUP_MISSING');snapshot={content:decryptMigrationBackup(archive,secret),revision:job.source_revision,sha:job.source_sha};}
 else{snapshot=await ledger.snapshot(site);if(!JSON.stringify(snapshot.content).includes('data:image/'))return Response.json({state:'already-managed'},{headers});}
 const result=await runImageMigration({site,actor:'operator',snapshot,ledger,workflow,backup:objects,backupSecret:secret,url:id=>mediaUrl(site,id),stage:async()=>{await runDevelopmentMediaSync();},resume:body.action==='resume'});
 await runDevelopmentMediaSync();return Response.json(result,{headers});
 }catch{return Response.json({error:'移行状態を確認してください。旧画像と台帳は削除しません。再開前に台帳を確認してください。'},{status:503,headers});}}
export async function GET(_request:Request,{params}:Context){const denied=await requireOperatorApi();if(denied)return denied;try{if(!mediaDevelopmentEnabled())throw Error();const site=(await params).id;developmentMedia('operator',site);const {createAdminDbClient}=await import('@/lib/supabase/admin');const {data,error}=await createAdminDbClient().from('media_migration_jobs').select('id,state,revision,updated_at').eq('site_id',site).order('updated_at',{ascending:false}).limit(20);if(error)throw Error();return Response.json({jobs:data},{headers});}catch{return Response.json({error:'台帳を確認できません。'},{status:503,headers});}}
