const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const {load}=require('./load-ts.cjs');const root=path.resolve(__dirname,'..');
for(const file of ['src/lib/supabase/admin.ts','src/lib/supabase/server-config.ts']){
 test('server test context accepts marker '+file,()=>{const exports=load(file);assert.ok(Object.keys(exports).length>0)});
 test('client context rejects actual installed Next marker '+file,()=>assert.throws(()=>load(file,{}, {environment:'client'}),/cannot be imported from a Client Component/));
 test('client cannot override marker with an empty test mock '+file,()=>assert.throws(()=>load(file,{'server-only':{}},{environment:'client'}),/cannot be imported from a Client Component/));
}
for(const entry of ['src/lib/repositories/index.ts','src/lib/api/supabase-route.ts'])test('transitive client import rejected '+entry,()=>assert.throws(()=>load(entry,{}, {environment:'client'}),/cannot be imported from a Client Component/));
test('shared public config has no secret lookup or administrative export',()=>{const p=load('src/lib/supabase/config.ts',{}, {environment:'client'});assert.deepEqual(Object.keys(p),['isSupabaseConfigured']);assert.ok(!fs.readFileSync(path.join(root,'src/lib/supabase/config.ts'),'utf8').includes('SUPABASE_SERVICE_ROLE_KEY'))});
test('installed server marker rejects default and accepts server implementation',()=>{assert.throws(()=>require('next/dist/compiled/server-only'),/Client Component/);assert.deepEqual(require('next/dist/compiled/server-only/empty'),{})});
const jwt=role=>[Buffer.from('{"alg":"HS256"}').toString('base64url'),Buffer.from(JSON.stringify({iss:'supabase',role})).toString('base64url'),'syntheticSignature'].join('.');
async function envCase(format,missing,body){const names=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'],old=names.map(n=>process.env[n]);try{process.env[names[0]]='https://mesexqltlpybptifwsox.supabase.co';process.env[names[1]]=format==='legacy'?jwt('anon'):'sb_publishable_SYNTHETIC';process.env[names[2]]=format==='legacy'?jwt('service_role'):'sb_secret_SYNTHETIC';if(missing)delete process.env[missing];await body()}finally{names.forEach((n,i)=>{if(old[i]===undefined)delete process.env[n];else process.env[n]=old[i]})}}
for(const format of ['legacy','opaque'])for(const missing of [null,'NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'])test('presence checks retain semantics '+format+' '+(missing??'complete'),async()=>envCase(format,missing,()=>{const pub=load('src/lib/supabase/config.ts'),admin=load('src/lib/supabase/server-config.ts');assert.equal(pub.isSupabaseConfigured(),missing===null||missing==='SUPABASE_SERVICE_ROLE_KEY');assert.equal(admin.isSupabaseAdminConfigured(),missing===null);assert.equal(typeof admin.isSupabaseAdminConfigured(),'boolean')}));

// Limited static graph: transpile away type-only edges, then follow literal source
// require/import edges. Third-party internals and computed dynamic imports are not proven.
const compiled=new Map();
function inspect(file){
 if(compiled.has(file))return compiled.get(file);
 const source=fs.readFileSync(file,'utf8');
 const sourceAst=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);let client=false;
 for(const statement of sourceAst.statements){if(!ts.isExpressionStatement(statement)||!ts.isStringLiteral(statement.expression))break;if(statement.expression.text==='use client')client=true;}
 const js=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const ast=ts.createSourceFile(file,js,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),imports=[];
 function visit(n){if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&n.expression.text==='require'&&n.arguments.length===1&&ts.isStringLiteral(n.arguments[0]))imports.push(n.arguments[0].text);ts.forEachChild(n,visit)}visit(ast);
 const result={imports,client};compiled.set(file,result);return result;
}
function clientLeaks(entry){const seen=new Set(),leaks=[];function walk(file){if(seen.has(file))return;seen.add(file);const info=inspect(file);if(info.imports.includes('server-only')){leaks.push(path.relative(root,file));return;}for(const name of info.imports){if(!name.startsWith('@/')&&!name.startsWith('.'))continue;const target=name.startsWith('@/')?path.join(root,'src',name.slice(2)):path.resolve(path.dirname(file),name);for(const suffix of ['', '.ts','.tsx','/index.ts','/index.tsx']){if(fs.existsSync(target+suffix)&&fs.statSync(target+suffix).isFile()){if(/\.tsx?$/.test(target+suffix))walk(target+suffix);break;}}}}walk(path.join(root,entry));return leaks;}
test('static graph catches direct and transitive administrative imports',()=>{assert.ok(clientLeaks('src/lib/supabase/admin.ts').length>0);assert.ok(clientLeaks('src/lib/supabase/server-config.ts').length>0);assert.ok(clientLeaks('src/lib/repositories/index.ts').length>0)});
test('all current use-client source roots avoid server-only modules on literal source edges',()=>{const roots=[];function walk(dir){for(const name of fs.readdirSync(dir)){const file=path.join(dir,name);if(fs.statSync(file).isDirectory())walk(file);else if(/\.tsx?$/.test(file)&&inspect(file).client)roots.push(path.relative(root,file));}}walk(path.join(root,'src'));assert.ok(roots.length>0);for(const entry of roots)assert.deepEqual(clientLeaks(entry),[],`client graph leak in ${entry}`)});
