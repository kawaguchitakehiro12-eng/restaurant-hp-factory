const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./load-ts.cjs');const {createClient}=require('@supabase/supabase-js');
const {apiKeyFetch,apiKeyKind}=load('src/lib/supabase/api-key-fetch.ts');
const jwt=role=>[Buffer.from('{"alg":"HS256"}').toString('base64url'),Buffer.from(JSON.stringify({iss:'supabase',ref:'mesexqltlpybptifwsox',role,exp:4102444800})).toString('base64url'),'syntheticSignature'].join('.');
const origin='https://mesexqltlpybptifwsox.supabase.co';
function mock(){const calls=[];return {calls,fetch:async(input,init={})=>{const url=new URL(input instanceof Request?input.url:String(input));assert.ok(url.origin===origin,'unexpected destination');const h=new Headers(input instanceof Request?input.headers:undefined);new Headers(init.headers).forEach((v,k)=>h.set(k,v));calls.push({path:url.pathname,headers:h});const body=url.pathname.includes('/admin/users')?{users:[],aud:'authenticated',next_page:null,last_page:1}:url.pathname.endsWith('/user')?{id:'synthetic-user',aud:'authenticated',role:'authenticated'}:[];return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json'}})}};}
for(const format of ['legacy','opaque'])for(const operation of ['REST','RPC','AUTH_ADMIN'])test(`${format} admin ${operation} final SDK headers`,async()=>{
 const old={url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY};const key=format==='legacy'?jwt('service_role'):'sb_secret_synthetic';
 process.env.NEXT_PUBLIC_SUPABASE_URL=origin;process.env.SUPABASE_SERVICE_ROLE_KEY=key;const m=mock();
 try{const admin=load('src/lib/supabase/admin.ts',{'@/lib/supabase/server-fetch':{boundedServerFetch:m.fetch}});const c=operation==='AUTH_ADMIN'?admin.createAdminAuthClient():admin.createAdminDbClient();
 const r=operation==='REST'?await c.from('demo_sites').select('id'):operation==='RPC'?await c.rpc('save_operator_demo_v1',{p_create:true}):await c.auth.admin.listUsers();assert.ok(!r.error,'mock SDK operation failed');assert.ok(m.calls.length===1);
 const h=m.calls[0].headers;assert.ok(h.get('apikey')===key);assert.ok(format==='opaque'?!h.has('authorization'):h.get('authorization')===`Bearer ${key}`);
 }finally{for(const [name,v]of [['NEXT_PUBLIC_SUPABASE_URL',old.url],['SUPABASE_SERVICE_ROLE_KEY',old.key]]){if(v===undefined)delete process.env[name];else process.env[name]=v;}}
});
for(const format of ['legacy','opaque'])for(const withUser of [false,true])test(`${format} public ${withUser?'user JWT':'anonymous'} SDK headers`,async()=>{
 const key=format==='legacy'?jwt('anon'):'sb_publishable_synthetic',user=jwt('authenticated'),m=mock();
 const c=createClient(origin,key,{accessToken:async()=>withUser?user:null,global:{fetch:apiKeyFetch(key,'anon',m.fetch)}});
 const r=await c.from('demo_sites').select('id');assert.ok(!r.error);const h=m.calls[0].headers;
 assert.ok(h.get('apikey')===key);assert.ok(withUser?h.get('authorization')===`Bearer ${user}`:format==='legacy'?h.get('authorization')===`Bearer ${key}`:!h.has('authorization'));
});
for(const format of ['legacy','opaque'])test(`${format} SSR real SDK getUser preserves supplied JWT`,async()=>{
 const {createServerClient}=require('@supabase/ssr'),key=format==='legacy'?jwt('anon'):'sb_publishable_synthetic',user=jwt('authenticated'),m=mock();
 const c=createServerClient(origin,key,{cookies:{getAll:()=>[],setAll:()=>{}},global:{fetch:apiKeyFetch(key,'anon',m.fetch)}});
 const r=await c.auth.getUser(user);assert.ok(!r.error);assert.ok(m.calls.length===1);assert.ok(m.calls[0].headers.get('authorization')===`Bearer ${user}`);
});
for(const [key,role]of [['wrong','anon'],['sb_secret_synthetic','anon'],['sb_publishable_synthetic','service_role'],[jwt('authenticated'),'service_role'],[jwt('service_role'),'anon'],['','anon']])test(`reject invalid key role ${role} case ${key.length}`,()=>{try{apiKeyKind(key,role);assert.fail('must reject')}catch(e){assert.ok(e.message==='Invalid Supabase API key configuration')}});
test('Request headers and init overrides retain user JWT and other headers',async()=>{const m=mock(),key='sb_publishable_synthetic',user=jwt('authenticated');await apiKeyFetch(key,'anon',m.fetch)(new Request(origin+'/rest/v1/',{headers:{Authorization:`Bearer ${key}`,'x-test':'retained'}}),{headers:{Authorization:`Bearer ${user}`}});assert.ok(m.calls[0].headers.get('authorization')===`Bearer ${user}`);assert.ok(m.calls[0].headers.get('x-test')==='retained')});
test('new admin strips accidental user session at final transport',async()=>{const m=mock();await apiKeyFetch('sb_secret_synthetic','service_role',m.fetch)(origin+'/rest/v1/',{headers:{Authorization:`Bearer ${jwt('authenticated')}`}});assert.ok(!m.calls[0].headers.has('authorization'))});
test('new public Auth sign-in reaches mock without API-key Bearer',async()=>{const m=mock(),key='sb_publishable_synthetic';const c=createClient(origin,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:apiKeyFetch(key,'anon',m.fetch)}});await c.auth.signInWithPassword({email:'synthetic@example.invalid',password:'synthetic-only'});assert.ok(m.calls.length===1);assert.ok(m.calls[0].path==='/auth/v1/token');assert.ok(!m.calls[0].headers.has('authorization'))});
