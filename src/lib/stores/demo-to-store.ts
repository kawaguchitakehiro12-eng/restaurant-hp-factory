import type { DemoSite } from "@/types/demo";
import { isPublicSiteVisible } from "@/lib/stores/site-visibility";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";

/** 公開ページへそのまま返すため、営業メモ・連絡先・初期パスワード等を含む DemoSite は載せない */
export type PublicStoreResolution =
  | { status: "not_found" }
  | { status: "unpublished" }
  | {
      status: "found";
      store: ReturnType<typeof resolveDemoStore>["store"];
      sampleFlags: ReturnType<typeof resolveDemoStore>["sampleFlags"];
      heroFit: ReturnType<typeof resolveDemoStore>["heroFit"];
      heroObjectPosition: ReturnType<typeof resolveDemoStore>["heroObjectPosition"];
    };

export function resolvePublicStoreBySlug(
  slug: string,
  demoSites: DemoSite[]
): PublicStoreResolution {
  const demo = demoSites.find((d) => d.storeSlug.toLowerCase() === slug.toLowerCase());
  if (!demo) {
    return { status: "not_found" };
  }
  if (!isDemoSitePubliclyVisible(demo)) {
    return { status: "unpublished" };
  }
  const { store, sampleFlags, heroFit, heroObjectPosition } = resolveDemoStore(demo);
  return {
    status: "found",
    store,
    sampleFlags,
    heroFit,
    heroObjectPosition,
  };
}

export function isDemoSitePubliclyVisible(demo: DemoSite): boolean {
  return isPublicSiteVisible(demo);
}

export function isPublicStoreResolution(value: unknown): value is PublicStoreResolution {
  if (!value || typeof value !== "object") return false;
  const status = (value as { status?: unknown }).status;
  return status === "not_found" || status === "unpublished" || status === "found";
}
