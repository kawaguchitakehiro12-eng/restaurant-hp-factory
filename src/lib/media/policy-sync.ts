import 'server-only';
import type {Policy} from './model';
/** Trusted scheduler adapter. Never derive publication/contract dates from request bodies. */
export async function refreshMediaPolicy(site:string,source:()=>Promise<Omit<Policy,'site'|'validUntil'>>,write:(policy:Policy)=>Promise<void>,now=Date.now()){
 const state=await source();if(typeof state.published!=='boolean'||!Number.isSafeInteger(state.revision)||!Array.isArray(state.assets))throw Error('MEDIA_POLICY');
 const policy={...state,site,validUntil:now+60_000};await write(policy);return policy;
}
