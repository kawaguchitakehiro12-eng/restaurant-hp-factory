const {test}=require('node:test'),assert=require('node:assert/strict');const {load}=require('./load-ts.cjs');
const core=load('src/lib/delivery/core.ts');
test('delivery defaults to non-sending test mode; malformed settings stop delivery',()=>{
 assert.equal(core.deliveryMode({}),'test');assert.equal(core.deliveryMode({DEMO_DELIVERY_MODE:'typo'}),'disabled');
 assert.equal(core.dailyDeliveryLimit({}),100);assert.throws(()=>core.dailyDeliveryLimit({DEMO_DELIVERY_DAILY_LIMIT:'0'}));
});
test('recipient validation permits Japanese mobile numbers and one email only',()=>{
 assert.equal(core.normalizeRecipient('sms','090-1234-5678'),'+819012345678');assert.equal(core.normalizeRecipient('sms','+81 80 1234 5678'),'+818012345678');
 for(const x of ['03-1234-5678','+12025550123','0901234567','090123456789'])assert.throws(()=>core.normalizeRecipient('sms',x));
 assert.equal(core.normalizeRecipient('email',' person@example.invalid '),'person@example.invalid');
 for(const x of ['a@b','a@b.example,b@c.example','a@b.example\r\nBcc:x@y.example'])assert.throws(()=>core.normalizeRecipient('email',x));
});
test('real delivery refuses localhost, private IPs, credentials and insecure URLs',()=>{
 for(const x of [undefined,'http://sakupage.jp','https://localhost','https://localhost.local','https://127.0.0.1','https://192.168.1.1','https://[::1]','https://user:pass@sakupage.jp','https://sakupage.jp/path'])assert.throws(()=>core.publicDeliveryBase(x));
 assert.equal(core.publicDeliveryBase('https://sakupage.jp/'),'https://sakupage.jp');
});
test('Twilio adapter posts Japanese SMS using authenticated fixed endpoint',async()=>{
 let calls=0;const env={TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'test-only',TWILIO_FROM:'SAKUPAGE'};
 const result=await core.dispatchMessage({channel:'sms',recipient:'+819012345678',text:'テスト',subject:'',id:'test'},env,async(url,init)=>{calls++;assert.match(url,/^https:\/\/api.twilio.com\//);assert.equal(init.method,'POST');assert.equal(init.body.get('To'),'+819012345678');assert.equal(init.body.get('Body'),'テスト');assert.equal(init.redirect,'error');return Response.json({sid:'SMtest'},{status:201});});
 assert.equal(calls,1);assert.equal(result.status,'accepted');assert.equal(result.providerId,'SMtest');
});
test('Resend adapter uses plain text, a single recipient and stable idempotency key',async()=>{
 const result=await core.dispatchMessage({channel:'email',recipient:'person@example.invalid',text:'本文',subject:'件名',id:'request-1'},{RESEND_API_KEY:'test-only',DEMO_EMAIL_FROM:'SAKUPAGE <demo@sakupage.jp>'},async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');assert.equal(init.headers['Idempotency-Key'],'request-1');assert.deepEqual(JSON.parse(init.body).to,['person@example.invalid']);return Response.json({id:'email-test'});});assert.equal(result.status,'accepted');
});
test('provider failures and timeouts never automatically retry or claim delivery',async()=>{
 const env={RESEND_API_KEY:'test-only',DEMO_EMAIL_FROM:'demo@sakupage.jp'},message={channel:'email',recipient:'p@example.invalid',text:'test',subject:'test',id:'test'};
 for(const [status,expected] of [[400,'failed'],[429,'failed'],[500,'unknown'],[408,'unknown']]){let calls=0;assert.equal((await core.dispatchMessage(message,env,async()=>{calls++;return new Response('',{status});})).status,expected);assert.equal(calls,1);}
 assert.equal((await core.dispatchMessage(message,env,async()=>{throw Error('secret provider details');})).status,'unknown');
 await assert.rejects(()=>core.dispatchMessage(message,{},async()=>{throw Error('must not call');}),/接続設定/);
});
