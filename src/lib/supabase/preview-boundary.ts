import target from "./preview-target.json";

/** Public constants only. Applies to Preview clients as well as server/Proxy fetches. */
export function previewBoundaryRequired(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_SAKUPAGE_PREVIEW_ONLY !== undefined;
}

export function assertPreviewBaseUrl(raw: string | undefined): void {
  if (!previewBoundaryRequired()) return;
  try {
    if (process.env.NEXT_PUBLIC_SAKUPAGE_PREVIEW_ONLY !== "true") throw new Error();
    const url = new URL(raw ?? "");
    if (url.origin !== target.origin || url.pathname !== "/" || url.search || url.hash || url.username || url.password) throw new Error();
  } catch {
    throw new Error("Preview Supabase destination rejected");
  }
}

export function assertPreviewRequest(input: RequestInfo | URL): void {
  if (!previewBoundaryRequired()) return;
  assertPreviewBaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  try {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.origin !== target.origin || url.username || url.password) throw new Error();
  } catch {
    throw new Error("Preview Supabase request rejected");
  }
}
