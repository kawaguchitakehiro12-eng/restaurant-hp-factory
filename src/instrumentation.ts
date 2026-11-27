/** Verification infrastructure only; not part of the production candidate. */
export async function register() {
 if(process.env.NEXT_RUNTIME==='nodejs'){
  const {install}=await import('../.verification/runtime-guard');install();
 }
}
