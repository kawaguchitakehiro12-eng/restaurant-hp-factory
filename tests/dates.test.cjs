const {test}=require('node:test'),assert=require('node:assert/strict');const {load}=require('./load-ts.cjs');
const utils=load('src/lib/admin/form-utils.ts');
test('billing months clamp at month end without drifting into the following month',()=>{
 assert.equal(utils.addCalendarMonths('2026-01-31',1),'2026-02-28');assert.equal(utils.addCalendarMonths('2028-01-31',1),'2028-02-29');assert.equal(utils.addCalendarMonths('2026-12-31',1),'2027-01-31');
 assert.equal(utils.addMonths('2026-11-01',6),'2027-04-30');assert.throws(()=>utils.addCalendarMonths('2026-02-30',1));
});
test('passwords use crypto and enforce useful length bounds; slug finalization retains internal hyphens',()=>{
 assert.equal(utils.generateTempPassword().length,12);for(const length of [0,7,129,1.2])assert.throws(()=>utils.generateTempPassword(length));assert.equal(utils.normalizeSlug('ZZ--Auth-Test-'),'zz-auth-test');
});
