/** Explicitly configured image origin; no arbitrary remote logo hosts. */
export function mediaReference(value:string):{site:string;id:string}|null{
 const origin=process.env.NEXT_PUBLIC_MEDIA_ORIGIN;if(!origin)return null;
 try{const base=new URL(origin),url=new URL(value);if(base.protocol!=='https:'||base.origin!==origin||url.origin!==origin||url.search||url.hash||url.username||url.password)return null;const m=/^\/v1\/([a-zA-Z0-9_-]{1,100})\/([a-zA-Z0-9_-]{1,100})\.webp$/.exec(url.pathname);return m?{site:m[1],id:m[2]}:null;}catch{return null;}
}
export function mediaUrl(site:string,id:string):string{const origin=process.env.NEXT_PUBLIC_MEDIA_ORIGIN;if(!origin)throw Error('MEDIA_DISABLED');const url=`${origin}/v1/${site}/${id}.webp`;if(!mediaReference(url))throw Error('MEDIA_INPUT');return url;}
/** Display-only capability URLs. safeLogo/save validators still require canonical URLs. */
export function isMediaDisplayUrl(value:string):boolean{try{const u=new URL(value),token=u.searchParams.get('preview')??'';if(u.searchParams.size!==1||!/^(edit|share)\.[a-zA-Z0-9_-]{1,100}\.\d+\.\d{13}\.(?:-|[a-f0-9]{64})\.[a-f0-9]{64}$/.test(token))return false;u.search='';const r=mediaReference(u.toString());return !!r&&token.split('.')[1]===r.site;}catch{return false;}}
