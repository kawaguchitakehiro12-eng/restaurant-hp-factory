'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),manifest=require('./candidate-files.json');
const branch='verify/sales-demo-build-20261124',previewOrigin='https://mesexqltlpybptifwsox.supabase.co';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function verifyFiles(){
 if(manifest.candidateCommit!=='f80a0fc786decb5190bff1fd30722788f6ea3f49'||manifest.files.length!==469)throw Error('VERIFY_CANDIDATE_ID');
 for(const f of manifest.files){const name=f.path==='vercel.json'?'.verification/original-vercel.json':f.path;if(hash(fs.readFileSync(path.join(root,name)))!==f.sha256)throw Error('VERIFY_CANDIDATE_SOURCE_CHANGED');}
 if(fs.readdirSync(root).some(n=>/^\.env(?:\.|$)/i.test(n)&&n!=='.env.example'))throw Error('VERIFY_ENV_FILE');
 const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));
 if(config.framework!==null||config.outputDirectory!=='.verification-output'||config.buildCommand!=='node .verification/build.cjs'||config.installCommand!=='npm ci --ignore-scripts')throw Error('VERIFY_STATIC_ONLY_CONFIGURATION');
 if(fs.existsSync(path.join(root,'api'))||fs.existsSync(path.join(root,'.vercel/output/functions')))throw Error('VERIFY_FUNCTION_OUTPUT');
}
function main(){
 verifyFiles();
 if(process.argv.includes('--source-check-only')){console.log(JSON.stringify({status:'PASS',candidateCommit:manifest.candidateCommit,files:manifest.files.length,applicationSourcesIdentical:true,staticOnly:true}));return;}
 const parent=process.env;
 if(parent.VERCEL!=='1'||parent.VERCEL_ENV!=='preview'||parent.VERCEL_GIT_COMMIT_REF!==branch)throw Error('VERIFY_BRANCH_OR_ENVIRONMENT');
 // Inspect names/presence only. Never use, print, copy or serialize a real key.
 for(const name of Object.keys(parent))if(parent[name]&&(/^(SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|POSTGRES|SUPABASE_DB_|TWILIO_|RESEND_|STRIPE_|GMO_|R2_|AWS_ACCESS_KEY)/.test(name)))throw Error('VERIFY_UNEXPECTED_CREDENTIAL');
 if(parent.NEXT_PUBLIC_SUPABASE_URL&&parent.NEXT_PUBLIC_SUPABASE_URL!==previewOrigin)throw Error('VERIFY_DATABASE_TARGET');
 const host=parent.VERCEL_BRANCH_URL;
 if(!host||!host.endsWith('.vercel.app')||host==='restaurant-hp-factory.vercel.app')throw Error('VERIFY_APP_ORIGIN');
 const app=new URL('https://'+host);if(app.hostname!==host||app.username||app.password||app.port||app.pathname!=='/')throw Error('VERIFY_APP_ORIGIN');
 const child={};for(const name of ['PATH','HOME','TMPDIR','TEMP','TMP','CI','VERCEL','VERCEL_ENV','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_COMMIT_SHA'])if(parent[name])child[name]=parent[name];
 Object.assign(child,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_APP_URL:app.origin,NEXT_PUBLIC_SUPABASE_URL:previewOrigin,NEXT_PUBLIC_SUPABASE_ANON_KEY:'sb_publishable_SYNTHETIC_BUILD_ONLY',OPERATOR_ATOMIC_WRITES_ENABLED:'true',DEMO_DELIVERY_MODE:'disabled',MANUAL_BILLING_ENABLED:'false',SALES_OPERATIONS_ENABLED:'false',MEDIA_STORAGE_MODE:'disabled',SAKUPAGE_COMMERCE_MODE:'disabled',NODE_OPTIONS:'--require "'+path.join(__dirname,'network-guard.cjs').replaceAll('\\','/')+'"'});
 const result=cp.spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:root,env:child,stdio:'inherit',windowsHide:true});
 if(result.status!==0)throw Error('VERIFY_NEXT_BUILD_FAILED');
 if(!fs.existsSync(path.join(root,'.next/BUILD_ID'))||!fs.existsSync(path.join(root,'.next/server/app-paths-manifest.json')))throw Error('VERIFY_FULL_NEXT_OUTPUT_MISSING');
 verifyFiles();
 require('../scripts/release/scan-artifacts.cjs').scanArtifacts(root,Buffer.from('SYNTHETIC_PRIVATE_CANARY_NOT_PASSED_TO_NEXT_20261124'));
 const output=path.join(root,'.verification-output');if(fs.existsSync(output))throw Error('VERIFY_OUTPUT_ALREADY_EXISTS');fs.mkdirSync(output);
 const proof={status:'PASS',candidateCommit:manifest.candidateCommit,verificationCommit:parent.VERCEL_GIT_COMMIT_SHA,verifiedFiles:manifest.files.length,manifestSha256:hash(fs.readFileSync(path.join(__dirname,'candidate-files.json'))),sourceVerifiedBeforeAndAfter:true,fullNextBuild:true,buildId:fs.readFileSync(path.join(root,'.next/BUILD_ID'),'utf8').trim(),staticProofOnly:true,applicationFunctionsDeployed:false,realCredentialsUsed:false,buildNetworkGuard:'non-loopback denied in Node; not OS isolation proof',databaseQueriesPermitted:false,features:'payments,billing,delivery,R2 disabled'};
 fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(proof,null,2));
 fs.writeFileSync(path.join(output,'index.html'),'<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>SAKUPAGE build verification</title><h1>PASS: SAKUPAGE full Next.js build</h1><p>Build verification only. No application or database access.</p><pre>'+JSON.stringify(proof,null,2).replaceAll('&','&amp;').replaceAll('<','&lt;')+'</pre></html>');
 console.log('PASS: VERIFIED_CANDIDATE_FULL_NEXT_BUILD_STATIC_PROOF_ONLY');
}
if(require.main===module){try{main()}catch(e){console.error(/^VERIFY_[A-Z_]+$/.test(e?.message??'')?e.message:'VERIFY_BUILD_STOPPED');process.exitCode=1;}}
module.exports={verifyFiles};
