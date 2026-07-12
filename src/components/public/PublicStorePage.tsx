"use client";

import { useEffect, useState } from "react";
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
import {
  fetchPublicSiteResolution,
  isSupabaseConfigured,
} from "@/lib/data/site-data-client";
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
import "@/app/bar/bar.css";
import "@/app/cafe/cafe.css";
import "@/app/izakaya/izakaya.css";

type PublicStorePageProps = {
  slug: string;
};

function resolveSlugLocally(slug: string): PublicStoreResolution {
  if (isReservedSlug(slug)) {
    return { status: "not_found" };
  }
  const demoSites = loadDemoSitesFromStorage();
  return resolvePublicStoreBySlug(slug, demoSites);
}

export function PublicStorePage({ slug }: PublicStorePageProps) {
  const [resolution, setResolution] = useState<PublicStoreResolution | null>(null);
  const useRemote = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (useRemote) {
        try {
          const { resolution: remoteResolution } = await fetchPublicSiteResolution(slug);
          if (!cancelled) setResolution(remoteResolution);
          return;
        } catch (error) {
          console.error("[PublicStorePage] Supabase fetch failed, using localStorage", error);
        }
      }
      if (!cancelled) setResolution(resolveSlugLocally(slug));
    }

    void load();

    if (!useRemote) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === "sakupage:demo-sites") {
          setResolution(resolveSlugLocally(slug));
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        cancelled = true;
        window.removeEventListener("storage", onStorage);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [slug, useRemote]);

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
      <>
        <StoreSeoHead store={store} isDemo canonicalPath={`/${slug}`} />
        <CafePage data={toCafeDataWithSamples(store, sampleFlags, heroDisplay)} />
      </>
    );
  }

  if (store.templateType === "bar") {
    return (
      <>
        <StoreSeoHead store={store} isDemo canonicalPath={`/${slug}`} />
        <BarPage data={toBarDataWithSamples(store, sampleFlags, heroDisplay)} />
      </>
    );
  }

  if (store.templateType === "izakaya-casual") {
    return (
      <>
        <StoreSeoHead store={store} isDemo canonicalPath={`/${slug}`} />
        <IzakayaCasualPage
          data={toIzakayaCasualDataWithSamples(store, sampleFlags, heroDisplay)}
        />
      </>
    );
  }

  return (
    <>
      <StoreSeoHead store={store} isDemo canonicalPath={`/${slug}`} />
      <LuxuryIzakayaPage
        data={toLuxuryIzakayaDataWithSamples(store, sampleFlags, heroDisplay)}
      />
    </>
  );
}

export function canPreviewDemoSlug(slug: string): boolean {
  if (isReservedSlug(slug)) return false;
  const demo = findDemoSiteBySlug(slug, loadDemoSitesFromStorage());
  return demo ? isDemoSitePubliclyVisible(demo) : false;
}
