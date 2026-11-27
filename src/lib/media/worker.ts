import {objectKey,permit,validPolicy,type ObjectStore,type Policy} from './model';
export interface EdgeCache {match(key:string):Promise<Uint8Array|null>;put(key:string,value:Uint8Array):Promise<void>}
/** Must be backed by Cloudflare-side state, never a Supabase call per image. */
export type PolicyReader=(site:string)=>Promise<Policy|null>;
export function imageWorker(objects:ObjectStore,cache:EdgeCache,readPolicy:PolicyReader,clock=Date.now,verifyPreview:(request:Request,site:string,policy:Policy)=>Promise<boolean|'edit'|'share'>=async()=>false,refreshCapability:(r:Request,s:string,revision:number)=>Promise<boolean>=async()=>false){
 const policies=new Map<string,{value:Policy;until:number}>();
 return async(request:Request):Promise<Response>=>{
 const deny=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 try{const url=new URL(request.url);if(!['GET','HEAD'].includes(request.method))return deny(405);if([...url.searchParams.keys()].some(k=>k!=='preview')||url.searchParams.getAll('preview').length>1)return deny(400);
 const match=/^\/v1\/([a-zA-Z0-9_-]{1,100})\/([a-zA-Z0-9_-]{1,100})\.webp$/.exec(url.pathname);if(!match)return deny(404);
 const[,site,id]=match,now=clock();let cached=policies.get(site);
 if(!cached||cached.until<=now){const p=await readPolicy(site);if(!validPolicy(p,site,now))return deny(404);cached={value:p,until:Math.min(now+30_000,p.validUntil)};if(policies.size>=1000)policies.clear();policies.set(site,cached);}
 if(url.searchParams.has('preview')&&await refreshCapability(request,site,cached.value.revision)){const fresh=await readPolicy(site);if(!validPolicy(fresh,site,now)||fresh.revision<=cached.value.revision)return deny(503);cached={value:fresh,until:Math.min(now+30000,fresh.validUntil)};policies.set(site,cached);}
 // Authorization precedes the byte cache, including HEAD and conditional requests.
 const p=cached.value,preview=url.searchParams.has('preview')?await verifyPreview(request,site,p):false;
 const editing=preview==='edit'&&p.validUntil>now&&(p.previewAssets??[]).includes(id);
 if(!editing&&(!permit(p,now)||!p.assets.includes(id)||(!p.published&&!(preview===true||preview==='share'))))return deny(404);
 const key=objectKey(site,id);let bytes=await cache.match(key);if(!bytes){bytes=await objects.get(key);if(!bytes)return deny(404);if(bytes.length>500_000)return deny(503);await cache.put(key,bytes);}
 // Never let browser/shared HTTP caches bypass the Worker on later requests.
 return new Response(request.method==='HEAD'?null:bytes.slice().buffer as ArrayBuffer,{headers:{'Content-Type':'image/webp','Content-Length':String(bytes.length),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
 }catch{return deny(503);}
 };
}
