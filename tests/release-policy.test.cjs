const test=require('node:test'),assert=require('node:assert/strict');
const {validate,buildEnvironment,flags}=require('../scripts/release/build.cjs');
const fixture=()=>({...flags,VERCEL_ENV:'production',NEXT_PUBLIC_APP_URL:'https://restaurant-hp-factory.vercel.app',NEXT_PUBLIC_SUPABASE_URL:'https://noxabdulnciuezartiuj.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'sb_publishable_SYNTHETIC_ONLY',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_SYNTHETIC_ONLY',OPERATOR_ATOMIC_WRITES_ENABLED:'true'});
test('release guard checks configuration without connecting to a database',()=>assert.equal(validate(fixture()),true));
test('Preview database, origin, marker and deployment environment are refused',()=>{
 for(const patch of [{NEXT_PUBLIC_SUPABASE_URL:'https://mesexqltlpybptifwsox.supabase.co'},{NEXT_PUBLIC_APP_URL:'https://preview.invalid'},{NEXT_PUBLIC_SAKUPAGE_PREVIEW_ONLY:'true'},{VERCEL_ENV:'preview'},{OPERATOR_ATOMIC_WRITES_ENABLED:'false'}])assert.throws(()=>validate({...fixture(),...patch}));
});
test('each deferred feature must be explicitly disabled',()=>{for(const name of Object.keys(flags)){assert.throws(()=>validate({...fixture(),[name]:'live'}));const env=fixture();delete env[name];assert.throws(()=>validate(env));}});
test('wrong key roles and missing credentials stop the build',()=>{for(const patch of [{NEXT_PUBLIC_SUPABASE_ANON_KEY:'sb_secret_SYNTHETIC_ONLY'},{SUPABASE_SERVICE_ROLE_KEY:'sb_publishable_SYNTHETIC_ONLY'},{SUPABASE_SERVICE_ROLE_KEY:undefined}])assert.throws(()=>validate({...fixture(),...patch}));});
test('Next child receives public configuration, never Secret, hooks or provider credentials',()=>{
 const env=buildEnvironment({...fixture(),NODE_OPTIONS:'SYNTHETIC_HOOK',STRIPE_SECRET_KEY:'SYNTHETIC_PROVIDER',R2_SECRET_ACCESS_KEY:'SYNTHETIC_R2'});
 for(const name of ['SUPABASE_SERVICE_ROLE_KEY','NODE_OPTIONS','STRIPE_SECRET_KEY','R2_SECRET_ACCESS_KEY'])assert.equal(name in env,false);
 assert.equal(env.NEXT_PUBLIC_SUPABASE_ANON_KEY,fixture().NEXT_PUBLIC_SUPABASE_ANON_KEY);
});
