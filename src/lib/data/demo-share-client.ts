import type { DemoShare, DemoShareSummary, ShareExpiryOption } from "@/types/demo-share";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function fetchDemoShare(demoSiteId: string): Promise<DemoShare | null> {
  const res = await fetch(
    `/api/admin/demo-shares?demoSiteId=${encodeURIComponent(demoSiteId)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load share");
  const data = (await res.json()) as { share: DemoShare | null };
  return data.share;
}

export async function createDemoShare(
  demoSiteId: string,
  expiryOption: ShareExpiryOption
): Promise<DemoShare> {
  const res = await fetch("/api/admin/demo-shares", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demoSiteId, expiryOption }),
  });
  if (!res.ok) throw new Error("Failed to create share");
  const data = (await res.json()) as { share: DemoShare };
  return data.share;
}

export async function revokeDemoShare(shareId: string): Promise<void> {
  const res = await fetch(`/api/admin/demo-shares/${encodeURIComponent(shareId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "revoke" }),
  });
  if (!res.ok) throw new Error("Failed to revoke share");
}

export async function regenerateDemoShare(
  shareId: string,
  demoSiteId: string,
  expiryOption: ShareExpiryOption
): Promise<DemoShare> {
  const res = await fetch(`/api/admin/demo-shares/${encodeURIComponent(shareId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate", demoSiteId, expiryOption }),
  });
  if (!res.ok) throw new Error("Failed to regenerate share");
  const data = (await res.json()) as { share: DemoShare };
  return data.share;
}

export async function extendDemoShare(
  shareId: string,
  expiryOption: ShareExpiryOption
): Promise<DemoShare> {
  const res = await fetch(`/api/admin/demo-shares/${encodeURIComponent(shareId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "extend", expiryOption }),
  });
  if (!res.ok) throw new Error("Failed to extend share");
  const data = (await res.json()) as { share: DemoShare };
  return data.share;
}

export async function fetchDemoShareSummaries(
  demoSiteIds: string[]
): Promise<Record<string, DemoShareSummary>> {
  if (!isSupabaseConfigured() || demoSiteIds.length === 0) return {};
  const res = await fetch(
    `/api/admin/demo-shares/summary?demoSiteIds=${encodeURIComponent(demoSiteIds.join(","))}`,
    { cache: "no-store" }
  );
  if (!res.ok) return {};
  const data = (await res.json()) as { summaries: Record<string, DemoShareSummary> };
  return data.summaries ?? {};
}

export { isSupabaseConfigured };
