import 'server-only';
import {mediaReference} from './reference';
/** Every managed photo/logo/menu/gallery URL must belong to this site's ready asset. */
export async function assertMediaOwnership(content:unknown,site:string,ready:(id:string)=>Promise<boolean>):Promise<void>{
 if(typeof content==='string'){const ref=mediaReference(content);let managed=false;try{managed=!!process.env.NEXT_PUBLIC_MEDIA_ORIGIN&&new URL(content).origin===process.env.NEXT_PUBLIC_MEDIA_ORIGIN;}catch{}if(managed&&!ref)throw Error('MEDIA_DENIED');if(ref&&(ref.site!==site||!await ready(ref.id)))throw Error('MEDIA_DENIED');return;}
 if(Array.isArray(content)){for(const v of content)await assertMediaOwnership(v,site,ready);}
 else if(content&&typeof content==='object')for(const v of Object.values(content))await assertMediaOwnership(v,site,ready);
}
