const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {load} = require('./load-ts.cjs');
const {createDemoSiteFromForm} = load('src/lib/admin/demo-create.ts');
const {createEmptyDemoContent} = load('src/types/demo-content.ts');
const {validateOperatorSite} = load('src/lib/api/operator-input.ts');
const {demoSiteToRow,rowToDemoSite} = load('src/lib/repositories/supabase/mappers.ts');
const {resolveDemoStore} = load('src/lib/stores/demo-content-resolver.ts');
const adapters = load('src/lib/stores/demo-adapters.ts');
const {ImageConfigContext} = require('next/dist/shared/lib/image-config-context.shared-runtime');
const {imageConfigDefault} = require('next/dist/shared/lib/image-config');
const {buildNextImageRemotePatterns} = load('src/lib/images/remote-image-hosts.ts');
// Synthetic one-pixel PNGs; no files, credentials, network or real photos.
const images = [
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jV6kAAAAASUVORK5CYII=',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
];
const templates = [['cafe','cafe','CafePage','toCafeDataWithSamples'],['bar','bar','BarPage','toBarDataWithSamples'],['bal','bal','BalPage','toBalDataWithSamples'],['izakaya-casual','izakaya-casual','IzakayaCasualPage','toIzakayaCasualDataWithSamples'],['luxury-japanese','luxury-izakaya','LuxuryIzakayaPage','toLuxuryIzakayaDataWithSamples']];
function reload(site) {
 const checked = validateOperatorSite(site);
 return rowToDemoSite(JSON.parse(JSON.stringify(demoSiteToRow(checked))),JSON.parse(JSON.stringify(checked.content)));
}
for (const [id,folder,page,adapter] of templates) test('image replace/delete survives serialization and full template rendering: '+id, () => {
 const content = createEmptyDemoContent();
 const site = createDemoSiteFromForm({storeName:'架空画像店舗',storeSlug:'synthetic-'+folder,businessType:'cafe',sourceUrl:'',address:'架空市',templateId:id,prospectName:'架空店舗',contactPersonName:'',phone:'',email:'fixture@example.invalid',salesStatus:'considering',salesMemo:'PRIVATE_IMAGE_TEST',content}).demoSite;
 function assign(url) {
  for (const key of ['hero','interior','food','exterior','logo']) site.content.photos[key] = url;
  site.content.photos.gallery = url ? [{id:'fixture-gallery',url,alt:'架空ギャラリー',caption:'架空写真',sortOrder:0}] : [];
  site.content.menus = [{id:'fixture-menu',name:'架空メニュー',price:'900円',description:'架空料理',imageUrl:url,visible:true,sortOrder:0}];
 }
 function html(saved) {
  const resolved=resolveDemoStore(saved);
  const component=load('src/components/templates/'+folder+'/'+page+'.tsx')[page];
  return renderToStaticMarkup(React.createElement(ImageConfigContext.Provider,{value:{...imageConfigDefault,remotePatterns:buildNextImageRemotePatterns()}},React.createElement(component,{data:adapters[adapter](resolved.store,resolved.sampleFlags)})));
 }
 assign(images[0]);
 assert.ok(html(reload(site)).includes(images[0]));
 assign(images[1]);
 const updated=reload(site), rendered=html(updated);
 assert.equal(updated.content.photos.logo,images[1]);
 assert.equal(updated.content.photos.gallery[0].url,images[1]);
 assert.equal(updated.content.menus[0].imageUrl,images[1]);
 assert.ok(rendered.includes(images[1]));
 assert.ok(!rendered.includes(images[0]));
 assert.ok(!rendered.includes('PRIVATE_IMAGE_TEST'));
 assign('');
 const deleted=reload(site), afterDelete=html(deleted);
 assert.equal(deleted.content.photos.hero,'');
 assert.equal(deleted.content.photos.logo,'');
 assert.equal(deleted.content.photos.gallery.length,0);
 assert.ok(!afterDelete.includes(images[0])&&!afterDelete.includes(images[1]));
 assert.ok(afterDelete.includes('架空メニュー'));
});
