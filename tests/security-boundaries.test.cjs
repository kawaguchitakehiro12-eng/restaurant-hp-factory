const {test}=require('node:test'),assert=require('node:assert/strict');const{load}=require('./load-ts.cjs');
test('normal and shared visibility matrix excludes all suspended/lost/unknown states',()=>{
 const {isPublicSiteVisible:publicView,isSharedSiteVisible:sharedView}=load('src/lib/stores/site-visibility.ts');
 for(const contract of ['demo','contracted','suspended','lost','unknown'])for(const publish of ['draft','published','suspended','unknown']){
  const site={siteContractStatus:contract,publishStatus:publish};assert.equal(publicView(site),contract==='contracted'&&publish==='published');
  assert.equal(sharedView(site),['demo','contracted'].includes(contract)&&['draft','published'].includes(publish));
 }
});
test('all five templates respect normal public API and shared loader boundaries',async()=>{
 for(const template of ['luxury-izakaya','cafe','bar','bal','izakaya-casual']){
  let site={id:'fixture',storeSlug:'fixture',storeName:'Fixture',prospectName:'Fixture',templateType:template,siteContractStatus:'demo',publishStatus:'draft'};
  let share={id:'share',demoSiteId:'fixture',isActive:true,expiresAt:null};const mocks={'@/lib/repositories':{getDemoSiteRepository:()=>({findById:async()=>site,findBySlug:async()=>site})},'@/lib/repositories/supabase/demo-share-supabase':{getDemoShareRepository:()=>({findByToken:async()=>share})},'@/lib/stores/demo-content-resolver':{resolveDemoStore:()=>({store:{name:'fixture'}})},'@/lib/api/supabase-route':{requireSupabaseAdmin:()=>null}};
  const loader=load('src/lib/share/load-shared-demo.ts',mocks),route=load('src/app/api/public/sites/[slug]/route.ts',mocks);
  const get=async()=>JSON.parse(await(await route.GET(new Request('https://fixture.invalid/api/public/sites/fixture'),{params:Promise.resolve({slug:'fixture'})})).text());
  assert.equal((await get()).visible,false);assert.equal((await loader.peekSharedDemoPage('fixture')).status,'found');
  for(const stopped of [{siteContractStatus:'suspended'},{publishStatus:'suspended'},{siteContractStatus:'lost'}]){const original={...site};Object.assign(site,stopped);assert.equal((await get()).visible,false);assert.equal((await loader.peekSharedDemoPage('fixture')).status,'not_found');site=original;}
  share={...share,isActive:false};assert.equal((await loader.peekSharedDemoPage('fixture')).status,'expired');share={...share,isActive:true,expiresAt:'2000-01-01'};assert.equal((await loader.peekSharedDemoPage('fixture')).status,'expired');
 }
});
test('SSRF denies private/reserved/encoded IPv4 and IPv6 URLs including mapped addresses',()=>{
 const {parsePublicUrl,isPublicAddress}=load('src/lib/admin/demo-url-import/safe-http.ts');
 for(const host of ['localhost','foo.local','172.16.0.1','169.254.169.254','100.64.0.1','0.0.0.0','127.1','2130706433','0x7f000001','[::1]','[::ffff:127.0.0.1]','[fc00::1]','[fe80::1]','[2001:db8::1]'])assert.throws(()=>parsePublicUrl('http://'+host));
 for(const url of ['http://user:password@public.org','https://public.org:8443','file:///etc/passwd'])assert.throws(()=>parsePublicUrl(url));
 assert.equal(isPublicAddress('8.8.8.8'),true);assert.equal(isPublicAddress('2606:4700:4700::1111'),true);
});
test('SSRF rejects mixed/private DNS and pins a validated public result',async()=>{
 const{resolvePublicTarget}=load('src/lib/admin/demo-url-import/safe-http.ts');const url=new URL('https://public.org');
 for(const addresses of [[{address:'10.0.0.1',family:4}],[{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}],[]])await assert.rejects(()=>resolvePublicTarget(url,async()=>addresses));
 assert.deepEqual(await resolvePublicTarget(url,async()=>[{address:'8.8.8.8',family:4}]),{address:'8.8.8.8',family:4});
});
test('SSRF rechecks redirect DNS, rejects private redirects, redirect loops and DNS timeout',async()=>{
 const{safeReadUrl}=load('src/lib/admin/demo-url-import/safe-http.ts');let calls=0;
 await assert.rejects(()=>safeReadUrl('https://public.org',{limit:100},{resolve:async()=>({address:'8.8.8.8',family:4}),request:async()=>{calls++;return {status:302,headers:new Headers({location:'http://169.254.169.254/'}),body:Buffer.alloc(0)}}}));assert.equal(calls,1);
 let dns=0;await assert.rejects(()=>safeReadUrl('https://public.org',{limit:100},{resolve:async()=>{if(++dns>1)throw Error('private DNS');return {address:'8.8.8.8',family:4}},request:async()=>({status:302,headers:new Headers({location:'https://other.org/'}),body:Buffer.alloc(0)})}));assert.equal(dns,2);
 await assert.rejects(()=>safeReadUrl('https://public.org',{limit:100},{resolve:async()=>({address:'8.8.8.8',family:4}),request:async()=>({status:302,headers:new Headers({location:'/loop'}),body:Buffer.alloc(0)})}));
 await assert.rejects(()=>safeReadUrl('https://public.org',{limit:100,timeout:10},{resolve:()=>new Promise(()=>{}),request:async()=>{throw Error('must not connect')}}));
});
test('native HTTP transport pins DNS and terminates oversized HTML and image responses',async()=>{
 const{EventEmitter}=require('events');let options,destroyed=false;const send=(url,opts,callback)=>{options=opts;const req=new EventEmitter();req.end=()=>{const res=new EventEmitter();res.headers={'content-type':'text/html'};res.statusCode=200;res.destroy=()=>{destroyed=true};callback(res);queueMicrotask(()=>{res.emit('data',Buffer.alloc(101));res.emit('end')})};return req};
 const {safeReadUrl}=load('src/lib/admin/demo-url-import/safe-http.ts',{'node:dns/promises':{lookup:async()=>[{address:'8.8.8.8',family:4}]},'node:https':{request:send}});
 await assert.rejects(()=>safeReadUrl('https://public.org',{limit:100}));assert.equal(destroyed,true);assert.equal(options.agent,false);assert.equal(options.family,4);options.lookup('public.org',{},(error,address,family)=>{assert.equal(error,null);assert.equal(address,'8.8.8.8');assert.equal(family,4)});
 const prefix=await safeReadUrl('https://public.org',{limit:100,prefixOnly:true});assert.equal(prefix.body.length,100);
});
