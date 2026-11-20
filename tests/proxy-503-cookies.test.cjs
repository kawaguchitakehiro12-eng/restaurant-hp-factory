const {test}=require('node:test'),assert=require('node:assert/strict');
const {NextRequest,NextResponse}=require('next/server');const {load}=require('./load-ts.cjs');
const batches={
 single:[{name:'sdk-session',value:'synthetic-value',options:{path:'/',domain:'preview.invalid',httpOnly:true,secure:true,sameSite:'none',expires:new Date('2035-01-01T00:00:00Z'),priority:'high',partitioned:true}}],
 deletion:[{name:'sdk-session',value:'',options:{path:'/',httpOnly:true,secure:true,sameSite:'lax',maxAge:0,expires:new Date(0)}}],
 multiple:[{name:'sdk-access',value:'synthetic-access',options:{path:'/',httpOnly:true,secure:true,sameSite:'strict'}},{name:'sdk-refresh',value:'synthetic-refresh',options:{path:'/customer',httpOnly:true,secure:true,sameSite:'lax',maxAge:3600}}],
 chunks:[{name:'sdk-session.0',value:'synthetic-part-0%=',options:{path:'/',secure:true,httpOnly:true,sameSite:'lax'}},{name:'sdk-session.1',value:'synthetic-part-1',options:{path:'/',secure:true,httpOnly:true,sameSite:'lax'}},{name:'sdk-session.2',value:'',options:{path:'/',secure:true,httpOnly:true,sameSite:'lax',maxAge:0}}]
};
async function configured(body){const names=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'],old=names.map(n=>process.env[n]);try{process.env[names[0]]='https://mesexqltlpybptifwsox.supabase.co';process.env[names[1]]='sb_publishable_SYNTHETIC';await body()}finally{names.forEach((n,i)=>{if(old[i]===undefined)delete process.env[n];else process.env[n]=old[i]})}}
async function scenario(path,mode,cookies){
 let created=0,checked=0;const intermediates=[];
 class RecordingResponse extends NextResponse {static next(options){const response=NextResponse.next(options);intermediates.push(response);return response}}
 const req=new NextRequest('https://preview.invalid'+path,{headers:{cookie:'incoming-only=synthetic-incoming',Authorization:'Bearer SYNTHETIC_PRIVATE_DETAIL'}});
 function createServerClient(url,key,options){
  created++;assert.ok(url);assert.ok(key);
  const update=()=>options.cookies.setAll(cookies,{'Authorization':'Bearer SYNTHETIC_PRIVATE_DETAIL','x-provider-error':'SYNTHETIC_PRIVATE_DETAIL','cookie':'incoming-only=synthetic-incoming','cache-control':'public, max-age=3600','x-fixture':'must-not-copy','location':'https://must-not-forward.invalid'});
  if(mode==='constructor-before')throw Error('SYNTHETIC_PRIVATE_DETAIL');
  if(mode==='constructor-after'){update();throw Error('SYNTHETIC_PRIVATE_DETAIL')}
  return{auth:{getUser:async()=>{checked++;if(cookies)update();if(mode==='throw')throw Error('SYNTHETIC_PRIVATE_DETAIL');return{data:{user:null},error:{status:mode,name:'AuthApiError',message:'SYNTHETIC_PRIVATE_DETAIL'}}}}};
 }
 const {proxy}=load('src/proxy.ts',{'next/server':{NextRequest,NextResponse:RecordingResponse},'@supabase/ssr':{createServerClient}});
 const response=await proxy(req);
 assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('location'),null);assert.equal(created,1);assert.equal(checked,mode.startsWith?.('constructor')?0:1);
 for(const name of ['authorization','cookie','x-provider-error','x-fixture','x-middleware-set-cookie'])assert.equal(response.headers.get(name),null);
 for(const name of response.headers.keys())assert.ok(!name.startsWith('x-middleware-'));
 assert.equal(response.cookies.get('incoming-only'),undefined);assert.ok(!(await response.text()).includes('SYNTHETIC_PRIVATE_DETAIL'));
 const expected=cookies&&mode!=='constructor-before'?intermediates.at(-1).headers.getSetCookie():[];
 assert.ok(JSON.stringify(response.headers.getSetCookie())===JSON.stringify(expected),'SDK Set-Cookie fields must match byte for byte');
 if(cookies&&mode!=='constructor-before')for(const cookie of cookies){
  const field=response.headers.getSetCookie().find(s=>s.startsWith(cookie.name+'='));assert.ok(field);
  const first=field.split(';')[0];assert.ok(decodeURIComponent(first.slice(first.indexOf('=')+1))===cookie.value);
  if(cookie.options.maxAge===0)assert.ok(/; Max-Age=0(?:;|$)/i.test(field));
 }
}
for(const [name,cookies]of Object.entries(batches))for(const mode of [429,500,503,'throw','constructor-after'])for(const path of ['/api/demo-sites','/customer'])test(`503 preserves SDK ${name} cookie fields ${mode} ${path}`,async()=>configured(()=>scenario(path,mode,cookies)));
for(const mode of [429,503,'throw','constructor-before'])for(const path of ['/api/demo-sites','/customer/login'])test(`503 before SDK cookies adds none ${mode} ${path}`,async()=>configured(()=>scenario(path,mode,null)));
for(const problem of ['missing-url','missing-key','invalid-key','wrong-role'])for(const path of ['/api/demo-sites','/customer/login'])test(`configuration ${problem} never forwards request cookies ${path}`,async()=>configured(async()=>{
 if(problem==='missing-url')delete process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(problem==='missing-key')delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(problem==='invalid-key')process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='invalid';
 if(problem==='wrong-role')process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='sb_secret_SYNTHETIC';
 let calls=0;const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient:()=>{calls++;throw Error('must not create')}}});
 const r=await proxy(new NextRequest('https://preview.invalid'+path,{headers:{cookie:'incoming-only=synthetic-incoming',authorization:'Bearer SYNTHETIC_PRIVATE_DETAIL'}}));
 assert.equal(r.status,503);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('set-cookie'),null);assert.equal(r.headers.get('authorization'),null);assert.equal(calls,0);
}));
