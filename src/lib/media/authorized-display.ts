import 'server-only';
import {mediaDevelopmentEnabled,developmentMedia,runDevelopmentMediaSync} from './development-service';
import {mediaDisplay} from './display';
import {mediaUrl} from './reference';
/** Callers have already checked current owner/operator/share authorization. */
export async function authorizedMediaDisplay<T>(value:T,site:string,scope:'edit'|'share',expiry?:number):Promise<T>{if(!mediaDevelopmentEnabled())return value;await runDevelopmentMediaSync();const {objects}=developmentMedia('authorized',site),policy=await objects.readPolicy(site);if(!policy)throw Error('MEDIA_POLICY');return mediaDisplay(value,policy,scope,process.env.MEDIA_PREVIEW_SECRET??'',expiry);}
export async function authorizedPreviewMap(site:string){const {metadata}=developmentMedia('authorized',site),s=await metadata.read(site),urls=Object.fromEntries(s.assets.filter(a=>a.state==='ready').map(a=>[a.id,mediaUrl(site,a.id)]));const display=await authorizedMediaDisplay(urls,site,'edit');return Object.fromEntries(Object.keys(urls).map(id=>[urls[id],display[id]]));}
