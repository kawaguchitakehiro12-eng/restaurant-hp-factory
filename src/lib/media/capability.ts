import type {Policy} from './model';
type Scope='edit'|'share';
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
async function key(secret:string,uses:KeyUsage[]){if(secret.length<32)throw Error('MEDIA_CAPABILITY');return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,uses);}
export async function issueMediaCapability(scope:Scope,p:Policy,secret:string,expires:number,now=Date.now()){
 if(!['edit','share'].includes(scope)||!Number.isSafeInteger(expires)||expires<=now||expires>now+300000||!Number.isSafeInteger(p.revision))throw Error('MEDIA_CAPABILITY');
 const epoch=scope==='share'?p.shareEpoch??'-':'-',message=[scope,p.site,p.revision,expires,epoch].join('.');
 return message+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret,['sign']),new TextEncoder().encode(message)));
}
export async function verifyMediaCapability(token:string,p:Pick<Policy,'site'|'revision'|'shareEpoch'>,secret:string,now=Date.now()):Promise<Scope|false>{try{const v=token.split('.'),expiry=Number(v[3]);if(v.length!==6||!['edit','share'].includes(v[0])||v[1]!==p.site||Number(v[2])!==p.revision||!Number.isSafeInteger(expiry)||expiry<=now||expiry>now+300000||!/^[a-f0-9]{64}$/.test(v[5])||(v[0]==='share'&&v[4]!==p.shareEpoch))return false;
 const valid=await crypto.subtle.verify('HMAC',await key(secret,['verify']),Uint8Array.from(v[5].match(/../g)!,h=>parseInt(h,16)),new TextEncoder().encode(v.slice(0,5).join('.')));return valid?v[0] as Scope:false;}catch{return false;}}
export async function validNewCapability(token:string,site:string,revision:number,secret:string,now=Date.now()){const v=token.split('.'),next=Number(v[2]);return Number.isSafeInteger(next)&&next>revision&&!!await verifyMediaCapability(token,{site,revision:next,shareEpoch:v[4]},secret,now);}
