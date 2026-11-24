'use strict';
const fs=require('node:fs'),path=require('node:path');
function inside(base,target){const relative=path.relative(base,target);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
function scanArtifacts(root,secret,io=fs){
 if(!Buffer.isBuffer(secret)||secret.length===0)throw Error('RELEASE_SCAN_SECRET_MISSING');
 const output=io.realpathSync(path.join(root,'.next')),modules=io.realpathSync(path.join(root,'node_modules'));
 const visited=new Set();let files=0;
 function inspect(input){
  const real=io.realpathSync(input);
  // Next emits dependency/trace symlinks. Resolve and scan them; never skip their bytes.
  // Only the build output and this installation's dependency tree are trusted roots.
  if(!inside(output,real)&&!inside(modules,real))throw Error('RELEASE_ARTIFACT_LINK_OUTSIDE_ROOTS');
  if(/^\.env(?:\.|$)/i.test(path.basename(real)))throw Error('RELEASE_ARTIFACT_ENV_FILE_REJECTED');
  if(visited.has(real))return;visited.add(real);
  const stat=io.lstatSync(real);
  if(stat.isDirectory()){for(const name of io.readdirSync(real))inspect(path.join(real,name));}
  else if(stat.isFile()){files++;if(io.readFileSync(real).includes(secret))throw Error('RELEASE_SECRET_IN_ARTIFACT');}
  else throw Error('RELEASE_ARTIFACT_SPECIAL_FILE_REJECTED');
 }
 inspect(output);return {files};
}
module.exports={scanArtifacts,inside};
