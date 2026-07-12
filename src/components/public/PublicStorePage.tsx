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
  isPublicStoreResolution,
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

function applyResolution(
  slug: string,
  value: unknown,
  source: "remote" | "local"
): PublicStoreResolution {
  if (isPublicStoreResolution(value)) {
    return value;
  }
  console.warn(`[PublicStorePage] invalid ${source} resolution, using localStorage`, {
    slug,
    value,
  });
  return resolveSlugLocally(slug);
}

export function PublicStorePage({ slug }: PublicStorePageProps) {
  const [mounted, setMounted] = useState(false);
  const [resolution, setResolution] = useState<PublicStoreResolution | null>(null);
  const useRemote = isSupabaseConfigured();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function load() {
      if (useRemote) {
        try {
          const { resolution: remoteResolution } = await fetchPublicSiteResolution(slug);
          let next = applyResolution(slug, remoteResolution, "remote");
          if (next.status === "not_found") {
            const local = resolveSlugLocally(slug);
            if (local.status === "found") {
              next = local;
            }
          }
          if (!cancelled) {
            setResolution(next);
          }
          return;
        } catch (error) {
          console.error("[PublicStorePage] Supabase fetch failed, using localStorage", error);
        }
      }
      if (!cancelled) {
        setResolution(applyResolution(slug, resolveSlugLocally(slug), "local"));
      }
    }

    void load();

    if (!useRemote) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === "sakupage:demo-sites") {
          setResolution(applyResolution(slug, resolveSlugLocally(slug), "local"));
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
  }, [slug, useRemote, mounted]);

  if (!mounted || resolution == null || !isPublicStoreResolution(resolution)) {
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
