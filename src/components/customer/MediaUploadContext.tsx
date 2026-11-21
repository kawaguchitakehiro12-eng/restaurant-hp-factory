'use client';
import {createContext,useContext,useRef,type ReactNode} from 'react';
import {browserApiFetch} from '@/lib/browser/api-fetch';
import {readLogoFile} from '@/lib/images/read-logo-file';
import {readImageFileAsDataUrl} from '@/lib/images/read-image-file';
type Upload={upload:(file:File,logo?:boolean)=>Promise<string>;preview:(value:string)=>string};
const Context=createContext<Upload|null>(null);
export function useMediaUpload(){return useContext(Context);}
export function MediaUploadContext({slug,children}:{slug:string;children:ReactNode}){
 const previews=useRef(new Map<string,string>());
 if(process.env.NEXT_PUBLIC_MEDIA_UPLOAD_ENABLED!=='development')return children;
 const value:Upload={async upload(file,logo=false){const data=logo?await readLogoFile(file):await readImageFileAsDataUrl(file);const match=/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(data);if(!match)throw Error('画像形式を確認してください。');const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));const r=await browserApiFetch(`/api/customer/sites/${encodeURIComponent(slug)}/images${logo?'?logo=1':''}`,{method:'POST',headers:{'Content-Type':match[1]},body:bytes});if(!r.ok)throw Error('画像を保存できません。元画像を保持してください。');const body=await r.json() as {url?:unknown};if(typeof body.url!=='string')throw Error('画像保存状態を確認してください。');previews.current.set(body.url,data);while(previews.current.size>12||[...previews.current.values()].reduce((n,v)=>n+v.length,0)>8000000){const first=previews.current.keys().next().value;if(first===undefined)break;previews.current.delete(first);}return body.url;},preview(url){return previews.current.get(url)??url;}};
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
