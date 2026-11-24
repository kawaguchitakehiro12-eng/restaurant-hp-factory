'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {validate,buildEnvironment}=require('./policy.cjs');
const {scanArtifacts}=require('./scan-artifacts.cjs');
function main(){
 const root=path.resolve(__dirname,'../..');
 if(fs.readdirSync(root).some(name=>/^\.env(?:\.|$)/i.test(name)&&name!=='.env.example'))throw Error('PREVIEW_ENV_FILE_REJECTED');
 const readiness=JSON.parse(fs.readFileSync(path.join(root,'config/preview-readiness.json'),'utf8'));
 const approved=validate(process.env,readiness);
 const env=buildEnvironment(process.env,approved);
 if('SUPABASE_SERVICE_ROLE_KEY'in env||'NODE_OPTIONS'in env)throw Error('PREVIEW_BUILD_SECRET_OR_HOOK_REJECTED');
 // Runtime Secret stays in Vercel's server environment; it is never passed to Next build.
 const result=cp.spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:root,env,stdio:'inherit',windowsHide:true});
 if(result.status!==0)throw Error('PREVIEW_NEXT_BUILD_FAILED');
 // Stop publication if the configured Secret appears in any generated artifact, including server output.
 const secret=Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY,'utf8');
 scanArtifacts(root,secret);
 console.log('PASS: PREVIEW_BUILD_GUARDS_AND_SECRET_SCAN');
}
if(require.main===module){try{main()}catch(error){const message=String(error?.message??'');console.error(/^PREVIEW_[A-Z_]+$/.test(message)?message:'PREVIEW_BUILD_STOPPED');process.exitCode=1;}}
module.exports={main};
