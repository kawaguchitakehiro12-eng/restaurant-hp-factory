const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{load}=require('./load-ts.cjs');
const {createDemoSiteFromForm}=load('src/lib/admin/demo-create.ts');
const {changeDemoTemplate}=load('src/lib/admin/demo-template-change.ts');
const {createEmptyDemoContent}=load('src/types/demo-content.ts');
const {validateOperatorSite}=load('src/lib/api/operator-input.ts');
const {demoSiteToRow,rowToDemoSite}=load('src/lib/repositories/supabase/mappers.ts');
const {resolveDemoStore}=load('src/lib/stores/demo-content-resolver.ts');
const adapters=load('src/lib/stores/demo-adapters.ts');
// Direct SSR does not run Next's config loader. Supply the SAME real image config
// through Next's context; do not replace next/image or skip its validation.
const {ImageConfigContext}=require('next/dist/shared/lib/image-config-context.shared-runtime');
const {imageConfigDefault}=require('next/dist/shared/lib/image-config');
const {buildNextImageRemotePatterns}=load('src/lib/images/remote-image-hosts.ts');
const templates=[['cafe','cafe','CafePage','toCafeDataWithSamples'],['bar','bar','BarPage','toBarDataWithSamples'],['bal','bal','BalPage','toBalDataWithSamples'],['izakaya-casual','izakaya-casual','IzakayaCasualPage','toIzakayaCasualDataWithSamples'],['luxury-japanese','luxury-izakaya','LuxuryIzakayaPage','toLuxuryIzakayaDataWithSamples']];
for(const[id,folder,page,adapter]of templates)test('synthetic create/edit/serialize/reload/share/full-page SSR: '+id,async()=>{
 const content=createEmptyDemoContent();Object.assign(content.basicInfo,{address:'架空店舗住所',phone:'0300000000',businessHours:'11:00-20:00',concept:'架空店舗の保存した紹介文',catchCopy:'架空店舗キャッチ'});
 for(const role of ['hero','interior','food','exterior'])content.photos[role]='/branding/site-placeholder.svg';
 content.menus=[{id:'synthetic-menu',name:'架空保存メニュー',price:'900円',description:'架空の料理',imageUrl:'/branding/site-placeholder.svg',visible:true,sortOrder:0}];
 const initial=createDemoSiteFromForm({storeName:'架空デモ店舗',storeSlug:'synthetic-'+folder,businessType:'cafe',sourceUrl:'',address:content.basicInfo.address,templateId:'cafe',prospectName:'架空営業先',contactPersonName:'',phone:'',email:'fixture@example.invalid',salesStatus:'considering',salesMemo:'PRIVATE_SALES_MEMO',content}).demoSite;
 const edited=validateOperatorSite(changeDemoTemplate(initial,id));
 const row=JSON.parse(JSON.stringify(demoSiteToRow(edited))),savedContent=JSON.parse(JSON.stringify(edited.content));
 const reloaded=rowToDemoSite(row,savedContent);assert.equal(reloaded.templateId,id);assert.deepEqual(reloaded.content,savedContent);
 const share={id:'synthetic-share',demoSiteId:reloaded.id,shareToken:'SYNTHETIC_ONLY',isActive:true,viewCount:0,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+7*86400000).toISOString()};let recorded=0;
 const {loadSharedDemoPage}=load('src/lib/share/load-shared-demo.ts',{'@/lib/repositories':{getDemoSiteRepository:()=>({findById:async()=>reloaded})},'@/lib/repositories/supabase/demo-share-supabase':{getDemoShareRepository:()=>({findByToken:async()=>share,recordView:async()=>{recorded++;return share}})}});
 const shared=await loadSharedDemoPage(share.shareToken);assert.equal(shared.status,'found');assert.equal(recorded,1);
 const resolved=resolveDemoStore(reloaded),data=adapters[adapter](resolved.store,resolved.sampleFlags),component=load('src/components/templates/'+folder+'/'+page+'.tsx')[page];
 const html=renderToStaticMarkup(React.createElement(ImageConfigContext.Provider,{value:{...imageConfigDefault,remotePatterns:buildNextImageRemotePatterns()}},React.createElement(component,{data})));
 assert.ok(html.includes('架空デモ店舗'));assert.ok(html.includes('架空保存メニュー'));assert.ok(html.includes('/branding/site-placeholder.svg'));assert.ok(!html.includes('PRIVATE_SALES_MEMO'));
});
