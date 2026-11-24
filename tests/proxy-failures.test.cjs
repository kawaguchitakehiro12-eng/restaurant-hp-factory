const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./load-ts.cjs');const {NextRequest}=require('next/server');
const jwt=role=>[Buffer.from('{"alg":"HS256"}').toString('base64url'),Buffer.from(JSON.stringify({iss:'supabase',role,ref:'mesexqltlpybptifwsox',exp:4102444800})).toString('base64url'),'syntheticSignature'].join('.');
async function configured(url,key,body){const names=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'],old=names.map(n=>process.env[n]);try{for(const [n,v]of [[names[0],url],[names[1],key]]){if(v===undefined)delete process.env[n];else process.env[n]=v;}await body();}finally{names.forEach((n,i)=>{if(old[i]===undefined)delete process.env[n];else process.env[n]=old[i]})}}
const origin='https://mesexqltlpybptifwsox.supabase.co';
const request=path=>new NextRequest('https://preview.invalid'+path,{headers:{cookie:'incoming=synthetic'}});
async function unavailable(response){assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('location'),null);const body=await response.text();assert.ok(!body.includes('SYNTHETIC_PRIVATE_DETAIL'));assert.ok(!body.includes('sb_secret_'));assert.ok(!body.includes('sb_publishable_'))}
for(const [label,key]of [['invalid','not-a-key'],['wrong opaque role','sb_secret_SYNTHETIC'],['wrong legacy role',jwt('service_role')]])for(const path of ['/api/demo-sites','/api/customer/sites/a','/admin','/customer','/customer/login','/login'])test(`initialization ${label} returns 503 for ${path}`,async()=>configured(origin,key,async()=>{let calls=0;const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>{calls++;throw Error('must not create')}}});await unavailable(await proxy(request(path)));assert.equal(calls,0)}));
for(const missing of ['url','key'])for(const path of ['/api/demo-sites','/admin','/customer/login','/customer/auth/callback'])test(`missing ${missing} returns 503 for ${path}`,async()=>configured(missing==='url'?undefined:origin,missing==='key'?undefined:'sb_publishable_SYNTHETIC',async()=>{let calls=0;const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>{calls++;throw Error('must not create')}}});await unavailable(await proxy(request(path)));assert.equal(calls,0)}));
for(const path of ['/api/demo-sites','/customer/login'])test('SDK constructor failure sanitized for '+path,async()=>configured(origin,'sb_publishable_SYNTHETIC',async()=>{let calls=0;const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>{calls++;throw Error('SYNTHETIC_PRIVATE_DETAIL')}}});await unavailable(await proxy(request(path)));assert.equal(calls,1)}));
const cases=[['operator','/admin',200,null],['customer','/api/demo-sites',403,null],[null,'/api/demo-sites',401,null],['customer','/customer',200,null],[null,'/customer/login',200,null],[null,'/customer',307,'/customer/login'],['operator','/login?next=%2Fadmin%2Fsites',307,'/admin/sites']];
for(const format of ['opaque','legacy'])for(const [role,path,status,location]of cases)test(`${format} preserves auth and refreshed cookies ${role??'anonymous'} ${path}`,async()=>configured(origin,format==='opaque'?'sb_publishable_SYNTHETIC':jwt('anon'),async()=>{
 let created=0,checked=0;const req=request(path);
 function createServerClient(url,key,options){
  created++;assert.ok(url===origin);assert.ok(key===(format==='opaque'?'sb_publishable_SYNTHETIC':jwt('anon')));assert.ok(options.cookies.getAll().some(c=>c.name==='incoming'));
  return {auth:{getUser:async()=>{
   checked++;
   options.cookies.setAll([{name:'refreshed',value:'synthetic-session',options:{httpOnly:true,secure:true,sameSite:'lax',path:'/'}}],{'x-fixture-refresh':'yes'});
   return {data:{user:role?{app_metadata:{role}}:null},error:null};
  }}};
 }
 const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient}});
 const response=await proxy(req);assert.equal(response.status,status);assert.equal(created,1);assert.equal(checked,1);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.ok(req.cookies.get('refreshed')?.value==='synthetic-session');const cookie=response.cookies.get('refreshed');assert.ok(cookie?.value==='synthetic-session');assert.equal(cookie.httpOnly,true);assert.equal(cookie.secure,true);assert.equal(cookie.sameSite,'lax');if(location)assert.equal(new URL(response.headers.get('location')).pathname,location);else assert.equal(response.headers.get('location'),null);
}));
for(const failure of ['throw',500,503])test('getUser outage remains 503 case '+failure,async()=>configured(origin,'sb_publishable_SYNTHETIC',async()=>{const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>({auth:{getUser:async()=>{if(failure==='throw')throw Error('SYNTHETIC_PRIVATE_DETAIL');return{data:{user:null},error:{status:failure,message:'SYNTHETIC_PRIVATE_DETAIL'}}}}})}});await unavailable(await proxy(request('/api/demo-sites')))}));
