const {test}=require('node:test');const assert=require('node:assert/strict');
const {load}=require('./load-ts.cjs');
const {NextResponse}=require('next/server');
const content=()=>load('src/types/demo-content.ts').createEmptyDemoContent();
function setup({userId='user-a',rpcError=null}={}){
 const calls=[];
 const row={id:'site-a',store_slug:'store-a',store_name:'Test Store',publish_status:'published',site_contract_status:'contracted',monthly_fee:2980,contract_start_date:'2026-11-01',minimum_term_end_date:'2027-04-30',next_billing_date:'2026-12-01',billing_status:'pending',customer:{auth_user_id:'user-a'},sales_memo:'internal-only',initial_password:'never-return-this',store_content:{content:content(),updated_at:'2026-11-08T01:00:00Z'}};
 const db={from(table){const filters=[];const chain={select(){calls.push({table,action:'select'});return chain;},eq(k,v){filters.push([k,v]);return chain;},neq(k,v){filters.push([k,v,true]);return chain;},order(){return chain;},maybeSingle(){return Promise.resolve({data:matches()?row:null,error:null});},then(resolve,reject){return Promise.resolve({data:matches()?[row]:[],error:null}).then(resolve,reject);}};function matches(){return filters.every(([key,value,negate])=>{const actual=key==='customer.auth_user_id'?row.customer.auth_user_id:row[key];return negate?actual!==value:actual===value;});}return chain;},async rpc(name,args){calls.push({name,args});return {error:rpcError};}};
 const mocks={'@/lib/supabase/server':{createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:userId?{id:userId}:null},error:null})}})},'@/lib/supabase/admin':{createAdminDbClient:()=>db},'next/server':{NextResponse}};
 return {row,calls,server:load('src/lib/customer/server.ts',mocks),route:load('src/app/api/customer/sites/[slug]/route.ts',mocks),images:load('src/app/api/customer/sites/[slug]/images/route.ts',{...mocks,'@/lib/media/development-service':{mediaDevelopmentEnabled:()=>true,developmentMedia:()=>({workflow:{upload:async()=>{calls.push({upload:true});return{id:'synthetic-image',bytes:1,format:'webp',width:1,height:1}}}})},'@/lib/media/authorized-display':{authorizedPreviewMap:async()=>({})}})};
}
test('customer A can only read own contracted stores; output excludes private data',async()=>{
 const {server}=setup();const own=await server.getCustomerSite('user-a','store-a');assert.equal(own.name,'Test Store');assert.ok(!JSON.stringify(own).includes('never-return'));assert.ok(!JSON.stringify(own).includes('internal-only'));
 await assert.rejects(()=>server.getCustomerSite('user-b','store-a'),error=>error.status===404);
 assert.deepEqual(await server.listCustomerSites('user-b'),[]);
});
test('customer endpoint rejects expired sessions and foreign stores',async()=>{
 let env=setup({userId:null});assert.equal((await env.route.GET(new Request('https://test.invalid/api/customer/sites/store-a'),{params:Promise.resolve({slug:'store-a'})})).status,401);assert.equal(env.calls.length,0);
 env=setup({userId:'user-b'});assert.equal((await env.route.GET(new Request('https://test.invalid/api/customer/sites/store-a'),{params:Promise.resolve({slug:'store-a'})})).status,404);
});
const request=(body,origin='https://test.invalid')=>new Request('https://test.invalid/api/customer/sites/store-a',{method:'PATCH',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
const ctx=()=>({params:Promise.resolve({slug:'store-a'})});
test('save rejects cross-origin requests and unauthorized fields before writes',async()=>{
 const {route,calls}=setup();let response=await route.PATCH(request({content:content(),revision:null},'https://other.invalid'),ctx());assert.equal(response.status,403);assert.equal(calls.length,0);
 response=await route.PATCH(request({content:{...content(),salesMemo:'cannot change'},revision:null}),ctx());assert.equal(response.status,400);assert.equal(calls.filter(x=>x.name).length,0);
});
test('save passes verified owner and revision to one atomic RPC; stale saves return 409',async()=>{
 let env=setup();const body={content:content(),revision:'2026-11-08T01:00:00Z'};let response=await env.route.PATCH(request(body),ctx());assert.equal(response.status,200);const rpc=env.calls.find(x=>x.name);assert.equal(rpc.name,'save_customer_site_content');assert.equal(rpc.args.p_user_id,'user-a');assert.equal(rpc.args.p_expected_updated_at,body.revision);
 for(const code of ['PT409','40001']){env=setup({rpcError:{code}});response=await env.route.PATCH(request(body),ctx());assert.equal(response.status,409);}
});
test('validator rejects active URLs, invalid dates, duplicate IDs and oversized lists',()=>{
 const {parseCustomerContent,parseCustomerSave}=load('src/lib/customer/validation.ts');
 assert.ok(parseCustomerContent(content()));
 for(const url of ['javascript:alert(1)','data:text/html;base64,AAA','//evil.invalid/p.png','https://user:password@example.invalid/a','https:\\evil.invalid']){const value=content();value.photos.hero=url;assert.throws(()=>parseCustomerContent(value));}
 let value=content();value.topics=[{id:'one',title:'a',body:'b',date:'2026-02-30',visible:true}];assert.throws(()=>parseCustomerContent(value));
 value=content();value.menus=Array.from({length:101},(_,i)=>({id:String(i),name:'x',price:'1',description:'',imageUrl:'',visible:true,sortOrder:i}));assert.throws(()=>parseCustomerContent(value));
 value=content();value.photos.gallery=Array(2).fill({id:'duplicate',url:'',alt:'',caption:'',sortOrder:0});assert.throws(()=>parseCustomerContent(value));
 assert.throws(()=>parseCustomerSave({content:content(),revision:'yesterday'}));
});
test('customer editor renders editable tabs and disables save until modified',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const {CustomerSiteEditor}=load('src/components/customer/CustomerSiteEditor.tsx');
 const html=renderToStaticMarkup(React.createElement(CustomerSiteEditor,{initial:{id:'test',slug:'test-store',name:'Test Store',publishStatus:'published',content:content(),revision:null,monthlyFee:2980}}));
 for(const label of ['店舗情報','メニュー','写真','お知らせ','変更を保存'])assert.ok(html.includes(label));
 assert.match(html,/disabled=""/);
});

test('logo PATCH validates raster on server and rejects another tenant before storing',async()=>{const sharp=require('sharp'),logo='data:image/png;base64,'+(await sharp({create:{width:8,height:4,channels:4,background:{r:5,g:10,b:20,alpha:0.5}}}).png().toBuffer()).toString('base64');const draft=content();draft.photos.logo=logo;let env=setup();let response=await env.route.PATCH(request({content:draft,revision:'2026-11-08T01:00:00Z'}),ctx());assert.equal(response.status,200);const rpc=env.calls.find(x=>x.name);assert.match(rpc.args.p_content.photos.logo,/^data:image\/png;base64,/);env=setup({userId:'user-b'});response=await env.route.PATCH(request({content:draft,revision:null}),ctx());assert.equal(response.status,404);assert.equal(env.calls.filter(x=>x.name).length,0);env=setup();draft.photos.logo='data:image/svg+xml;base64,PHN2Zy8+';response=await env.route.PATCH(request({content:draft,revision:null}),ctx());assert.equal(response.status,400);assert.equal(env.calls.filter(x=>x.name).length,0)});

test('paused owned stores remain listed and editable; public access stays forbidden',async()=>{const e=setup();e.row.publish_status='suspended';assert.equal((await e.server.listCustomerSites('user-a')).length,1);assert.equal((await e.route.PATCH(request({content:content(),revision:'2026-11-08T01:00:00Z'}),ctx())).status,200);assert.equal(e.calls.filter(x=>x.name).length,1);const a=load('src/lib/customer/access.ts').customerAccess(await e.server.getCustomerSite('user-a','store-a'));assert.equal(a.edit,true);assert.equal(a.external,false)});
test('ended stores retain account reads but reject content writes before any RPC',async()=>{const e=setup();e.row.site_contract_status='suspended';e.row.publish_status='suspended';assert.equal((await e.server.listCustomerSites('user-a')).length,1);assert.equal((await e.route.GET(new Request('https://test.invalid/api/customer/sites/store-a'),ctx())).status,200);assert.equal((await e.route.PATCH(request({content:content(),revision:null}),ctx())).status,403);assert.equal(e.calls.filter(x=>x.name).length,0);await assert.rejects(()=>e.server.getCustomerSite('user-b','store-a'),x=>x.status===404)});
test('contract, publication and billing axes do not grant one another access',()=>{const {customerAccess:a}=load('src/lib/customer/access.ts');for(const status of ['unpaid','paid','failed']){assert.equal(a({contractStatus:'contracted',publishStatus:'suspended',billingStatus:status}).edit,true);assert.equal(a({contractStatus:'suspended',publishStatus:'published',billingStatus:status}).external,false)}assert.equal(a({publishStatus:'published'}).edit,false)});

test('ended image upload and signed preview refuse access before storage; foreign account stays denied',async()=>{let e=setup();e.row.site_contract_status='suspended';const r=()=>new Request('https://test.invalid/api/customer/sites/store-a/images',{method:'POST',headers:{origin:'https://test.invalid','content-type':'image/png'},body:new Uint8Array([0])});assert.equal((await e.images.POST(r(),ctx())).status,403);assert.equal((await e.images.GET(new Request('https://test.invalid/api/customer/sites/store-a/images'),ctx())).status,403);assert.equal(e.calls.filter(x=>x.upload).length,0);e=setup({userId:'user-b'});assert.equal((await e.images.POST(r(),ctx())).status,404);assert.equal(e.calls.filter(x=>x.upload).length,0);});
