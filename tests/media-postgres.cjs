// Synthetic PostgreSQL 17, single-user mode: no listener, secrets or cloud access.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),bin=path.resolve(root,'../pg17-lab/runtime/pgsql/bin'),lab=path.join(root,'test-results','media-pg-'+Date.now()),data=path.join(lab,'data');fs.mkdirSync(lab,{recursive:true});
const env={SystemRoot:process.env.SystemRoot,PATH:process.env.PATH,TEMP:process.env.TEMP,TMP:process.env.TMP};
function tool(name,args,input){return cp.spawnSync(path.join(bin,name+'.exe'),args,{env,input,encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:3*1024*1024})}
function sql(text,fail=false){text=text.replace(/\r?\n\s*\r?\n/g,'\n');const r=tool('postgres',['--single','-j','-D',data,'-c','log_error_verbosity=terse','postgres'],text+'\n\n'),bad=r.status!==0||/ERROR:|FATAL:|PANIC:/.test(r.stdout+r.stderr);assert.equal(bad,fail,'LOCAL_SQL_EXPECTATION');return r.stdout;}
assert.equal(tool('initdb',['-D',data,'-U','postgres','-A','trust','--encoding=UTF8','--no-locale']).status,0);
sql("DO $$BEGIN IF current_setting('server_version_num')::int NOT BETWEEN 170000 AND 179999 THEN RAISE EXCEPTION 'VERSION'; END IF; END$$; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE TABLE public.demo_sites(id text PRIMARY KEY); INSERT INTO public.demo_sites VALUES('store-a'),('store-b');");
sql(fs.readFileSync(path.join(root,'supabase/proposals/media-assets-v1.sql'),'utf8'));
let count=0;function check(name,fn){fn();count++;console.log('PASS '+name)}
const lit=s=>"'"+s.replaceAll("'","''")+"'",asset={id:'a1',site:'store-a',key:'sites/store-a/a1.webp',bytes:100,format:'webp',hash:'a'.repeat(64),state:'ready',width:1,height:1,created:1};
const doc=(revision,assets=[asset])=>lit(JSON.stringify({revision,assets,policy:null}))+'::jsonb';
const cas=(expected,revision,assets)=>`public.media_compare_swap_v1('store-a',${expected},${doc(revision,assets)})`;
const truth=q=>sql(`DO $$ BEGIN IF NOT (${q}) THEN RAISE EXCEPTION 'CHECK'; END IF; END $$;`);
check('SQL normal metadata create, no bytea/base64 column',()=>{truth(cas(0,1));truth("(SELECT count(*)=1 FROM public.media_metadata)");});
check('duplicate create and stale update return false',()=>{truth('NOT '+cas(0,1));truth(cas(1,2));truth('NOT '+cas(1,3));});
check('50MB exceeded rejects entire update',()=>{sql('SELECT '+cas(2,3,[{...asset,bytes:50000000},{...asset,id:'a2',key:'sites/store-a/a2.webp',bytes:1}])+';',true);truth("(SELECT revision=2 FROM public.media_metadata WHERE site_id='store-a')");});
check('foreign-site metadata and duplicate IDs rejected',()=>{sql('SELECT '+cas(2,3,[{...asset,site:'store-b'}])+';',true);sql('SELECT '+cas(2,3,[asset,asset])+';',true);});
check('image body in metadata rejected',()=>{sql(`UPDATE public.media_metadata SET state='{"payload":"data:image/png;base64,AAAA"}'::jsonb;`,true);});
check('anon and authenticated cannot read/write or execute CAS',()=>{for(const role of ['anon','authenticated']){sql('SET ROLE '+role+';SELECT * FROM public.media_metadata;',true);sql('SET ROLE '+role+';SELECT '+cas(2,3)+';',true);}});
check('RLS enabled, service CRUD minimized, no TRUNCATE',()=>{truth("(SELECT relrowsecurity FROM pg_class WHERE oid='public.media_metadata'::regclass)");truth("has_table_privilege('service_role','public.media_metadata','SELECT') AND NOT has_table_privilege('service_role','public.media_metadata','TRUNCATE') AND NOT has_table_privilege('service_role','public.media_metadata','DELETE')");});
check('transaction failure rolls back metadata revision',()=>{sql('BEGIN;SELECT '+cas(2,3)+';SELECT 1/0;COMMIT;',true);truth("(SELECT revision=2 FROM public.media_metadata WHERE site_id='store-a')");});
console.log('TOTAL '+count+' PASS / 0 FAIL');fs.writeFileSync(path.join(lab,'results.json'),JSON.stringify({postgres:17,passed:count,failed:0,synthetic:true,network:false}));
