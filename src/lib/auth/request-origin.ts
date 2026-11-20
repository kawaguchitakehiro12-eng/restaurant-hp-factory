/** Compare browser Origin with the incoming Host, not Next.js' internal hostname. */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const internal = new URL(request.url);
    const host = request.headers.get("host");
    let protocol=internal.protocol;
    // A trusted deployment URL handles TLS termination without trusting forwarded headers.
    try{const configured=new URL(process.env.NEXT_PUBLIC_APP_URL??"");if(host===configured.host&&["http:","https:"].includes(configured.protocol))protocol=configured.protocol;}catch{/* Local development may have no deployment URL. */}
    const expected = host ? new URL(`${protocol}//${host}`) : new URL(internal.origin);
    if (expected.username || expected.password || expected.pathname !== "/" || expected.search || expected.hash) return false;
    // Do not trust client-supplied X-Forwarded-Host. Browser JS cannot set Host.
    return origin === expected.origin;
  } catch {
    return false;
  }
}
