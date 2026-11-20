const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
exports.load=(entry,mocks={})=>{
 const cache=new Map();
 function read(file){
  if(cache.has(file))return cache.get(file).exports;
  const loadedModule={exports:{}};cache.set(file,loadedModule);
  const requireFrom=createRequire(file);
  const localRequire=name=>{
   if(Object.hasOwn(mocks,name))return mocks[name];
   if(name.endsWith('.css'))return {};
   if(name.startsWith('@/')||name.startsWith('.')){
    let dest=name.startsWith('@/')?path.join(root,'src',name.slice(2)):path.resolve(path.dirname(file),name);
    for(const extension of ['', '.ts','.tsx','/index.ts','/index.tsx'])if(fs.existsSync(dest+extension)&&fs.statSync(dest+extension).isFile())return read(dest+extension);
   }
   return requireFrom(name);
  };
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInThisContext('(function(require,module,exports,__filename,__dirname){'+code+'\n})',{filename:file})(localRequire,loadedModule,loadedModule.exports,file,path.dirname(file));
  return loadedModule.exports;
 }
 return read(path.join(root,entry));
};
