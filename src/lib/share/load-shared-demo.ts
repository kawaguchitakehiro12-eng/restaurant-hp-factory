import { getDemoSiteRepository } from "@/lib/repositories";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";
import { isDemoShareValid } from "@/lib/admin/demo-share-utils";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";
import type { DemoSite } from "@/types/demo";
import type { DemoShare } from "@/types/demo-share";

export type SharedDemoPageData =
  | { status: "not_found" }
  | { status: "expired" }
  | {
      status: "found";
      demoSite: DemoSite;
      share: DemoShare;
      prospectLabel: string;
      store: ReturnType<typeof resolveDemoStore>["store"];
      sampleFlags: ReturnType<typeof resolveDemoStore>["sampleFlags"];
      heroFit: ReturnType<typeof resolveDemoStore>["heroFit"];
      heroObjectPosition: ReturnType<typeof resolveDemoStore>["heroObjectPosition"];
    };

function buildProspectLabel(demo: DemoSite): string {
  const person = demo.contactPersonName?.trim();
  if (person) return person;
  const prospect = demo.prospectName.trim();
  if (prospect && prospect !== "—") return prospect;
  return demo.storeName;
}

/** Server-only: resolve share token without recording a view (metadata). */
export async function peekSharedDemoPage(token: string): Promise<SharedDemoPageData> {
  const shareRepo = getDemoShareRepository();
  const share = await shareRepo.findByToken(token);

  if (!share) {
    return { status: "not_found" };
  }

  if (!isDemoShareValid(share)) {
    return { status: "expired" };
  }

  const demoSite = await getDemoSiteRepository().findById(share.demoSiteId);
  if (!demoSite || demoSite.siteContractStatus === "lost") {
    return { status: "not_found" };
  }

  const { store, sampleFlags, heroFit, heroObjectPosition } = resolveDemoStore(demoSite);

  return {
    status: "found",
    demoSite,
    share,
    prospectLabel: buildProspectLabel(demoSite),
    store,
    sampleFlags,
    heroFit,
    heroObjectPosition,
  };
}

/** Server-only: resolve share token → demo site and record view. */
export async function loadSharedDemoPage(token: string): Promise<SharedDemoPageData> {
  const result = await peekSharedDemoPage(token);
  if (result.status === "found") {
    await getDemoShareRepository().recordView(result.share.id);
  }
  return result;
}
