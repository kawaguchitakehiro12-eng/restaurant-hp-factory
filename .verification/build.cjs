'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),manifest=require('./candidate-files.json');
const branch='verify/sales-demo-runtime-20261124',origin='https://mesexqltlpybptifwsox.supabase.co';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function verify(){
 if(manifest.files.length!==469||manifest.candidateCommit!=='f80a0fc786decb5190bff1fd30722788f6ea3f49')throw Error('VERIFY_SOURCE_ID');
 for(const f of manifest.files){const p=f.path==='vercel.json'?'.verification/original-vercel.json':f.path;if(hash(fs.readFileSync(path.join(root,p)))!==f.sha256)throw Error('VERIFY_SOURCE_CHANGED');}
 if(fs.readdirSync(root).some(n=>/^\.env(?:\.|$)/i.test(n)&&n!=='.env.example'))throw Error('VERIFY_ENV_FILE');
}
try{
 verify();if(process.argv.includes('--source-check-only')){console.log('PASS: 469_CANDIDATE_SOURCE_HASHES');return;}
 const p=process.env;
 if(p.VERCEL_ENV!=='preview'||p.VERCEL_GIT_COMMIT_REF!==branch||p.NEXT_PUBLIC_SUPABASE_URL!==origin)throw Error('VERIFY_PREVIEW_TARGET');
 if(hash(p.NEXT_PUBLIC_SUPABASE_ANON_KEY||'')!=='bfa58f4581da3f8b6039636faf207a880508c03db4fdce29646f346f4d89c454'||hash(p.SUPABASE_SERVICE_ROLE_KEY||'')!=='9f312a9e0ce281ba74d4e38448e54241f49f9b9ec1589d94694e72bac7852fde')throw Error('VERIFY_KEY_PROVENANCE');
 const expected={OPERATOR_ATOMIC_WRITES_ENABLED:'true',DEMO_DELIVERY_MODE:'disabled',MANUAL_BILLING_ENABLED:'false',SALES_OPERATIONS_ENABLED:'false',MEDIA_STORAGE_MODE:'disabled',SAKUPAGE_COMMERCE_MODE:'disabled'};
 for(const [k,v]of Object.entries(expected))if(p[k]!==v)throw Error('VERIFY_FEATURE_FLAGS');
 for(const k of Object.keys(p))if(p[k]&&/^(DATABASE_URL|POSTGRES|SUPABASE_DB_|TWILIO_|RESEND_|STRIPE_|GMO_|R2_|AWS_ACCESS_KEY)/.test(k))throw Error('VERIFY_UNEXPECTED_CREDENTIAL');
 if(!p.VERCEL_BRANCH_URL||!p.VERCEL_BRANCH_URL.endsWith('.vercel.app')||p.VERCEL_BRANCH_URL==='restaurant-hp-factory.vercel.app')throw Error('VERIFY_APP_HOST');
 const app='https://'+p.VERCEL_BRANCH_URL;
 if(new URL(app).host!==p.VERCEL_BRANCH_URL)throw Error('VERIFY_APP_HOST');
 const env={};for(const k of ['PATH','HOME','TMPDIR','TEMP','TMP','CI','VERCEL','VERCEL_ENV','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_COMMIT_SHA'])if(p[k])env[k]=p[k];
 Object.assign(env,expected,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_APP_URL:app,NEXT_PUBLIC_SUPABASE_URL:origin,NEXT_PUBLIC_SUPABASE_ANON_KEY:p.NEXT_PUBLIC_SUPABASE_ANON_KEY,NODE_OPTIONS:'--require "'+path.join(__dirname,'network-guard.cjs').replaceAll('\\','/')+'"'});
 // Runtime-only Secret is never passed to the Next build process.
 const result=cp.spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:root,env,stdio:'inherit',windowsHide:true});
 if(result.status!==0)throw Error('VERIFY_NEXT_BUILD_FAILED');
 verify();require('../scripts/release/scan-artifacts.cjs').scanArtifacts(root,Buffer.from(p.SUPABASE_SERVICE_ROLE_KEY));
 console.log('PASS: CANDIDATE_FULL_BUILD_RUNTIME_SECRET_EXCLUDED_PREVIEW_ONLY');
}catch(e){console.error(/^VERIFY_[A-Z_]+$/.test(e?.message??'')?e.message:'VERIFY_BUILD_STOPPED');process.exitCode=1;}
