// No credentials/.env/network package installs. Normal token only. No permission changes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');for(const name of ['.env','.env.local','.env.production','.env.production.local'])if(fs.existsSync(path.join(root,name)))throw Error('ISOLATED_BUILD_ENV_FILE_PRESENT');
const env={};for(const name of ['SystemRoot','WINDIR','TEMP','TMP','PATH','USERPROFILE','APPDATA','LOCALAPPDATA','COMSPEC','NUMBER_OF_PROCESSORS','PROCESSOR_ARCHITECTURE'])if(process.env[name])env[name]=process.env[name];
const guard=path.resolve(root,'../sales-rc-validation-20261119/network-guard.cjs');if(!fs.existsSync(guard))throw Error('NETWORK_GUARD_MISSING');
Object.assign(env,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',SAKUPAGE_ISOLATED_BUILD:'true',NODE_OPTIONS:'--require='+guard+' --require='+path.join(root,'scripts/build-fs-diagnostics.cjs')});
const child=cp.spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build','--turbopack'],{cwd:root,env,stdio:'inherit',windowsHide:true,timeout:180000});child.once('error',()=>{console.log('ISOLATED_BUILD_PROCESS_FAILED');process.exitCode=1});child.once('exit',code=>{process.exitCode=code??1});
