const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load-ts.cjs');
const { createDemoSiteFromForm } = load('src/lib/admin/demo-create.ts');
const { createEmptyDemoContent } = load('src/types/demo-content.ts');
const form = { storeName:'架空食堂', storeSlug:'synthetic-address', businessType:'cafe', sourceUrl:'', address:' 架空市1-2-3 ', templateId:'cafe', prospectName:'架空食堂', contactPersonName:'架空担当', phone:'PRIVATE_SALES_PHONE', email:'fixture@example.invalid', salesStatus:'not_contacted', salesMemo:'' };
test('manual creation carries registered public address into editable content, without private contacts', () => {
  const site = createDemoSiteFromForm(form).demoSite;
  assert.equal(site.content.basicInfo.address, '架空市1-2-3');
  assert.equal(site.content.basicInfo.phone, '');
});
test('imported address wins and the supplied nested content is not modified', () => {
  const content = createEmptyDemoContent();
  content.basicInfo.address = '取り込み済み住所';
  assert.equal(createDemoSiteFromForm({...form, content}).demoSite.content.basicInfo.address, '取り込み済み住所');
  content.basicInfo.address = '';
  assert.equal(createDemoSiteFromForm({...form, content}).demoSite.content.basicInfo.address, '架空市1-2-3');
  assert.equal(content.basicInfo.address, '');
});
