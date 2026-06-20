import type { DemoSite } from "@/types/demo";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";

export type PublicStoreResolution =
  | { status: "not_found" }
  | { status: "unpublished" }
  | {
      status: "found";
      store: ReturnType<typeof resolveDemoStore>["store"];
      sampleFlags: ReturnType<typeof resolveDemoStore>["sampleFlags"];
      demoSite: DemoSite;
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
  const { store, sampleFlags } = resolveDemoStore(demo);
  return { status: "found", store, sampleFlags, demoSite: demo };
}

export function isDemoSitePubliclyVisible(demo: DemoSite): boolean {
  if (demo.siteContractStatus === "lost" || demo.siteContractStatus === "suspended") {
    return false;
  }
  if (demo.publishStatus === "suspended") {
    return false;
  }
  return demo.siteContractStatus === "demo" || demo.siteContractStatus === "contracted";
}
