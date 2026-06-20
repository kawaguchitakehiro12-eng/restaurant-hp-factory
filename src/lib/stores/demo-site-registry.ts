import type { DemoSite } from "@/types/demo";
import { initialDemoSites } from "@/data/admin/demo-mock";

export const DEMO_SITES_STORAGE_KEY = "sakupage:demo-sites";

/** App Router と競合する slug */
export const RESERVED_SLUGS = new Set([
  "admin",
  "dashboard",
  "cafe",
  "api",
  "_next",
  "favicon.ico",
  "branding",
  "brand",
  "screenshots",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function loadDemoSitesFromStorage(fallback: DemoSite[] = initialDemoSites): DemoSite[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(DEMO_SITES_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as DemoSite[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveDemoSitesToStorage(sites: DemoSite[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_SITES_STORAGE_KEY, JSON.stringify(sites));
}

export function findDemoSiteBySlug(slug: string, sites: DemoSite[]): DemoSite | undefined {
  return sites.find((d) => d.storeSlug.toLowerCase() === slug.toLowerCase());
}
