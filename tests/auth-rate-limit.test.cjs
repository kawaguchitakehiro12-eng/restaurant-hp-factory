const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./load-ts.cjs'),{NextRequest}=require('next/server');
const {isAuthUnavailable}=load('src/lib/auth/service-error.ts');
for(const status of [429,'429',500,502,503,0])test('temporary Auth classification '+String(status)+' '+typeof status,()=>assert.equal(isAuthUnavailable({status,name:'AuthApiError'}),true));
for(const status of [400,401,403,404,'401','403'])test('normal Auth rejection classification '+String(status)+' '+typeof status,()=>assert.equal(isAuthUnavailable({status,name:'AuthApiError'}),false));
for(const name of ['AuthRetryableFetchError','AbortError','TimeoutError','AuthUnknownError'])test('existing transport classification '+name,()=>assert.equal(isAuthUnavailable({name}),true));
for(const [label,error]of [['null',null],['absent',undefined],['string','synthetic'],['unknown',{}],['string zero',{status:'0'}]])test('unchanged unknown classification '+label,()=>assert.equal(isAuthUnavailable(error),false));
async function configured(body){const names=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'],old=names.map(n=>process.env[n]);try{process.env[names[0]]='https://mesexqltlpybptifwsox.supabase.co';process.env[names[1]]='sb_publishable_SYNTHETIC';await body()}finally{names.forEach((n,i)=>{if(old[i]===undefined)delete process.env[n];else process.env[n]=old[i]})}}
for(const afterCookie of [false,true])for(const path of ['/api/demo-sites','/admin','/api/customer/sites/a','/customer'])test(`429 ${afterCookie?'after':'before'} Cookie update ${path}`,async()=>configured(async()=>{
 let calls=0;const req=new NextRequest('https://preview.invalid'+path,{headers:{cookie:'auth-session=synthetic-old'}});
 function createServerClient(url,key,options){
  assert.ok(url);assert.ok(key);
  return {auth:{getUser:async()=>{
   calls++;
   if(afterCookie)options.cookies.setAll([{name:'auth-session',value:'synthetic-new',options:{httpOnly:true,secure:true,sameSite:'lax',path:'/'}}],{});
   return {data:{user:null},error:{status:429,name:'AuthApiError',message:'SYNTHETIC_PRIVATE_DETAIL'}};
  }}};
 }
 const {proxy}=load('src/proxy.ts',{'@supabase/ssr':{createServerClient}});
 const response=await proxy(req);assert.equal(response.status,503);assert.equal(response.headers.get('location'),null);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(calls,1);
 const updated=response.headers.getSetCookie().find(s=>s.startsWith('auth-session='));if(afterCookie)assert.ok(updated?.startsWith('auth-session=synthetic-new;'));else assert.equal(response.headers.get('set-cookie'),null);assert.equal(req.cookies.get('auth-session')?.value,afterCookie?'synthetic-new':'synthetic-old');assert.ok(!(await response.text()).includes('SYNTHETIC_PRIVATE_DETAIL'));
}));
function backend(error={status:429,name:'AuthApiError',message:'SYNTHETIC_PRIVATE_DETAIL'}){
 const counts={auth:0,db:0};const mocks={
  '@/lib/supabase/config':{isSupabaseConfigured:()=>true},
  '@/lib/supabase/server-config':{isSupabaseAdminConfigured:()=>true},
  '@/lib/supabase/server':{createServerSupabaseClient:async()=>({auth:{getUser:async()=>{counts.auth++;return{data:{user:null},error}}}})},
  '@/lib/supabase/admin':{createAdminDbClient:()=>{counts.db++;throw Error('unexpected database use')}},
  '@/lib/repositories':{getDemoSiteRepository:()=>{counts.db++;throw Error('unexpected database use')}}
 };return {counts,mocks};
}
for(const method of ['GET','POST'])test('admin endpoint returns 503 before data work '+method,async()=>{const b=backend(),route=load('src/app/api/demo-sites/route.ts',b.mocks);const response=await route[method](new Request('https://preview.invalid/api/demo-sites',{method,body:method==='POST'?'{}':undefined}));assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(b.counts.auth,1);assert.equal(b.counts.db,0);assert.ok(!(await response.text()).includes('SYNTHETIC_PRIVATE_DETAIL'))});
for(const method of ['GET','PATCH'])test('customer endpoint returns 503 before ownership or write '+method,async()=>{const b=backend(),route=load('src/app/api/customer/sites/[slug]/route.ts',b.mocks);const request=new Request('https://preview.invalid/api/customer/sites/a',{method,headers:{origin:'https://preview.invalid','content-type':'application/json'},body:method==='PATCH'?'{}':undefined});const response=await route[method](request,{params:Promise.resolve({slug:'a'})});assert.equal(response.status,503);assert.equal(b.counts.auth,1);assert.equal(b.counts.db,0);assert.ok(!(await response.text()).includes('SYNTHETIC_PRIVATE_DETAIL'))});
test('authenticated-looking data with 429 never bypasses operator role checking',async()=>{const b=backend();b.mocks['@/lib/supabase/server'].createServerSupabaseClient=async()=>({auth:{getUser:async()=>({data:{user:{id:'synthetic',app_metadata:{role:'operator'}}},error:{status:429}})}});const {getOperatorAuth}=load('src/lib/auth/operator.ts',b.mocks);assert.equal((await getOperatorAuth()).status,'unavailable')});
test('customer editing retains draft and does not mark session expired or retry after Auth 429',async()=>{
 const b=backend(),route=load('src/app/api/customer/sites/[slug]/route.ts',b.mocks);
 const states=[],refs=[];let stateIndex=0,refIndex=0,networkCalls=0;const dirtyGuards=[];
 const react={useState:initial=>{const i=stateIndex++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value}]},useRef:initial=>{const i=refIndex++;return refs[i]??(refs[i]={current:initial})},useEffect:effect=>effect()};
 const {CustomerSiteEditor}=load('src/components/customer/CustomerSiteEditor.tsx',{'react':react,'next/link':()=>null,'@/components/admin/ImageUploadField':{ImageUploadField:()=>null},'@/components/customer/CustomerBillingSummary':{CustomerBillingSummary:()=>null},'@/lib/browser/unsaved-changes':{installUnsavedChangesGuard:fn=>{dirtyGuards.push(fn);return()=>{}}}});
 const initial={id:'synthetic-site',slug:'a',name:'Synthetic',publishStatus:'published',content:load('src/types/demo-content.ts').createEmptyDemoContent(),revision:'2026-11-18T00:00:00Z',monthlyFee:0};
 function render(){stateIndex=0;refIndex=0;return CustomerSiteEditor({initial})}
 function find(node,predicate){if(!node||typeof node!=='object')return null;if(Array.isArray(node)){for(const item of node){const found=find(item,predicate);if(found)return found;}return null;}if(predicate(node))return node;return find(node.props?.children,predicate);}
 let tree=render();const input=find(tree,n=>n.type==='textarea'&&typeof n.props.onChange==='function');assert.ok(input);input.props.onChange({target:{value:'SYNTHETIC_EDIT'}});tree=render();const draft=JSON.stringify(states[1]);assert.equal(states[3],true);
 const previousFetch=globalThis.fetch;
 globalThis.fetch=async(url,init)=>{networkCalls++;const headers=new Headers(init.headers);headers.set('origin','https://preview.invalid');return route.PATCH(new Request('https://preview.invalid'+url,{...init,headers}),{params:Promise.resolve({slug:'a'})})};
 try{const save=find(tree,n=>n.type==='button'&&n.props.children==='変更を保存');assert.ok(save);save.props.onClick();await new Promise(setImmediate);await new Promise(setImmediate);tree=render();assert.equal(JSON.stringify(states[1]),draft);assert.equal(states[3],true);assert.equal(states[4],false);assert.equal(states[5],'');assert.ok(states[6]);assert.equal(states[8],false);assert.equal(networkCalls,1);assert.equal(b.counts.auth,1);assert.equal(b.counts.db,0);assert.ok(dirtyGuards.at(-1)());assert.equal(find(tree,n=>n.type==='a'&&n.props.href==='/customer/login'),null);assert.ok(!String(states[6]).includes('SYNTHETIC_PRIVATE_DETAIL'));await new Promise(setImmediate);assert.equal(networkCalls,1)}finally{globalThis.fetch=previousFetch}
});
