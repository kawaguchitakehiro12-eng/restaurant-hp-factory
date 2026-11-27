import { assertPreviewRequest, previewBoundaryRequired } from "./preview-boundary";

/** Shared browser/server code: never log keys or decode them as proof of authenticity. */
export function apiKeyKind(key: string, role: "anon" | "service_role"): "legacy" | "opaque" {
  const fail = (): never => { throw new Error("Invalid Supabase API key configuration"); };
  if (!key || key.length > 8192) return fail();
  const prefix = role === "anon" ? "sb_publishable_" : "sb_secret_";
  if (key.startsWith(prefix) && /^sb_(?:publishable|secret)_[A-Za-z0-9_-]+$/.test(key)) return "opaque";
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return fail();
  try {
    // Legacy claims only: signatures are validated by Supabase, not by this classifier.
    const payload = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload));
    if (claims.role === role && claims.iss === "supabase") return "legacy";
  } catch { /* Fixed error only, never include provider input. */ }
  return fail();
}

/** Runs after SDK header injection, so its fallback Bearer cannot leak opaque API keys. */
export function apiKeyFetch(key: string, role: "anon" | "service_role", transport: typeof fetch): typeof fetch {
  const kind = apiKeyKind(key, role);
  return (input, init = {}) => {
    assertPreviewRequest(input);
    if (previewBoundaryRequired()) init = { ...init, redirect: "error" };
    if (kind === "legacy") return transport(input, init);
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    headers.set("apikey", key);
    if (role === "service_role" || headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    // Public clients preserve real user JWTs. Admin clients never inherit a user session.
    return transport(input, { ...init, headers });
  };
}
