const {test}=require('node:test'),assert=require('node:assert/strict');const {load}=require('./load-ts.cjs');
test('contracted templates never resurrect sample menus, contacts or deleted photos',()=>{
 const {resolveDemoStore}=load('src/lib/stores/demo-content-resolver.ts');const {createEmptyDemoContent}=load('src/types/demo-content.ts');
 for(const [templateId,templateType]of [['luxury-japanese','luxury-izakaya'],['cafe','cafe'],['bar','bar'],['bal','bal'],['izakaya-casual','izakaya-casual']]){
  const demo={id:'test',storeId:'test',storeName:'Test Store',storeSlug:'test',templateId,templateType,siteContractStatus:'contracted',content:createEmptyDemoContent()};
  const {store,sampleFlags}=resolveDemoStore(demo);
  assert.equal(store.address,'');assert.equal(store.phone,'');assert.equal(store.menu.length,0);assert.equal(store.topics.length,0);assert.equal(store.courses.length,0);assert.ok(store.photos.every(p=>p.url==='/branding/site-placeholder.svg'));assert.equal(sampleFlags.menuItemIds.length,0);
 }
});
