import {NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
export async function GET(request:Request) {
 let base=request.url;
 try{const configured=new URL(process.env.NEXT_PUBLIC_APP_URL??"");if(["http:","https:"].includes(configured.protocol)&&!configured.username&&!configured.password&&request.headers.get("host")===configured.host)base=configured.origin;}catch{/* Development can omit the canonical URL. */}
 const code=new URL(request.url).searchParams.get("code");let reason="expired";
 if(code){try{const client=await createServerSupabaseClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL("/customer/password",base),{headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});if(!error.status||error.status>=500||error.status===429)reason="unavailable";}catch{reason="unavailable";/* Never log tokens or provider errors. */}}
 return NextResponse.redirect(new URL("/customer/recover?error="+reason,base),{headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
}
