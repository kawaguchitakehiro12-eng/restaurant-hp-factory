process.env.SAKUPAGE_INTERNAL_LEGACY_TEST='true';
const {test}=require('node:test'),assert=require('node:assert/strict');const {load}=require('./load-ts.cjs');
function setup({rpcCode=null,createFails=false,operator=true}={}){
 const operations=new Map(),calls={created:0,deleted:0,rpc:[]};
 const content=load('src/types/demo-content.ts').createEmptyDemoContent();Object.assign(content.basicInfo,{address:'Test address',phone:'000-0000-0000',businessHours:'12:00-18:00'});content.photos.hero='/images/test.jpg';content.menus=[{id:'test-menu',name:'Test Menu',price:'100',description:'',imageUrl:'',visible:true,sortOrder:0}];
 let site={id:'demo-a',storeId:'store-a',storeName:'Test Store',storeSlug:'test-store',siteContractStatus:'demo',publishStatus:'draft',prospectName:'Test Company',phone:'',contactPersonName:'Test Contact',content};
 const customer={id:'customer-a',name:'Test Company',contactEmail:'test@example.invalid',contactPhone:'',createdAt:'2026-11-08'};
 const db={from(table){assert.equal(table,'contract_operations');let action='select',values,filters=[];const chain={select(){return chain;},insert(v){action='insert';values=v;return chain;},update(v){action='update';values=v;return chain;},eq(k,v){filters.push([k,v,false]);return chain;},neq(k,v){filters.push([k,v,true]);return chain;},maybeSingle(){return Promise.resolve(run());},then(resolve,reject){return Promise.resolve(run()).then(resolve,reject);}};function run(){if(action==='insert'){if(operations.has(values.id))return {error:{code:'23505'}};operations.set(values.id,{...values});return {error:null};}const row=[...operations.values()].find(x=>filters.every(([k,v,neg])=>neg?x[k]!==v:x[k]===v));if(action==='update'){if(row)Object.assign(row,values);return {error:null};}return {data:row??null,error:null};}return chain;},async rpc(name,args){calls.rpc.push({name,args});if(rpcCode)return {error:{code:rpcCode}};operations.get(args.p_operation_id).state='complete';site={...site,siteContractStatus:'contracted',publishStatus:'published',customerId:customer.id};return {error:null};}};
 const mocks={
  '@/lib/auth/operator':{getOperatorAuth:async()=>operator?{status:'ok',user:{id:'operator-a'}}:{status:'forbidden'}},
  '@/lib/supabase/admin':{createAdminDbClient:()=>db,createAdminAuthClient:()=>({auth:{admin:{createUser:async()=>{calls.created++;return createFails?{data:{user:null},error:{code:'email_exists',status:422}}:{data:{user:{id:'new-auth-user'}},error:null};},deleteUser:async()=>{calls.deleted++;return {error:null};}}}})},
  '@/lib/repositories':{getDemoSiteRepository:()=>({findById:async()=>site,findBySlug:async()=>null}),getCustomerRepository:()=>({findById:async()=>customer})},
  '@/data/stores':{getStoreBySlug:()=>undefined},
 };
 return {route:load('src/app/api/admin/sites/[id]/contract/route.ts',mocks),operations,calls};
}
const form=()=>({requestId:'00000000-0000-4000-8000-000000000001',loginEmail:'test@example.invalid',initialPassword:'Testing-only-password',storeSlug:'test-store',contractStartDate:'2026-11-08',monthlyFee:2980,domainStatus:'unset'});
const request=body=>new Request('https://test.invalid/api/admin/sites/demo-a/contract',{method:'POST',headers:{origin:'https://test.invalid','content-type':'application/json'},body:JSON.stringify(body)});
const ctx=()=>({params:Promise.resolve({id:'demo-a'})});
test('contract endpoint is operator-only and validates input before account creation',async()=>{
 let env=setup({operator:false});assert.equal((await env.route.POST(request(form()),ctx())).status,403);assert.equal(env.calls.created,0);
 env=setup();assert.equal((await env.route.POST(request({...form(),monthlyFee:-1}),ctx())).status,400);assert.equal(env.calls.created,0);assert.equal(env.operations.size,0);
});
test('contract saves through one RPC, stores no password, and replays the same operation without creating another user',async()=>{
 const env=setup(),body=form();let response=await env.route.POST(request(body),ctx());assert.equal(response.status,200);assert.equal(env.calls.created,1);assert.equal(env.calls.rpc.length,1);
 assert.equal(env.calls.rpc[0].name,'complete_site_contract_v2');assert.equal(env.calls.rpc[0].args.p_contract.nextBillingDate,'2026-12-08');
 assert.ok(!JSON.stringify(env.calls.rpc).includes(body.initialPassword));assert.ok(!JSON.stringify([...env.operations.values()]).includes(body.initialPassword));assert.ok(!(await response.text()).includes(body.initialPassword));
 response=await env.route.POST(request(body),ctx());assert.equal(response.status,200);assert.equal(env.calls.created,1);
 response=await env.route.POST(request({...body,initialPassword:'Different-password-12'}),ctx());assert.equal(response.status,409);assert.equal(env.calls.created,1);
});
test('known DB rollback compensates only the newly created account',async()=>{
 const env=setup({rpcCode:'23505'}),response=await env.route.POST(request(form()),ctx());assert.equal(response.status,409);assert.equal(env.calls.deleted,1);assert.equal([...env.operations.values()][0].state,'failed');assert.equal((await response.json()).retryable,true);
});
test('business-state conflict uses PT409 and cleans up only the new account',async()=>{
 const env=setup({rpcCode:'PT409'}),response=await env.route.POST(request(form()),ctx());assert.equal(response.status,409);assert.equal(env.calls.deleted,1);assert.equal([...env.operations.values()][0].state,'failed');
});
test('ambiguous failure preserves the account and marks the operation for review',async()=>{
 const env=setup({rpcCode:'FETCH_ERROR'});assert.equal((await env.route.POST(request(form()),ctx())).status,503);assert.equal(env.calls.deleted,0);assert.equal([...env.operations.values()][0].state,'needs_review');assert.equal((await env.route.POST(request(form()),ctx())).status,409);assert.equal(env.calls.created,1);
});
test('existing email fails without changing or deleting any existing account',async()=>{
 const env=setup({createFails:true});assert.equal((await env.route.POST(request(form()),ctx())).status,409);assert.equal(env.calls.deleted,0);assert.equal(env.calls.rpc.length,0);
});

test('production contract is blocked before Auth creation until atomic DB configuration is approved',async()=>{const old=process.env.NODE_ENV,flag=process.env.OPERATOR_ATOMIC_WRITES_ENABLED;process.env.NODE_ENV='production';delete process.env.OPERATOR_ATOMIC_WRITES_ENABLED;try{const env=setup();assert.equal((await env.route.POST(request(form()),ctx())).status,503);assert.equal(env.calls.created,0);assert.equal(env.operations.size,0)}finally{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old;if(flag===undefined)delete process.env.OPERATOR_ATOMIC_WRITES_ENABLED;else process.env.OPERATOR_ATOMIC_WRITES_ENABLED=flag}});
