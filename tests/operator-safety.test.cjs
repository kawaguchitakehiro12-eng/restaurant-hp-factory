const{test}=require('node:test'),assert=require('node:assert/strict');const{load}=require('./load-ts.cjs');
const empty=()=>load('src/types/demo-content.ts').createEmptyDemoContent();
test('sales mobile numbers and source URLs never populate public data for any template',()=>{
 const{resolveDemoStore}=load('src/lib/stores/demo-content-resolver.ts');
 for(const [templateId,templateType]of [['luxury-japanese','luxury-izakaya'],['cafe','cafe'],['bar','bar'],['bal','bal'],['izakaya-casual','izakaya-casual']]){
  const site={id:'fixture',storeId:'fixture',storeName:'Fixture',storeSlug:'fixture',templateId,templateType,siteContractStatus:'demo',phone:'PRIVATE_SALES_MOBILE',sourceUrl:'https://private-sales-source.invalid',content:empty()};const json=JSON.stringify(resolveDemoStore(site));assert.ok(!json.includes(site.phone));assert.ok(!json.includes(site.sourceUrl));
 }
});
test('new demo previews are operator-only URLs and cannot be copied as prospect URLs',()=>{
 const {createDemoSiteFromForm}=load('src/lib/admin/demo-create.ts');const {result}=createDemoSiteFromForm({storeName:'Fixture',storeSlug:'fixture',businessType:'cafe',sourceUrl:'',address:'',templateId:'cafe',prospectName:'Fixture',contactPersonName:'',phone:'PRIVATE',email:'',salesStatus:'not_approached',salesMemo:'',content:empty()});assert.match(result.demoUrl,/\/admin\/demo\/fixture\/preview$/);assert.ok(!result.customerProposalText.includes('/admin/'));assert.ok(!result.salesUrlText.includes('/admin/'));
});
test('operator requests require Origin and JSON and enforce a streaming byte limit',async()=>{
 const {readOperatorJson}=load('src/lib/api/operator-input.ts');const request=(body,origin='https://app.example',type='application/json')=>new Request('https://app.example/api/test',{method:'POST',headers:{origin,'content-type':type},body});
 await assert.rejects(()=>readOperatorJson(request('{}','https://foreign.example')),e=>e.status===403);await assert.rejects(()=>readOperatorJson(request('{}','https://app.example','text/plain')),e=>e.status===415);await assert.rejects(()=>readOperatorJson(request('[]')),e=>e.status===400);await assert.rejects(()=>readOperatorJson(request('x'.repeat(20)),10),e=>e.status===413);assert.deepEqual(await readOperatorJson(request('{"name":"日本語"}')),{name:'日本語'});
});
test('operator validators reject account links, executable URLs and invalid share options',()=>{
 const v=load('src/lib/api/operator-input.ts');assert.throws(()=>v.validateOperatorCustomer({id:'x',name:'x',contactEmail:'x@y.invalid',contactPhone:'',createdAt:'2026-11-11',auth_user_id:'foreign'}));assert.throws(()=>v.validateShareInput({expiryOption:'forever'}));const c=empty();c.photos.hero='javascript:alert(1)';assert.throws(()=>v.validateOperatorContent(c));assert.throws(()=>v.validateOperatorSite({id:'x'}));
});
test('SMS budgets conservatively bound Unicode segments and refuse overly long messages',()=>{
 const{smsSegmentUpperBound,smsBudget}=load('src/lib/delivery/core.ts');for(const[n,expected]of [[70,1],[71,2],[134,2],[135,3]])assert.equal(smsSegmentUpperBound('あ'.repeat(n)),expected);assert.equal(smsSegmentUpperBound('😀'.repeat(36)),2);assert.throws(()=>smsBudget('あ'.repeat(269)));assert.throws(()=>smsBudget('test',{DEMO_DAILY_SMS_SEGMENTS:'0'}));
});
test('atomic operator save uses one RPC and never falls back to partial writes on errors',async()=>{
 const old=process.env.OPERATOR_ATOMIC_WRITES_ENABLED;process.env.OPERATOR_ATOMIC_WRITES_ENABLED='true';let calls=[];
 try{const {createSupabaseDemoSiteRepository}=load('src/lib/repositories/supabase/demo-site-supabase.ts',{'@/lib/supabase/admin':{createAdminDbClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return {error:Error('RPC unavailable')}} ,from:()=>{throw Error('must not make partial writes')}})}});const repo=createSupabaseDemoSiteRepository();await assert.rejects(()=>repo.create({id:'fixture',content:empty()}));await assert.rejects(()=>repo.update({id:'fixture',content:empty()}));assert.equal(calls.length,2);assert.ok(calls.every(c=>c.name==='save_operator_demo_v1'));}finally{if(old===undefined)delete process.env.OPERATOR_ATOMIC_WRITES_ENABLED;else process.env.OPERATOR_ATOMIC_WRITES_ENABLED=old}
});
test('shared metadata and public API prohibit indexing and caching',async()=>{
 const page=load('src/app/share/[token]/page.tsx',{'@/lib/share/load-shared-demo':{peekSharedDemoPage:async()=>({status:'not_found'})},'@/lib/supabase/server-config':{isSupabaseAdminConfigured:()=>true}});const metadata=await page.generateMetadata({params:Promise.resolve({token:'fixture'})});assert.equal(metadata.robots.index,false);assert.equal(metadata.referrer,'no-referrer');
 const route=load('src/app/api/public/sites/[slug]/route.ts',{'@/lib/api/supabase-route':{requireSupabaseAdmin:()=>null},'@/lib/repositories':{getDemoSiteRepository:()=>({findBySlug:async()=>null})}});const response=await route.GET(new Request('https://app.example/api/public/sites/x'),{params:Promise.resolve({slug:'x'})});assert.match(response.headers.get('cache-control'),/no-store/);assert.match(response.headers.get('x-robots-tag'),/noindex/);
});

test('production rejects legacy partial saves until the atomic RPC is explicitly enabled',async()=>{
 const oldEnv=process.env.NODE_ENV,oldFlag=process.env.OPERATOR_ATOMIC_WRITES_ENABLED;process.env.NODE_ENV='production';delete process.env.OPERATOR_ATOMIC_WRITES_ENABLED;
 try{const{createSupabaseDemoSiteRepository}=load('src/lib/repositories/supabase/demo-site-supabase.ts',{'@/lib/supabase/admin':{createAdminDbClient:()=>{throw Error('must not write')}}});const repo=createSupabaseDemoSiteRepository();await assert.rejects(()=>repo.create({id:'fixture'}),/approved atomic/);await assert.rejects(()=>repo.update({id:'fixture'}),/approved atomic/);}finally{if(oldEnv===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=oldEnv;if(oldFlag===undefined)delete process.env.OPERATOR_ATOMIC_WRITES_ENABLED;else process.env.OPERATOR_ATOMIC_WRITES_ENABLED=oldFlag}
});
test('normal server pages reject draft and stopped stores before rendering content',async()=>{
 let site={storeSlug:'fixture',storeName:'PRIVATE',siteContractStatus:'demo',publishStatus:'draft'};const {default:Page}=load('src/app/[slug]/page.tsx',{'next/navigation':{notFound:()=>{throw Error('404')}},'@/lib/repositories':{getDemoSiteRepository:()=>({findBySlug:async()=>site})}});
 await assert.rejects(()=>Page({params:Promise.resolve({slug:'fixture'})}),/404/);site={...site,siteContractStatus:'contracted',publishStatus:'suspended'};await assert.rejects(()=>Page({params:Promise.resolve({slug:'fixture'})}),/404/);
});

test('public API success and unpublished responses also disable caching',async()=>{
 const route=load('src/app/api/public/sites/[slug]/route.ts',{'@/lib/api/supabase-route':{requireSupabaseAdmin:()=>null},'@/lib/repositories':{getDemoSiteRepository:()=>({findBySlug:async()=>({storeSlug:'fixture',siteContractStatus:'demo',publishStatus:'draft'})})}});const response=await route.GET(new Request('https://app.example/api/public/sites/fixture'),{params:Promise.resolve({slug:'fixture'})});assert.equal((await response.json()).visible,false);assert.match(response.headers.get('cache-control'),/no-store/);
 const shared=load('src/app/api/public/share/[token]/route.ts',{'@/lib/api/supabase-route':{requireSupabaseAdmin:()=>null},'@/lib/share/load-shared-demo':{loadSharedDemoPage:async()=>({status:'found',store:{name:'Fixture'},prospectLabel:'Fixture'})}});const sharedResponse=await shared.GET(new Request('https://app.example/api/public/share/fixture'),{params:Promise.resolve({token:'fixture'})});assert.match(sharedResponse.headers.get('cache-control'),/no-store/);
});
