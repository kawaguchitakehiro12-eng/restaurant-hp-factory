const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
exports.load=(entry,mocks={},options={})=>{
 if(options.environment!==undefined&&!['server','client'].includes(options.environment))throw Error('TEST_ENVIRONMENT_INVALID');
 const cache=new Map();
 function read(file,inheritedClient=false){
  const source=fs.readFileSync(file,'utf8');
  if(path.extname(file)==='.json')return JSON.parse(source);
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  let directiveClient=false;
  for(const statement of ast.statements){if(!ts.isExpressionStatement(statement)||!ts.isStringLiteral(statement.expression))break;if(statement.expression.text==='use client')directiveClient=true;}
  const client=inheritedClient||directiveClient||options.environment==='client';
  const cacheKey=(client?'client:':'server:')+file;
  if(cache.has(cacheKey))return cache.get(cacheKey).exports;
  const loadedModule={exports:{}};cache.set(cacheKey,loadedModule);
  const requireFrom=createRequire(file);
  const localRequire=name=>{
   // Model Next's condition-specific marker using its installed implementations.
   // This is unit-test resolution, not a substitute for the Next compiler.
   if(name==='server-only')return requireFrom(client?'next/dist/compiled/server-only':'next/dist/compiled/server-only/empty');
   if(Object.hasOwn(mocks,name))return mocks[name];
   if(name.endsWith('.css'))return {};
   if(name.startsWith('@/')||name.startsWith('.')){
    let dest=name.startsWith('@/')?path.join(root,'src',name.slice(2)):path.resolve(path.dirname(file),name);
    for(const extension of ['', '.ts','.tsx','/index.ts','/index.tsx'])if(fs.existsSync(dest+extension)&&fs.statSync(dest+extension).isFile())return read(dest+extension,client);
   }
   return requireFrom(name);
  };
  const code=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInThisContext('(function(require,module,exports,__filename,__dirname){'+code+'\n})',{filename:file})(localRequire,loadedModule,loadedModule.exports,file,path.dirname(file));
  return loadedModule.exports;
 }
 return read(path.join(root,entry));
};
