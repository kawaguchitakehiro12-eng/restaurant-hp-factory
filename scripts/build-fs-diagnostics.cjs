// Observes errors only; never retries, suppresses, or changes permissions.
const fs=require('node:fs'),path=require('node:path');
function describe(p,error,options){if(error?.code!=='EPERM')return;const target=String(p);let stat,parent;try{stat=fs.statSync(target)}catch{}try{parent=fs.statSync(path.dirname(target))}catch{}console.error('BUILD_FS_DIAGNOSTIC '+JSON.stringify({code:error.code,operation:'mkdir',path:path.relative(process.cwd(),target),recursive:options?.recursive??false,exists:!!stat,directory:stat?.isDirectory()??false,parentDirectory:parent?.isDirectory()??false}));}
const promiseMkdir=fs.promises.mkdir.bind(fs.promises);fs.promises.mkdir=async function(p,options){try{return await promiseMkdir(p,options)}catch(e){describe(p,e,options);throw e}};
const sync=fs.mkdirSync.bind(fs);fs.mkdirSync=function(p,options){try{return sync(p,options)}catch(e){describe(p,e,options);throw e}};

const callbackMkdir=fs.mkdir.bind(fs);fs.mkdir=function(p,options,callback){if(typeof options==='function'){const cb=options;return callbackMkdir(p,(error,result)=>{if(error)describe(p,error,{});cb(error,result)})}return callbackMkdir(p,options,(error,result)=>{if(error)describe(p,error,options);callback(error,result)})};
