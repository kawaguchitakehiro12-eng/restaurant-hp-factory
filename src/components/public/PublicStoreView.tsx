import type { ReactNode } from "react";
import "@/app/bar/bar.css";
import "@/app/cafe/cafe.css";
import "@/app/izakaya/izakaya.css";
import "@/app/bal/bal.css";
import type { PublicStoreResolution } from "@/lib/stores/demo-to-store";
import { StoreSeoHead } from "@/components/public/StoreSeoHead";
import { BalPage } from "@/components/templates/bal/BalPage";
import { BarPage } from "@/components/templates/bar/BarPage";
import { CafePage } from "@/components/templates/cafe/CafePage";
import { IzakayaCasualPage } from "@/components/templates/izakaya-casual/IzakayaCasualPage";
import { LuxuryIzakayaPage } from "@/components/templates/luxury-izakaya/LuxuryIzakayaPage";
import {
  toBalDataWithSamples,
  toBarDataWithSamples,
  toCafeDataWithSamples,
  toIzakayaCasualDataWithSamples,
  toLuxuryIzakayaDataWithSamples,
} from "@/lib/stores/demo-adapters";

type PublicStoreViewProps = {
  resolution: Extract<PublicStoreResolution, { status: "found" }>;
  canonicalPath: string;
  topBanner?: ReactNode;
  isDemo?:boolean;
};

export function PublicStoreView({
  resolution,
  canonicalPath,
  topBanner,
  isDemo=true,
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
    if (store.templateType === "bal") {
      return <BalPage data={toBalDataWithSamples(store, sampleFlags, heroDisplay)} />;
    }
    return (
      <LuxuryIzakayaPage
        data={toLuxuryIzakayaDataWithSamples(store, sampleFlags, heroDisplay)}
      />
    );
  })();

  return (
    <>
      <StoreSeoHead store={store} isDemo={isDemo} canonicalPath={canonicalPath} />
      {topBanner}
      {content}
    </>
  );
}
