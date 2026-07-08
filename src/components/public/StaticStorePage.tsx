"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { BarPage } from "@/components/templates/bar/BarPage";
import { CafePage } from "@/components/templates/cafe/CafePage";
import { IzakayaCasualPage } from "@/components/templates/izakaya-casual/IzakayaCasualPage";
import { LuxuryIzakayaPage } from "@/components/templates/luxury-izakaya/LuxuryIzakayaPage";
import { mergeStoreWithPhotoContent } from "@/lib/admin/demo-photo-library";
import {
  toBarData,
  toCafeData,
  toIzakayaCasualData,
  toLuxuryIzakayaData,
} from "@/lib/stores/adapters";
import { isPublished } from "@/lib/stores/helpers";
import { getStoreBySlug } from "@/data/stores";
import {
  getHeroDisplayFromPhotos,
  loadStorePhotoOverride,
  STORE_PHOTO_OVERRIDES_KEY,
} from "@/lib/stores/store-photo-overrides";
import "@/app/cafe/cafe.css";
import "@/app/bar/bar.css";
import "@/app/izakaya/izakaya.css";

type StaticStorePageProps = {
  slug: string;
};

export function StaticStorePage({ slug }: StaticStorePageProps) {
  const baseStore = getStoreBySlug(slug);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [luxuryData, setLuxuryData] = useState<ReturnType<typeof toLuxuryIzakayaData> | null>(
    null
  );
  const [cafeData, setCafeData] = useState<ReturnType<typeof toCafeData> | null>(null);
  const [barData, setBarData] = useState<ReturnType<typeof toBarData> | null>(null);
  const [izakayaData, setIzakayaData] = useState<ReturnType<typeof toIzakayaCasualData> | null>(
    null
  );

  useEffect(() => {
    const load = () => {
      if (!baseStore || !isPublished(baseStore)) {
        setMissing(true);
        setReady(true);
        return;
      }

      const override = loadStorePhotoOverride(slug);
      const store = override
        ? mergeStoreWithPhotoContent(baseStore, override.photos, baseStore.name)
        : baseStore;
      const heroDisplay = override
        ? getHeroDisplayFromPhotos(override.photos)
        : undefined;

      setCafeData(null);
      setBarData(null);
      setLuxuryData(null);
      setIzakayaData(null);

      if (store.templateType === "cafe") {
        setCafeData(toCafeData(store, heroDisplay));
      } else if (store.templateType === "bar") {
        setBarData(toBarData(store, heroDisplay));
      } else if (store.templateType === "izakaya-casual") {
        setIzakayaData(toIzakayaCasualData(store, heroDisplay));
      } else {
        setLuxuryData(toLuxuryIzakayaData(store, heroDisplay));
      }
      setMissing(false);
      setReady(true);
    };

    load();
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORE_PHOTO_OVERRIDES_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [baseStore, slug]);

  if (!ready) {
    return (
      <div className="public-store-status">
        <p>読み込み中…</p>
      </div>
    );
  }

  if (missing) {
    notFound();
  }

  if (cafeData) return <CafePage data={cafeData} />;
  if (barData) return <BarPage data={barData} />;
  if (izakayaData) return <IzakayaCasualPage data={izakayaData} />;
  if (luxuryData) return <LuxuryIzakayaPage data={luxuryData} />;

  notFound();
}
