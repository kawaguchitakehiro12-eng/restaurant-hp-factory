const {test}=require('node:test'),assert=require('node:assert/strict');const{load}=require('./load-ts.cjs');
function setup(){
 const state={auth:{status:'ok',user:{id:'operator-test'}},share:{id:'share-test',demoSiteId:'site-test',shareToken:'token-test',isActive:true,expiresAt:null},site:{storeName:'Test',prospectName:'Test',siteContractStatus:'demo',publishStatus:'draft'},writes:0,sends:0,saveError:false,replay:false,rpcError:null};
 const api=load('src/app/api/admin/demo-deliveries/route.ts',{
  '@/lib/auth/operator':{getOperatorAuth:async()=>state.auth},
  '@/lib/repositories/supabase/demo-share-supabase':{getDemoShareRepository:()=>({findById:async()=>state.share})},
  '@/lib/repositories':{getDemoSiteRepository:()=>({findById:async()=>state.site})},
  '@/lib/supabase/admin':{createAdminDbClient:()=>{const chain={eq:()=>chain,select:()=>chain,single:async()=>({data:{status:'tested'},error:state.saveError?Error('secret DB detail'):null})};return {rpc:async(name,args)=>{state.rpcName=name;state.rpcArgs=args;state.writes++;return {data:{claimed:!state.replay,delivery:{status:'processing'}},error:state.rpcError}},from:()=>({update:()=>chain})};}},
 });
 const request=(body,origin='https://app.example')=>new Request('https://app.example/api/admin/demo-deliveries',{method:'POST',headers:{origin,'content-type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});
 const payload={intent:'preview',shareId:'share-test',channel:'sms',recipient:'09012345678'};
 return {state,api,request,payload};
}
async function mode(value,fn){const old=process.env.DEMO_DELIVERY_MODE;process.env.DEMO_DELIVERY_MODE=value;try{await fn()}finally{if(old===undefined)delete process.env.DEMO_DELIVERY_MODE;else process.env.DEMO_DELIVERY_MODE=old}}
test('delivery routes reject anonymous and customer requests before accessing data',async()=>{
 const {state,api,request,payload}=setup();for(const [auth,expected] of [[{status:'unauthenticated'},401],[{status:'forbidden'},403]]){state.auth=auth;assert.equal((await api.POST(request(payload))).status,expected);assert.equal((await api.GET(new Request('https://app.example/api/admin/demo-deliveries?shareId=test'))).status,expected)}assert.equal(state.writes,0);
});
test('delivery rejects foreign origin, malformed JSON and oversized input without a reservation',async()=>{
 const{state,api,request,payload}=setup();assert.equal((await api.POST(request(payload,'https://foreign.example'))).status,403);
 for(const body of ['{','null','[]',JSON.stringify({...payload,channel:'other'})])assert.equal((await api.POST(request(body))).status,400);
 assert.equal((await api.POST(request('x'.repeat(4097)))).status,413);assert.equal(state.writes,0);
});
test('chunked input is cancelled at byte limit; split UTF-8 characters remain valid',async()=>{
 const {readDeliveryBody}=load('src/lib/delivery/core.ts');let cancelled=false;
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(4096));c.enqueue(new Uint8Array(1));},cancel(){cancelled=true}});
 await assert.rejects(()=>readDeliveryBody(new Request('https://app.example',{method:'POST',body:stream,duplex:'half'})),e=>e.status===413);assert.equal(cancelled,true);
 const bytes=new TextEncoder().encode('日本語');const split=new ReadableStream({start(c){c.enqueue(bytes.slice(0,2));c.enqueue(bytes.slice(2));c.close()}});
 assert.equal(await readDeliveryBody(new Request('https://app.example',{method:'POST',body:split,duplex:'half'})),'日本語');
});
test('revoked, expired, missing and suspended demos cannot be sent',async()=>mode('test',async()=>{
 const {state,api,request,payload}=setup();const share=state.share;
 for(const value of [null,{...share,isActive:false},{...share,expiresAt:'2000-01-01T00:00:00Z'}]){state.share=value;assert.equal((await api.POST(request(payload))).status,409)}
 state.share=share;for(const site of [null,{...state.site,siteContractStatus:'suspended'},{...state.site,siteContractStatus:'lost'}]){state.site=site;assert.equal((await api.POST(request(payload))).status,409)}assert.equal(state.writes,0);
}));
test('disabled mode and local URL in live mode cannot reserve or send',async()=>{
 const{state,api,request,payload}=setup();await mode('disabled',async()=>assert.equal((await api.POST(request(payload))).status,503));
 const old=process.env.NEXT_PUBLIC_APP_URL;process.env.NEXT_PUBLIC_APP_URL='http://localhost:3000';try{await mode('live',async()=>assert.equal((await api.POST(request(payload))).status,503))}finally{if(old===undefined)delete process.env.NEXT_PUBLIC_APP_URL;else process.env.NEXT_PUBLIC_APP_URL=old}assert.equal(state.writes,0);
});
test('test-mode send uses verified preview and replays one reservation without any provider',async()=>mode('test',async()=>{
 const{state,api,request,payload}=setup();const preview=await(await api.POST(request(payload))).json();assert.equal(preview.preview.mode,'test');
 const send={...payload,intent:'send',previewHash:preview.preview.hash,requestId:'00000000-0000-4000-8000-000000000001'};
 assert.equal((await api.POST(request({...send,recipient:'08012345678'}))).status,409);assert.equal(state.writes,0);
 let res=await api.POST(request(send));assert.equal(res.status,200);assert.equal((await res.json()).delivery.status,'tested');assert.equal(res.headers.get('cache-control'),'private, no-store');
 state.replay=true;res=await api.POST(request(send));assert.equal((await res.json()).delivery.status,'processing');
 state.replay=false;state.rpcError={code:'PT429'};assert.equal((await api.POST(request(send))).status,429);
 state.rpcError=null;state.saveError=true;res=await api.POST(request(send));assert.equal(res.status,503);assert.ok(!(await res.text()).includes('secret DB detail'));
}));

test('live delivery cannot bypass the persistent budget RPC when the schema is missing',async()=>{
 const names=['DEMO_DELIVERY_MODE','NEXT_PUBLIC_APP_URL','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM'];const saved=Object.fromEntries(names.map(n=>[n,process.env[n]]));const originalFetch=global.fetch;let externalCalls=0;
 Object.assign(process.env,{DEMO_DELIVERY_MODE:'live',NEXT_PUBLIC_APP_URL:'https://sakupage.jp',TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'fake-test-only',TWILIO_FROM:'SAKUPAGE'});global.fetch=async()=>{externalCalls++;throw Error('must not send')};
 try{const {state,api,request,payload}=setup();const preview=(await(await api.POST(request(payload))).json()).preview;assert.ok(preview);state.rpcError={code:'PGRST202'};const response=await api.POST(request({...payload,intent:'send',previewHash:preview.hash,requestId:'00000000-0000-4000-8000-000000000001'}));assert.equal(response.status,503);assert.equal(state.rpcName,'reserve_demo_delivery_v2');assert.ok(state.rpcArgs.p_sms_units>=1);assert.equal(externalCalls,0)}finally{global.fetch=originalFetch;for(const n of names){if(saved[n]===undefined)delete process.env[n];else process.env[n]=saved[n]}}
});
