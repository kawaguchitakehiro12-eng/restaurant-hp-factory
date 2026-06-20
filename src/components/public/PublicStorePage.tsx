"use client";

import { Jost, Noto_Sans_JP, Playfair_Display } from "next/font/google";
import { useEffect, useState } from "react";
import { CafePage } from "@/components/templates/cafe/CafePage";
import { LuxuryIzakayaPage } from "@/components/templates/luxury-izakaya/LuxuryIzakayaPage";
import {
  toCafeDataWithSamples,
  toLuxuryIzakayaDataWithSamples,
} from "@/lib/stores/demo-adapters";
import {
  findDemoSiteBySlug,
  isReservedSlug,
  loadDemoSitesFromStorage,
} from "@/lib/stores/demo-site-registry";
import {
  isDemoSitePubliclyVisible,
  resolvePublicStoreBySlug,
  type PublicStoreResolution,
} from "@/lib/stores/demo-to-store";
import { StoreNotFound } from "@/components/public/StoreNotFound";
import { StoreUnpublished } from "@/components/public/StoreUnpublished";
import "@/app/cafe/cafe.css";

const notoSans = Noto_Sans_JP({
  variable: "--font-cafe-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-cafe-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-cafe-en",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

type PublicStorePageProps = {
  slug: string;
};

function resolveSlug(slug: string): PublicStoreResolution {
  if (isReservedSlug(slug)) {
    return { status: "not_found" };
  }
  const demoSites = loadDemoSitesFromStorage();
  return resolvePublicStoreBySlug(slug, demoSites);
}

export function PublicStorePage({ slug }: PublicStorePageProps) {
  const [resolution, setResolution] = useState<PublicStoreResolution | null>(null);

  useEffect(() => {
    const update = () => setResolution(resolveSlug(slug));
    update();

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === "sakupage:demo-sites") {
        update();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [slug]);

  if (resolution === null) {
    return (
      <div className="public-store-status">
        <p>読み込み中…</p>
      </div>
    );
  }

  if (resolution.status === "not_found") {
    return <StoreNotFound slug={slug} />;
  }

  if (resolution.status === "unpublished") {
    return <StoreUnpublished />;
  }

  const { store, sampleFlags, heroFit, heroObjectPosition } = resolution;
  const heroDisplay = { heroFit, heroObjectPosition };

  if (store.templateType === "cafe") {
    return (
      <div className={`${notoSans.variable} ${playfair.variable} ${jost.variable}`}>
        <CafePage data={toCafeDataWithSamples(store, sampleFlags, heroDisplay)} />
      </div>
    );
  }

  return (
    <LuxuryIzakayaPage
      data={toLuxuryIzakayaDataWithSamples(store, sampleFlags, heroDisplay)}
    />
  );
}

export function canPreviewDemoSlug(slug: string): boolean {
  if (isReservedSlug(slug)) return false;
  const demo = findDemoSiteBySlug(slug, loadDemoSitesFromStorage());
  return demo ? isDemoSitePubliclyVisible(demo) : false;
}
