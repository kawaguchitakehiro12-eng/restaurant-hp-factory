import 'server-only';
import type {Policy} from './model';
/** One global 60s lease; do NOT rewrite every site's policy every 30s. */
export async function syncMediaBatch(input:{source:()=>Promise<{complete:boolean;policies:Policy[]}>;read:(site:string)=>Promise<Policy|null>;write:(policy:Policy)=>Promise<void>;lease:(validUntil:number)=>Promise<void>;now?:number}){
 const now=input.now??Date.now(),source=await input.source(),snapshot=source.policies;if(source.complete!==true||!Array.isArray(snapshot)||new Set(snapshot.map(p=>p.site)).size!==snapshot.length)throw Error('MEDIA_SNAPSHOT');
 const fingerprint=(p:Policy)=>JSON.stringify([p.site,p.published,p.demoUntil,p.contractEnds,[...p.assets].sort(),[...(p.previewAssets??[])].sort(),p.shareEpoch??null]);
 for(const p of snapshot){const old=await input.read(p.site);if(old&&old.revision>p.revision)throw Error('MEDIA_STALE_SNAPSHOT');if(!old||fingerprint(old)!==fingerprint(p)||old.validUntil<now+3600000)await input.write({...p,validUntil:now+86400000});}
 // Source MUST include tombstones for stopped/removed stores, not only active stores.
 // A partial snapshot or any unknown acknowledgement must throw before this point.
 await input.lease(now+60000);
}
