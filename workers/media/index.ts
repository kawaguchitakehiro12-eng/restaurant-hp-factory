import {imageWorker} from '../../src/lib/media/worker';
import {R2Objects,type R2Binding} from '../../src/lib/media/r2';
import type {Policy} from '../../src/lib/media/model';
import {verifyPreviewToken} from '../../src/lib/media/preview-token';
import {controlWorker} from '../../src/lib/media/control-worker';
import {leaseGuard} from '../../src/lib/media/lease';
type Env={IMAGES:R2Binding;POLICIES:R2Binding;MEDIA_DEPLOYMENT_APPROVED?:string;MEDIA_PREVIEW_SECRET:string;MEDIA_CONTROL_SECRET:string};
type WorkerCache={match(request:Request):Promise<Response|undefined>;put(request:Request,response:Response):Promise<void>};
const handlers=new WeakMap<object,ReturnType<typeof imageWorker>>();
const worker = {async fetch(request:Request,env:Env){
 if(env.MEDIA_DEPLOYMENT_APPROVED!=='approved-separately')return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}});
 if(new URL(request.url).pathname.startsWith('/internal/'))return controlWorker(request,env.IMAGES,env.POLICIES,env.MEDIA_CONTROL_SECRET);
 let handler=handlers.get(env);if(!handler){const edge=(caches as unknown as {default:WorkerCache}).default;
 const serve=imageWorker(new R2Objects(env.IMAGES),{async match(key){const r=await edge.match(new Request('https://media-cache.invalid/'+key));return r?new Uint8Array(await r.arrayBuffer()):null;},async put(key,value){await edge.put(new Request('https://media-cache.invalid/'+key),new Response(value.slice().buffer as ArrayBuffer,{headers:{'Cache-Control':'max-age=31536000','Content-Type':'image/webp'}}));}},async site=>{const record=await env.POLICIES.get('policies/'+site+'.json');if(!record)return null;const raw=await record.arrayBuffer();if(raw.byteLength>100_000)throw Error('MEDIA_POLICY');return JSON.parse(new TextDecoder().decode(raw)) as Policy;},Date.now,(req,site)=>verifyPreviewToken(new URL(req.url).searchParams.get('preview')??'',site,env.MEDIA_PREVIEW_SECRET,Date.now()));handler=leaseGuard(serve,async()=>{const h=await env.POLICIES.get('heartbeat.json');if(!h)throw Error('MEDIA_LEASE');const b=await h.arrayBuffer();if(b.byteLength>1000)throw Error('MEDIA_LEASE');return (JSON.parse(new TextDecoder().decode(b)) as {validUntil:number}).validUntil;});handlers.set(env,handler);}
 return handler(request);
}};

export default worker;
