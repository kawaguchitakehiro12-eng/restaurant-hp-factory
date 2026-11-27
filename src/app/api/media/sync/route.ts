import {mediaDevelopmentEnabled,runDevelopmentMediaSync} from '@/lib/media/development-service';
import {getOperatorAuth} from '@/lib/auth/operator';
import {isSameOriginRequest} from '@/lib/auth/request-origin';
import {timingSafeEqual} from 'node:crypto';
export async function POST(request:Request){const headers={'Cache-Control':'no-store'};try{
 if(!mediaDevelopmentEnabled())return Response.json({error:'無効です。'},{status:503,headers});
 const expected=process.env.MEDIA_SYNC_SECRET??'',actual=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';
 const trusted=expected.length>=32&&Buffer.byteLength(expected)===Buffer.byteLength(actual)&&timingSafeEqual(Buffer.from(expected),Buffer.from(actual));
 if(!trusted){if(!isSameOriginRequest(request))return Response.json({error:'拒否されました。'},{status:403,headers});const a=await getOperatorAuth();if(a.status!=='ok')return Response.json({error:'拒否されました。'},{status:a.status==='unavailable'?503:403,headers});}
 return Response.json(await runDevelopmentMediaSync(),{headers});
 }catch{return Response.json({error:'同期を確認できません。有効期限は延長しません。'},{status:503,headers});}}
