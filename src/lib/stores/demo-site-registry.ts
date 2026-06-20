import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import { ensureDemoContent } from "@/types/demo-content";
import { initialDemoSites } from "@/data/admin/demo-mock";
import { todayIso } from "@/lib/admin/form-utils";

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
  window.dispatchEvent(
    new StorageEvent("storage", { key: DEMO_SITES_STORAGE_KEY })
  );
}

export function findDemoSiteBySlug(slug: string, sites: DemoSite[]): DemoSite | undefined {
  return sites.find((d) => d.storeSlug.toLowerCase() === slug.toLowerCase());
}

export function updateDemoSiteContent(
  slug: string,
  contentPatch: Partial<DemoSiteContent>,
  fallback: DemoSite[] = initialDemoSites
): DemoSite | null {
  const sites = loadDemoSitesFromStorage(fallback);
  const index = sites.findIndex((d) => d.storeSlug.toLowerCase() === slug.toLowerCase());
  if (index < 0) return null;

  const current = sites[index];
  const updated: DemoSite = {
    ...current,
    content: {
      ...ensureDemoContent(current.content),
      ...contentPatch,
      basicInfo: contentPatch.basicInfo
        ? { ...ensureDemoContent(current.content).basicInfo, ...contentPatch.basicInfo }
        : ensureDemoContent(current.content).basicInfo,
      photos: contentPatch.photos
        ? { ...ensureDemoContent(current.content).photos, ...contentPatch.photos }
        : ensureDemoContent(current.content).photos,
      importedPhotos:
        contentPatch.importedPhotos ??
        ensureDemoContent(current.content).importedPhotos,
    },
    lastUpdatedAt: todayIso(),
  };

  const next = [...sites];
  next[index] = updated;
  saveDemoSitesToStorage(next);
  return updated;
}
