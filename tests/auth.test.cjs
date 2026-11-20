const {test}=require('node:test'),assert=require('node:assert/strict');const {load}=require('./load-ts.cjs');
const {NextRequest}=require('next/server');
test('origin check accepts incoming Host despite Next internal hostname, and rejects foreign origins',()=>{
 const {isSameOriginRequest}=load('src/lib/auth/request-origin.ts');
 const request=(origin,host='127.0.0.1:32471')=>new Request('http://localhost:32471/api/customer/sites/test',{headers:{host,origin}});
 assert.equal(isSameOriginRequest(request('http://127.0.0.1:32471')),true);
 assert.equal(isSameOriginRequest(request('http://evil.invalid')),false);
 assert.equal(isSameOriginRequest(request('http://127.0.0.1:32471/')),false);
 assert.equal(isSameOriginRequest(new Request('http://localhost:32471/api/test')),false);
 assert.equal(isSameOriginRequest(new Request('http://localhost:32471/api/test',{headers:{host:'127.0.0.1:32471',origin:'http://evil.invalid','x-forwarded-host':'evil.invalid'}})),false);
});
test('proxy keeps customer and operator areas separate and permits password callbacks',async()=>{
 const oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.invalid';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test-only';
 try{
  let user=null;const {proxy,config}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>({auth:{getUser:async()=>({data:{user}})}})}});
  assert.ok(config.matcher.includes('/customer/:path*'));
  let response=await proxy(new NextRequest('https://test.invalid/customer'));assert.match(response.headers.get('location'),/customer\/login$/);
  response=await proxy(new NextRequest('https://test.invalid/customer/auth/callback?code=test-only'));assert.equal(response.status,200);
  response=await proxy(new NextRequest('https://test.invalid/api/customer/sites/test'));assert.equal(response.status,401);
  user={app_metadata:{role:'customer'}};response=await proxy(new NextRequest('https://test.invalid/customer'));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');
  response=await proxy(new NextRequest('https://test.invalid/api/demo-sites'));assert.equal(response.status,403);
  user={app_metadata:{role:'operator'}};response=await proxy(new NextRequest('https://test.invalid/admin'));assert.equal(response.status,200);
 }finally{if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY=oldKey;}
});
test('password callback exchanges once, sets no-store, and never accepts a foreign next URL',async()=>{
 let count=0;const {GET}=load('src/app/customer/auth/callback/route.ts',{'@/lib/supabase/server':{createServerSupabaseClient:async()=>({auth:{exchangeCodeForSession:async()=>{count++;return {error:null};}}})}});
 let response=await GET(new Request('https://test.invalid/customer/auth/callback?code=test-only&next=https://other.invalid'));assert.equal(count,1);assert.equal(response.headers.get('location'),'https://test.invalid/customer/password');assert.equal(response.headers.get('cache-control'),'private, no-store');
 response=await GET(new Request('https://test.invalid/customer/auth/callback'));assert.match(response.headers.get('location'),/customer\/recover\?error=expired$/);assert.equal(count,1);
});

test('origin verification supports HTTPS termination using the trusted configured URL',()=>{
 const old=process.env.NEXT_PUBLIC_APP_URL;process.env.NEXT_PUBLIC_APP_URL='https://sakupage.jp';try{const {isSameOriginRequest}=load('src/lib/auth/request-origin.ts');assert.equal(isSameOriginRequest(new Request('http://internal/api/test',{headers:{host:'sakupage.jp',origin:'https://sakupage.jp'}})),true);assert.equal(isSameOriginRequest(new Request('http://internal/api/test',{headers:{host:'sakupage.jp',origin:'http://sakupage.jp'}})),false);}finally{if(old===undefined)delete process.env.NEXT_PUBLIC_APP_URL;else process.env.NEXT_PUBLIC_APP_URL=old}
});

test('Auth service 5xx returns 503 without redirecting or exposing details',async()=>{
 const mocks={'@/lib/supabase/config':{isSupabaseConfigured:()=>true},'@/lib/supabase/server':{createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:null},error:{status:503,message:'PRIVATE_PROVIDER_DETAIL'}})}})}};
 const{requireOperatorApi,getOperatorAuth}=load('src/lib/auth/operator.ts',mocks);assert.equal((await getOperatorAuth()).status,'unavailable');const response=await requireOperatorApi();assert.equal(response.status,503);assert.equal(response.headers.get('location'),null);assert.ok(!(await response.text()).includes('PRIVATE_PROVIDER_DETAIL'));
 const {requireCustomerUser}=load('src/lib/customer/server.ts',mocks);await assert.rejects(()=>requireCustomerUser(),error=>error.status===503);
});
test('proxy rejects Auth returned 5xx as unavailable while missing sessions remain 401',async()=>{
 const oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.invalid';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='fixture';
 try{let error={status:500};const{proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>({auth:{getUser:async()=>({data:{user:null},error})}})}});let response=await proxy(new NextRequest('https://test.invalid/api/demo-sites'));assert.equal(response.status,503);error={status:401};response=await proxy(new NextRequest('https://test.invalid/api/demo-sites'));assert.equal(response.status,401)}finally{if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY=oldKey}
});

test('recovery callback distinguishes expired links from provider outage without leaking errors',async()=>{for(const [failure,reason]of [[{status:400},'expired'],[{status:503,message:'PRIVATE_DETAIL'},'unavailable'],[{status:429},'unavailable'],[null,'unavailable']]){const {GET}=load('src/app/customer/auth/callback/route.ts',{'@/lib/supabase/server':{createServerSupabaseClient:async()=>({auth:{exchangeCodeForSession:async()=>{if(!failure)throw Error('PRIVATE_DETAIL');return {error:failure}}}})}});const response=await GET(new Request('https://test.invalid/customer/auth/callback?code=PRIVATE_CODE'));assert.equal(response.headers.get('location'),'https://test.invalid/customer/recover?error='+reason);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.ok(!(await response.text()).includes('PRIVATE'));}});
test('recovery page explains expired links and ignores arbitrary query text',async()=>{const {default:Page}=load('src/app/customer/recover/page.tsx',{'@/components/customer/CustomerPassword':{CustomerPassword:()=>null}});assert.match((await Page({searchParams:Promise.resolve({error:'expired'})})).props.initialError,/期限切れ/);assert.match((await Page({searchParams:Promise.resolve({error:'unavailable'})})).props.initialError,/認証サービス/);assert.equal((await Page({searchParams:Promise.resolve({error:'<script>PRIVATE</script>'})})).props.initialError,'');});

test('callback uses configured public origin at TLS proxy and ignores forwarded hosts',async()=>{const old=process.env.NEXT_PUBLIC_APP_URL;process.env.NEXT_PUBLIC_APP_URL='https://public.example.invalid';try{const{GET}=load('src/app/customer/auth/callback/route.ts');const r=await GET(new Request('http://localhost:3000/customer/auth/callback',{headers:{host:'public.example.invalid','x-forwarded-host':'attacker.invalid'}}));assert.equal(r.headers.get('location'),'https://public.example.invalid/customer/recover?error=expired');}finally{if(old===undefined)delete process.env.NEXT_PUBLIC_APP_URL;else process.env.NEXT_PUBLIC_APP_URL=old;}});
