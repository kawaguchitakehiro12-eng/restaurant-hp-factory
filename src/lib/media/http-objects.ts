import 'server-only';
import {signControl} from './control-auth';
import type {ObjectStore,Policy} from './model';
/** Server-to-Worker control transport. Tests inject fetch; nothing is sent at import time. */
export class HttpObjects implements ObjectStore {
 constructor(private origin:string,private secret:string,private transport:typeof fetch=fetch){const u=new URL(origin);if(u.protocol!=='https:'||u.origin!==origin||u.username||u.password||secret.length<32)throw Error('MEDIA_CONFIG');}
 private async request(method:string,path:string,body:Uint8Array=new Uint8Array()){
 const time=String(Date.now()),signature=await signControl(method,path,time,body,this.secret);const r=await this.transport(this.origin+path,{method,headers:{'x-media-time':time,'x-media-signature':signature,'Content-Type':'application/octet-stream'},body:method==='GET'?undefined:body.slice().buffer as ArrayBuffer,redirect:'error',signal:AbortSignal.timeout(15000),cache:'no-store'});if(!r.ok)throw Error('MEDIA_TRANSPORT_UNKNOWN');return r;
 }
 async put(key:string,bytes:Uint8Array){if(!/^sites\/[a-zA-Z0-9_-]{1,100}\/[a-zA-Z0-9_-]{1,100}\.webp$/.test(key)||bytes.length>500000)throw Error('MEDIA_INPUT');await this.request('PUT','/internal/'+key,bytes);}
 async get(key:string){if(!/^sites\/[a-zA-Z0-9_-]{1,100}\/[a-zA-Z0-9_-]{1,100}\.webp$/.test(key))throw Error('MEDIA_INPUT');const r=await this.request('GET','/internal/'+key);const b=new Uint8Array(await r.arrayBuffer());if(b.length>500000)throw Error('MEDIA_INPUT');return b;}
 async remove(){throw Error('MEDIA_DELETE_REQUIRES_REVIEW');}
 async publish(policy:Policy){await this.request('PUT','/internal/policies/'+policy.site,new TextEncoder().encode(JSON.stringify(policy)));}
 async heartbeat(validUntil:number){await this.request('PUT','/internal/heartbeat',new TextEncoder().encode(JSON.stringify({validUntil})));}
}
