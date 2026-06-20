"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { buildDemoCustomerContext, type DemoCustomerContext } from "@/lib/admin/demo-dashboard";
import {
  DEMO_SITES_STORAGE_KEY,
  findDemoSiteBySlug,
  loadDemoSitesFromStorage,
  updateDemoSiteContent,
} from "@/lib/stores/demo-site-registry";
import { initialDemoSites } from "@/data/admin/demo-mock";

const DemoCustomerContextReact = createContext<DemoCustomerContext | null>(null);

export function DemoCustomerProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [ctx, setCtx] = useState<DemoCustomerContext | null>(null);
  const [ready, setReady] = useState(false);

  const savePhotos = useCallback<DemoCustomerContext["savePhotos"]>(
    (payload) => {
      updateDemoSiteContent(slug, payload, initialDemoSites);
    },
    [slug]
  );

  const refresh = useCallback(() => {
    const sites = loadDemoSitesFromStorage(initialDemoSites);
    const demo = findDemoSiteBySlug(slug, sites);
    if (!demo) {
      setCtx(null);
      return;
    }
    setCtx(buildDemoCustomerContext(demo, slug, savePhotos));
  }, [slug, savePhotos]);

  useEffect(() => {
    refresh();
    setReady(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === DEMO_SITES_STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const value = useMemo(() => ctx, [ctx]);

  if (!ready) {
    return (
      <div className="admin-edit-empty">
        <p>読み込み中…</p>
      </div>
    );
  }

  if (!value) {
    return (
      <div className="admin-edit-empty">
        <p>デモ案件が見つかりません。</p>
        <Link href="/admin/stores" className="admin-btn admin-btn--secondary">
          管理画面に戻る
        </Link>
      </div>
    );
  }

  return (
    <DemoCustomerContextReact.Provider value={value}>
      {children}
    </DemoCustomerContextReact.Provider>
  );
}

export function useDemoCustomer(): DemoCustomerContext {
  const ctx = useContext(DemoCustomerContextReact);
  if (!ctx) {
    throw new Error("useDemoCustomer must be used within DemoCustomerProvider");
  }
  return ctx;
}
