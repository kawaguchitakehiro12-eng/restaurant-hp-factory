/** Bound Auth requests (including response bodies); never retry or log credentials. */
export const AUTH_REQUEST_TIMEOUT_MS=15000;
export const boundedBrowserAuthFetch:typeof fetch=(input,init={})=>{
 const upstream=init.signal??(input instanceof Request?input.signal:undefined);
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),AUTH_REQUEST_TIMEOUT_MS);
 if(typeof timer==='object')timer.unref?.();
 const abort=()=>controller.abort(upstream?.reason);
 const cleanup=()=>{clearTimeout(timer);upstream?.removeEventListener('abort',abort);};
 controller.signal.addEventListener('abort',cleanup,{once:true});
 if(upstream?.aborted)abort();else upstream?.addEventListener('abort',abort,{once:true});
 return fetch(input,{...init,signal:controller.signal}).catch(error=>{cleanup();throw error;});
};
export function isAuthUnavailable(error:{status?:number}):boolean{return !error.status||error.status===429||error.status>=500;}
