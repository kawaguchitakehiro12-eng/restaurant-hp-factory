import type { ReactNode } from "react";
import type { PublicStoreResolution } from "@/lib/stores/demo-to-store";
import { StoreSeoHead } from "@/components/public/StoreSeoHead";
import { BarPage } from "@/components/templates/bar/BarPage";
import { CafePage } from "@/components/templates/cafe/CafePage";
import { IzakayaCasualPage } from "@/components/templates/izakaya-casual/IzakayaCasualPage";
import { LuxuryIzakayaPage } from "@/components/templates/luxury-izakaya/LuxuryIzakayaPage";
import {
  toBarDataWithSamples,
  toCafeDataWithSamples,
  toIzakayaCasualDataWithSamples,
  toLuxuryIzakayaDataWithSamples,
} from "@/lib/stores/demo-adapters";

type PublicStoreViewProps = {
  resolution: Extract<PublicStoreResolution, { status: "found" }>;
  canonicalPath: string;
  topBanner?: ReactNode;
};

export function PublicStoreView({
  resolution,
  canonicalPath,
  topBanner,
}: PublicStoreViewProps) {
  const { store, sampleFlags, heroFit, heroObjectPosition } = resolution;
  const heroDisplay = { heroFit, heroObjectPosition };

  const content = (() => {
    if (store.templateType === "cafe") {
      return (
        <CafePage data={toCafeDataWithSamples(store, sampleFlags, heroDisplay)} />
      );
    }
    if (store.templateType === "bar") {
      return (
        <BarPage data={toBarDataWithSamples(store, sampleFlags, heroDisplay)} />
      );
    }
    if (store.templateType === "izakaya-casual") {
      return (
        <IzakayaCasualPage
          data={toIzakayaCasualDataWithSamples(store, sampleFlags, heroDisplay)}
        />
      );
    }
    return (
      <LuxuryIzakayaPage
        data={toLuxuryIzakayaDataWithSamples(store, sampleFlags, heroDisplay)}
      />
    );
  })();

  return (
    <>
      <StoreSeoHead store={store} isDemo canonicalPath={canonicalPath} />
      {topBanner}
      {content}
    </>
  );
}
