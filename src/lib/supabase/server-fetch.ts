/** Bound server-side DB/Auth HTTP requests; never log headers or response bodies. */
export const SERVER_REQUEST_TIMEOUT_MS=15000;
export const boundedServerFetch:typeof fetch=(input,init={})=>{
  const upstream=init.signal??(input instanceof Request?input.signal:undefined);
  const timeout=AbortSignal.timeout(SERVER_REQUEST_TIMEOUT_MS);
  return fetch(input,{...init,signal:upstream?AbortSignal.any([upstream,timeout]):timeout});
};
