const {test}=require('node:test'),assert=require('node:assert/strict');
const {safeSupabaseDiagnostic}=require('./load-ts.cjs').load('src/lib/supabase/safe-diagnostic.ts');
for(const code of ['PGRST301','42501','PGRST205'])test('only known provider diagnostic '+code,()=>assert.equal(safeSupabaseDiagnostic({code,message:'SYNTHETIC_SECRET_CANARY',details:'SYNTHETIC_PRIVATE'}),code));
for(const error of [null,'SYNTHETIC_SECRET_CANARY',{code:'SYNTHETIC_SECRET_CANARY',message:'SYNTHETIC_SECRET_CANARY'},{message:'https://private.invalid/?token=SYNTHETIC'}])test('unknown data never serialized '+typeof error,()=>assert.equal(safeSupabaseDiagnostic(error),'UPSTREAM_UNKNOWN'));
test('fixed Preview origin denial recognized',()=>assert.equal(safeSupabaseDiagnostic(new Error('Preview Supabase destination rejected')),'PREVIEW_BASE_REJECTED'));
