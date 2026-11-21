import 'server-only';
import {issueMediaCapability} from './capability';
import {mediaReference} from './reference';
import type {Policy} from './model';
/** Only call after real owner/operator/share authorization. Never persist this result. */
export async function mediaDisplay<T>(value:T,policy:Policy,scope:'edit'|'share',secret:string,expiry=Date.now()+240000):Promise<T>{
 const token=await issueMediaCapability(scope,policy,secret,Math.min(expiry,Date.now()+240000));
 function walk(v:unknown):unknown{if(typeof v==='string'){const r=mediaReference(v);if(!r)return v;if(r.site!==policy.site||!(scope==='edit'?(policy.previewAssets??[]):policy.assets).includes(r.id))throw Error('MEDIA_DISPLAY_DENIED');return v+'?preview='+token;}if(Array.isArray(v))return v.map(walk);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x)]));return v;}
 return walk(value) as T;
}
