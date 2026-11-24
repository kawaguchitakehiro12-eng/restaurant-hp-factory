// Verification-only endpoint: no business rows or credentials returned; Vercel protection stays enabled.
import {NextResponse} from 'next/server';
import sharp from 'sharp';
import {createAdminDbClient} from '@/lib/supabase/admin';
import {requireOperatorApi} from '@/lib/auth/operator';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
 if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='verify/sales-demo-runtime-20261124')return NextResponse.json({error:'Unavailable'},{status:503,headers});
 try{
  const output=await sharp({create:{width:8,height:8,channels:3,background:'#336699'}}).webp().toBuffer();
  const meta=await sharp(output).metadata();
  const imageOk=meta.format==='webp'&&meta.width===8&&meta.height===8;
  if(new URL(request.url).searchParams.get('database')==='1'){
   const denied=await requireOperatorApi();if(denied)return denied;
   // HEAD, limit zero: no customer/store content retrieved and no counters updated.
   const {error}=await createAdminDbClient().from('demo_sites').select('id',{head:true}).limit(0);
   return NextResponse.json({server:true,sharp:imageOk,previewDatabase:!error},{status:!error&&imageOk?200:503,headers});
  }
  return NextResponse.json({server:true,sharp:imageOk,previewOnly:true},{status:imageOk?200:503,headers});
 }catch{return NextResponse.json({error:'Verification unavailable'},{status:503,headers});}
}
