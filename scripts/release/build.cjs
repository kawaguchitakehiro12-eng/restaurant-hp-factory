'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {scanArtifacts}=require('./scan-artifacts.cjs');
const flags={DEMO_DELIVERY_MODE:'disabled',MANUAL_BILLING_ENABLED:'false',SALES_OPERATIONS_ENABLED:'false',MEDIA_STORAGE_MODE:'disabled',SAKUPAGE_COMMERCE_MODE:'disabled'};
function validate(env){
 if(env.VERCEL_ENV&&env.VERCEL_ENV!=='production')throw Error('RELEASE_ENVIRONMENT_REJECTED');
 if(env.NEXT_PUBLIC_SAKUPAGE_PREVIEW_ONLY!==undefined)throw Error('RELEASE_PREVIEW_MARKER_REJECTED');
 if(env.NEXT_PUBLIC_SUPABASE_URL!=='https://noxabdulnciuezartiuj.supabase.co')throw Error('RELEASE_DATABASE_TARGET_REJECTED');
 const app=new URL(env.NEXT_PUBLIC_APP_URL??'');
 if(app.origin!=='https://restaurant-hp-factory.vercel.app'||app.username||app.password||app.search||app.hash||app.pathname!=='/')throw Error('RELEASE_APP_ORIGIN_REJECTED');
 for(const [name,value]of Object.entries(flags))if(env[name]!==value)throw Error('RELEASE_FEATURE_FLAGS_REJECTED');
 if(env.OPERATOR_ATOMIC_WRITES_ENABLED!=='true')throw Error('RELEASE_ATOMIC_WRITES_REQUIRED');
 for(const [name,role]of [['NEXT_PUBLIC_SUPABASE_ANON_KEY','anon'],['SUPABASE_SERVICE_ROLE_KEY','service_role']]){
  const key=env[name],prefix=role==='anon'?'sb_publishable_':'sb_secret_';
  if(typeof key!=='string'||key.length>8192)throw Error('RELEASE_KEY_ROLE_REJECTED');
  if(key.startsWith(prefix)&&/^sb_(publishable|secret)_[A-Za-z0-9_-]+$/.test(key))continue;
  try{const pieces=key.split('.');if(pieces.length!==3)throw Error();const claims=JSON.parse(Buffer.from(pieces[1],'base64url'));if(claims.iss!=='supabase'||claims.role!==role||claims.ref!=='noxabdulnciuezartiuj')throw Error();}catch{throw Error('RELEASE_KEY_ROLE_REJECTED');}
 }
 // Opaque key provenance and the DB backup/RPC audit require separate review.
 return true;
}
function buildEnvironment(parent){
 const env={};for(const name of ['PATH','SystemRoot','WINDIR','COMSPEC','HOME','TMPDIR','TEMP','TMP','CI','VERCEL','VERCEL_ENV','VERCEL_URL','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_COMMIT_SHA','NEXT_PUBLIC_APP_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'])if(parent[name])env[name]=parent[name];
 return {...env,...flags,OPERATOR_ATOMIC_WRITES_ENABLED:'true',NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1'};
}
function main(){
 const root=path.resolve(__dirname,'../..');
 if(fs.readdirSync(root).some(n=>/^\.env(?:\.|$)/i.test(n)&&n!=='.env.example'))throw Error('RELEASE_ENV_FILE_REJECTED');
 validate(process.env);
 const result=cp.spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:root,env:buildEnvironment(process.env),stdio:'inherit',windowsHide:true});
 if(result.status!==0)throw Error('RELEASE_NEXT_BUILD_FAILED');
 scanArtifacts(root,Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY));
 console.log('PASS: RELEASE_BUILD_AND_SECRET_SCAN');
}
if(require.main===module){try{main()}catch(e){console.error(/^RELEASE_[A-Z_]+$/.test(e?.message??'')?e.message:'RELEASE_BUILD_STOPPED');process.exitCode=1;}}
module.exports={validate,buildEnvironment,flags};
