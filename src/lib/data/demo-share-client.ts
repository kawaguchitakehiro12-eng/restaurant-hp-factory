import type { DemoShare, DemoShareSummary, ShareExpiryOption } from "@/types/demo-share";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { throwIfAuthError } from "@/lib/data/api-errors";

export async function fetchDemoShare(demoSiteId: string): Promise<DemoShare | null> {
  const res = await fetch(
    `/api/admin/demo-shares?demoSiteId=${encodeURIComponent(demoSiteId)}`,
    { cache: "no-store" }
  );
  throwIfAuthError(res);
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
  throwIfAuthError(res);
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
  throwIfAuthError(res);
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
  throwIfAuthError(res);
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
  throwIfAuthError(res);
  if (!res.ok) throw new Error("Failed to extend share");
  const data = (await res.json()) as { share: DemoShare };
  return data.share;
}

export async function fetchDemoShareSummaries(
  demoSiteIds: string[]
): Promise<Record<string, DemoShareSummary>> {
  if (!isSupabaseConfigured() || demoSiteIds.length === 0) return {};
  const ids=[...new Set(demoSiteIds)],result:Record<string,DemoShareSummary>={};
  for(let start=0;start<ids.length;start+=100){
    const res=await fetch(`/api/admin/demo-shares/summary?demoSiteIds=${encodeURIComponent(ids.slice(start,start+100).join(","))}`,{cache:"no-store",signal:AbortSignal.timeout(20000)});
    throwIfAuthError(res);
    if(!res.ok)throw new Error("共有状態を取得できませんでした。");
    const data=await res.json() as {summaries:Record<string,DemoShareSummary>};Object.assign(result,data.summaries??{});
  }
  return result;
}

export { isSupabaseConfigured };
