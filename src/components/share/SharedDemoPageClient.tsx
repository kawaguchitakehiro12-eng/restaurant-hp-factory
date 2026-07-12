"use client";

import { ShareDemoBanner } from "@/components/share/ShareDemoBanner";
import { PublicStoreView } from "@/components/public/PublicStoreView";
import type { SharedDemoPageData } from "@/lib/share/load-shared-demo";
import "@/app/bar/bar.css";
import "@/app/cafe/cafe.css";
import "@/app/izakaya/izakaya.css";

type SharedDemoPageClientProps = {
  data: Extract<SharedDemoPageData, { status: "found" }>;
  shareToken: string;
};

export function SharedDemoPageClient({ data, shareToken }: SharedDemoPageClientProps) {
  const resolution = {
    status: "found" as const,
    store: data.store,
    sampleFlags: data.sampleFlags,
    heroFit: data.heroFit,
    heroObjectPosition: data.heroObjectPosition,
    demoSite: data.demoSite,
  };

  return (
    <PublicStoreView
      resolution={resolution}
      canonicalPath={`/share/${shareToken}`}
      topBanner={<ShareDemoBanner prospectLabel={data.prospectLabel} />}
    />
  );
}
