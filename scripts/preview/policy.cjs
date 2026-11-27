'use strict';
const crypto=require('node:crypto');
const target=require('../../src/lib/supabase/preview-target.json');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function validateKey(key,role){
 const prefix=role==='anon'?'sb_publishable_':'sb_secret_';
 if(typeof key!=='string'||key.length>8192)throw Error('PREVIEW_KEY_MISSING_OR_INVALID');
 if(key.startsWith(prefix)&&/^sb_(publishable|secret)_[A-Za-z0-9_-]+$/.test(key))return;
 try{if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key))throw Error();const c=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString('utf8'));if(c.iss!=='supabase'||c.role!==role||c.ref!==target.projectId)throw Error();}catch{throw Error('PREVIEW_KEY_ROLE_OR_PROJECT_REJECTED');}
}
function branchOrigin(host){
 try{const u=new URL('https://'+host);if(u.hostname===target.productionAppHost||!u.hostname.endsWith('.vercel.app')||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash)throw Error();return u.origin;}catch{throw Error('PREVIEW_APP_ORIGIN_REJECTED');}
}
function validate(env,readiness,now=Date.now()){
 if(env.VERCEL_ENV!=='preview'||env.VERCEL!=='1'||env.VERCEL_GIT_COMMIT_REF!==target.branch)throw Error('PREVIEW_BRANCH_OR_ENVIRONMENT_REJECTED');
 if(env.NEXT_PUBLIC_SUPABASE_URL!==target.origin)throw Error('PREVIEW_DATABASE_ORIGIN_REJECTED');
 const app=branchOrigin(env.VERCEL_BRANCH_URL);
 if(env.NEXT_PUBLIC_APP_URL&&env.NEXT_PUBLIC_APP_URL!==app)throw Error('PREVIEW_APP_URL_OVERRIDE_REJECTED');
 if(env.OPERATOR_ATOMIC_WRITES_ENABLED!=='true'||env.DEMO_DELIVERY_MODE!=='disabled'||env.SALES_OPERATIONS_ENABLED!=='false'||env.MANUAL_BILLING_ENABLED!=='false')throw Error('PREVIEW_FEATURE_FLAGS_REJECTED');
 if((env.MEDIA_STORAGE_MODE&&env.MEDIA_STORAGE_MODE!=='disabled')||env.NEXT_PUBLIC_MEDIA_ORIGIN||(env.SAKUPAGE_COMMERCE_MODE&&env.SAKUPAGE_COMMERCE_MODE!=='disabled'))throw Error('PREVIEW_EXTERNAL_PROVIDER_MODE_REJECTED');
 for(const [name,value]of Object.entries(env))if(value&&/^(TWILIO_|RESEND_|STRIPE_|GMO_|R2_|AWS_ACCESS_KEY|DATABASE_URL$|POSTGRES_URL|SUPABASE_DB_)/.test(name))throw Error('PREVIEW_UNEXPECTED_PROVIDER_CREDENTIALS');
 validateKey(env.NEXT_PUBLIC_SUPABASE_ANON_KEY,'anon');validateKey(env.SUPABASE_SERVICE_ROLE_KEY,'service_role');
 if(!readiness||readiness.schema!=='SAKU-PREVIEW-READINESS-1'||readiness.status!=='REVIEWED'||readiness.projectId!==target.projectId||!/^[a-f0-9]{64}$/.test(readiness.dbAuditSha256??''))throw Error('PREVIEW_READINESS_NOT_REVIEWED');
 const at=Date.parse(readiness.keyMembershipVerifiedAt??'');
 if(!Number.isFinite(at)||at>now||now-at>24*3600000)throw Error('PREVIEW_KEY_MEMBERSHIP_EXPIRED_OR_UNKNOWN');
 if(readiness.publicKeySha256!==hash(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)||readiness.secretKeySha256!==hash(env.SUPABASE_SERVICE_ROLE_KEY))throw Error('PREVIEW_KEY_FINGERPRINT_MISMATCH');
 return {appOrigin:app,projectId:target.projectId};
}
function buildEnvironment(parent,approved){
 const env={};for(const name of ['PATH','SystemRoot','WINDIR','COMSPEC','HOME','TMPDIR','TEMP','TMP','CI','VERCEL','VERCEL_ENV','VERCEL_URL','VERCEL_BRANCH_URL','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_COMMIT_SHA'])if(parent[name])env[name]=parent[name];
 Object.assign(env,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_SAKUPAGE_PREVIEW_ONLY:'true',NEXT_PUBLIC_APP_URL:approved.appOrigin,NEXT_PUBLIC_SUPABASE_URL:target.origin,NEXT_PUBLIC_SUPABASE_ANON_KEY:parent.NEXT_PUBLIC_SUPABASE_ANON_KEY,OPERATOR_ATOMIC_WRITES_ENABLED:'true',DEMO_DELIVERY_MODE:'disabled',SALES_OPERATIONS_ENABLED:'false',MANUAL_BILLING_ENABLED:'false',MEDIA_STORAGE_MODE:'disabled',SAKUPAGE_COMMERCE_MODE:'disabled'});
 return env;
}
module.exports={validate,validateKey,branchOrigin,buildEnvironment,target,hash};
