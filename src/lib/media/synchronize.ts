import 'server-only';
import {mediaSnapshot,type SnapshotSource} from './snapshot';
import {syncMediaBatch} from './batch-sync';
import type {Policy} from './model';
const snapshots=new WeakMap<SnapshotSource,{at:number;value:Awaited<ReturnType<typeof mediaSnapshot>>}>();
export async function synchronizeMedia(source:SnapshotSource,target:{readPolicy:(site:string)=>Promise<Policy|null>;publish:(p:Policy)=>Promise<void>;heartbeat:(until:number)=>Promise<void>},now=Date.now()){
 const current=await source.generation(),cached=snapshots.get(source);
 const snapshot=cached&&cached.value.generation===current&&now-cached.at<1800000?cached.value:await mediaSnapshot(source,now);
 if(snapshot!==cached?.value)snapshots.set(source,{at:now,value:snapshot});let writes=0;
 await syncMediaBatch({now,source:async()=>snapshot,read:s=>target.readPolicy(s),write:async p=>{await target.publish(p);writes++;},lease:async until=>{if(await source.generation()!==snapshot.generation)throw Error('MEDIA_CHANGED');await target.heartbeat(until);}});
 return {sites:snapshot.policies.length,writes,generation:snapshot.generation};
}
