import {requireCustomerUser,getCustomerSite,CustomerAccessError} from '@/lib/customer/server';
import {isSameOriginRequest} from '@/lib/auth/request-origin';
import {developmentMedia,mediaDevelopmentEnabled} from '@/lib/media/development-service';
import {mediaUrl} from '@/lib/media/reference';
import {authorizedPreviewMap} from '@/lib/media/authorized-display';
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){try{if(!mediaDevelopmentEnabled())throw Error();const user=await requireCustomerUser(),site=await getCustomerSite(user.id,(await params).slug);return Response.json({previews:await authorizedPreviewMap(site.id)},{headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}catch(e){return Response.json({error:'プレビューを確認できません。'},{status:e instanceof CustomerAccessError?e.status:503,headers:{'Cache-Control':'no-store'}});}}
export async function POST(request:Request,{params}:{params:Promise<{slug:string}>}){
 const headers={'Cache-Control':'no-store'};try{
 if(!mediaDevelopmentEnabled())return Response.json({error:'画像保存先の切替は未有効です。'},{status:503,headers});
 if(!isSameOriginRequest(request))return Response.json({error:'リクエスト元を確認してください。'},{status:403,headers});
 const user=await requireCustomerUser(),site=await getCustomerSite(user.id,(await params).slug),{workflow}=developmentMedia(user.id,site.id);
 const mime=request.headers.get('content-type')??'';if(!['image/png','image/jpeg','image/webp'].includes(mime))return Response.json({error:'画像形式を確認してください。'},{status:415,headers});
 const reader=request.body?.getReader();if(!reader)throw Error();const parts:Uint8Array[]=[];let size=0;while(true){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>4000000){await reader.cancel();return Response.json({error:'画像を小さくしてください。'},{status:413,headers});}parts.push(p.value);}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
 const asset=await workflow.upload(user.id,site.id,bytes,mime,new URL(request.url).searchParams.get('logo')==='1');return Response.json({url:mediaUrl(site.id,asset.id),asset:{id:asset.id,bytes:asset.bytes,format:asset.format,width:asset.width,height:asset.height}},{status:201,headers});
 }catch(e){return Response.json({error:'画像を保存できません。元画像を保持して状態を確認してください。'},{status:e instanceof CustomerAccessError?e.status:503,headers});}
}
