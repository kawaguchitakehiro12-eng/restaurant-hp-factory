// Explicit opt-in loopback scheduler, never imported or started by the app.
const {setTimeout:wait}=require('node:timers/promises');
async function main(){const u=new URL(process.env.MEDIA_SYNC_LOCAL_URL||'');if(process.env.MEDIA_SYNC_RUN!=='development'||u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.pathname!=='/api/media/sync'||u.search||u.username||u.password||process.env.VERCEL||(process.env.MEDIA_SYNC_SECRET||'').length<32)throw Error('MEDIA_SCHEDULER_DISABLED');
 while(true){const response=await fetch(u,{method:'POST',headers:{authorization:'Bearer '+process.env.MEDIA_SYNC_SECRET},redirect:'error',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('MEDIA_SYNC_STOPPED');console.log('MEDIA_SYNC_PASS');await wait(30000);}}
if(require.main===module)main().catch(()=>{console.error('MEDIA_SYNC_STOPPED');process.exitCode=1});
