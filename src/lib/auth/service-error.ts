/** Distinguish infrastructure failure from a rejected/missing session. Never log the error object. */
export function isAuthUnavailable(error:unknown):boolean {
 if(!error||typeof error!=="object")return false;
 const value=error as {status?:unknown;name?:unknown};
 return Number(value.status)>=500||value.status===0||["AuthRetryableFetchError","AbortError","TimeoutError","AuthUnknownError"].includes(String(value.name));
}
