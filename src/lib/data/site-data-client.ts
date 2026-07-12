import type { CustomerAccount } from "@/types/admin";
import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  isPublicStoreResolution,
  type PublicStoreResolution,
} from "@/lib/stores/demo-to-store";

export { isSupabaseConfigured };

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function fetchDemoSitesFromApi(): Promise<DemoSite[]> {
  return parseJson(await fetch("/api/demo-sites", { cache: "no-store" }));
}

export async function fetchDemoSiteBySlugFromApi(slug: string): Promise<DemoSite | null> {
  const response = await fetch(`/api/demo-sites/by-slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  return parseJson(response);
}

export async function createDemoSiteViaApi(site: DemoSite): Promise<DemoSite> {
  return parseJson(
    await fetch("/api/demo-sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    })
  );
}

export async function updateDemoSiteViaApi(site: DemoSite): Promise<DemoSite> {
  return parseJson(
    await fetch(`/api/demo-sites/${encodeURIComponent(site.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    })
  );
}

export async function deleteDemoSiteViaApi(id: string): Promise<void> {
  await parseJson(
    await fetch(`/api/demo-sites/${encodeURIComponent(id)}`, { method: "DELETE" })
  );
}

export async function updateDemoSiteContentViaApi(
  slug: string,
  patch: Partial<DemoSiteContent>
): Promise<DemoSite> {
  return parseJson(
    await fetch(`/api/demo-sites/by-slug/${encodeURIComponent(slug)}/content`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function fetchCustomersFromApi(): Promise<CustomerAccount[]> {
  return parseJson(await fetch("/api/customers", { cache: "no-store" }));
}

export async function upsertCustomerViaApi(
  customer: CustomerAccount,
  initialPassword?: string
): Promise<CustomerAccount> {
  if (initialPassword) {
    return parseJson(
      await fetch(`/api/customers/${encodeURIComponent(customer.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, initialPassword }),
      })
    );
  }

  return parseJson(
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    })
  );
}

export async function deleteCustomerViaApi(id: string): Promise<void> {
  await parseJson(
    await fetch(`/api/customers/${encodeURIComponent(id)}`, { method: "DELETE" })
  );
}

export type PublicSiteApiResponse = {
  resolution: PublicStoreResolution;
  visible: boolean;
};

/** API レスポンスを { resolution, visible } 形式に正規化する */
export function normalizePublicSiteApiResponse(body: unknown): PublicSiteApiResponse {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid public site API response");
  }

  const record = body as Record<string, unknown>;

  if (isPublicStoreResolution(record.resolution)) {
    return {
      resolution: record.resolution,
      visible: record.visible === true,
    };
  }

  // 旧形式: { status: "not_found" } がトップレベルに来るケース
  if (isPublicStoreResolution(record)) {
    return {
      resolution: record,
      visible: record.status === "found",
    };
  }

  throw new Error("Public site API response missing resolution");
}

export async function fetchPublicSiteResolution(
  slug: string
): Promise<PublicSiteApiResponse> {
  const response = await fetch(`/api/public/sites/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const body = await parseJson<unknown>(response);
  return normalizePublicSiteApiResponse(body);
}
