function requiredLabPath(){if(!process.env.SAKUPAGE_PG_LAB_DIR)throw Error('Set SAKUPAGE_PG_LAB_DIR to a dedicated synthetic lab folder');return process.env.SAKUPAGE_PG_LAB_DIR;}
const fs=require('fs'),path=require('path'),cp=require('child_process');
const BASE=path.resolve(requiredLabPath()),BIN=path.join(BASE,'runtime/pgsql/bin');
if(!fs.existsSync(path.join(BASE,'.sakupage-synthetic-lab')))throw Error('Dedicated synthetic lab marker missing');
function environment(db='sakupage_empty'){const env={...process.env};for(const k of Object.keys(env))if(/^(PG|SUPABASE|NEXT_PUBLIC_)/.test(k))delete env[k];return{...env,PGHOST:'127.0.0.1',PGPORT:'54392',PGUSER:'postgres',PGDATABASE:db,PGPASSWORD:JSON.parse(fs.readFileSync(path.join(BASE,'local-credential.json'))).password,PGSSLMODE:'disable',PGCONNECT_TIMEOUT:'5',PGOPTIONS:'-c statement_timeout=15000 -c lock_timeout=5000',PGCLIENTENCODING:'UTF8'};}
function command(exe,args,{db='sakupage_empty',input,allowFailure=false}={}){const r=cp.spawnSync(path.join(BIN,exe+'.exe'),args,{env:environment(db),encoding:'utf8',windowsHide:true,input,timeout:30000,maxBuffer:4e6});if(!allowFailure&&r.status!==0)throw Error((r.stderr||r.stdout||r.error?.message||'command failed').trim());return r;}
function sql(text,opts={}){return command('psql',['-X','-v','ON_ERROR_STOP=1','-tA'],{...opts,input:text}).stdout.trim()}
function file(p,db='sakupage_empty'){return command('psql',['-X','-v','ON_ERROR_STOP=1','-f',p],{db}).stdout}
function parallel(text,db='sakupage_empty',label='sakupage-parallel'){return new Promise(resolve=>{const p=cp.spawn(path.join(BIN,'psql.exe'),['-X','-v','ON_ERROR_STOP=1','-tA'],{env:{...environment(db),PGAPPNAME:label},windowsHide:true});let stdout='',stderr='';p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);p.on('close',status=>resolve({status,stdout,stderr}));p.stdin.end(text);});}
function verifyCluster(){const actual=sql('show data_directory',{db:'postgres'});if(path.resolve(actual).toLowerCase()!==path.join(BASE,'data').toLowerCase())throw Error('Port belongs to a different cluster');}

async function hold(text,db='sakupage_empty',label='sakupage-hold'){
 const p=cp.spawn(path.join(BIN,'psql.exe'),['-X','-qAt','-v','ON_ERROR_STOP=1'],{env:{...environment(db),PGAPPNAME:label},windowsHide:true});
 let output='';p.stderr.resume();const done=new Promise(resolve=>{p.on('close',status=>resolve({status}));p.on('error',()=>resolve({status:-1}))});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{p.kill();reject(Error('Hold connection not ready'))},10000);p.stdout.on('data',x=>{output+=x.toString();if(output.includes('SAKUPAGE_HOLD_READY')){clearTimeout(timer);resolve()}});p.once('close',()=>{clearTimeout(timer);if(!output.includes('SAKUPAGE_HOLD_READY'))reject(Error('Hold SQL failed'))});p.stdin.write(text+"\nselect 'SAKUPAGE_HOLD_READY';\n");});
 return{done,release:async()=>{p.stdin.end('commit;\n');return done}};
}
async function waitForLock(label='sakupage-parallel'){
 const until=Date.now()+8000;while(Date.now()<until){if(sql("select count(*)from pg_stat_activity where application_name='"+label.replaceAll("'","''")+"'and wait_event_type='Lock'")!=='0')return;await new Promise(r=>setTimeout(r,50));}throw Error('Concurrent worker did not reach DB lock');
}

module.exports={hold,waitForLock,BASE,BIN,environment,command,sql,file,parallel,verifyCluster};
