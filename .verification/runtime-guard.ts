import {createHash} from 'node:crypto';
const preview='https://mesexqltlpybptifwsox.supabase.co';
let installed=false;
export function install(){
 if(installed)return;
 const e=process.env;
 if(e.VERCEL_ENV!=='preview'||e.VERCEL_GIT_COMMIT_REF!=='verify/sales-demo-runtime-20261124'||e.NEXT_PUBLIC_SUPABASE_URL!==preview)throw Error('VERIFY_RUNTIME_TARGET');
 // During Next build the private key is deliberately absent; build networking is denied.
 if(e.SUPABASE_SERVICE_ROLE_KEY&&createHash('sha256').update(e.SUPABASE_SERVICE_ROLE_KEY).digest('hex')!=='9f312a9e0ce281ba74d4e38448e54241f49f9b9ec1589d94694e72bac7852fde')throw Error('VERIFY_RUNTIME_KEY');
 const original=globalThis.fetch;
 globalThis.fetch=(input,init={})=>{
  const url=new URL(input instanceof Request?input.url:String(input));
  if(url.origin!==preview||url.username||url.password)throw Error('VERIFY_OUTBOUND_TARGET_DENIED');
  return original(input,{...init,redirect:'error'});
 };
 installed=true;
}
