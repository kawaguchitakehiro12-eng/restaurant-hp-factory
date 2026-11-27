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
  fetchDemoSiteBySlugFromApi,
  isSupabaseConfigured,
  updateDemoSiteContentViaApi,
} from "@/lib/data/site-data-client";
import {
  DEMO_SITES_STORAGE_KEY,
  findDemoSiteBySlug,
  loadDemoSitesFromStorage,
} from "@/lib/stores/demo-site-registry";
import { initialDemoSites } from "@/data/admin/demo-mock";
import { isApiAuthError } from "@/lib/data/api-errors";

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
  const [authRequired, setAuthRequired] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const useRemote = isSupabaseConfigured();

  const refresh = useCallback(async function refresh() {
    setLoadError(false);
    if (useRemote) {
      try {
        const demo = await fetchDemoSiteBySlugFromApi(slug);
        setAuthRequired(false);
        if (!demo) {
          setCtx(null);
          return;
        }
        setCtx({...buildDemoCustomerContext(demo, slug, makeSavePhotos(slug, useRemote, refresh,demo.contentRevision??null)),saveContent:async(patch,revision)=>{const fresh=await updateDemoSiteContentViaApi(slug,patch,revision);await refresh();return fresh;}});
        return;
      } catch (error) {
        if (isApiAuthError(error)) {
          setAuthRequired(true);
          setCtx(null);
          return;
        }
        setCtx(null);
        setLoadError(true);
        return;
      }
    }
    const sites = loadDemoSitesFromStorage(initialDemoSites);
    const demo = findDemoSiteBySlug(slug, sites);
    if (!demo) {
      setCtx(null);
      return;
    }
    setCtx(buildDemoCustomerContext(demo, slug, makeSavePhotos(slug, useRemote, refresh,demo.contentRevision??null)));
  }, [slug, useRemote]);

  useEffect(() => {
    void refresh().finally(() => setReady(true));

    if (!useRemote) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === DEMO_SITES_STORAGE_KEY) {
          void refresh();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, [refresh, useRemote]);

  const value = useMemo(() => ctx, [ctx]);

  if (!ready) {
    return (
      <div className="admin-edit-empty">
        <p>読み込み中…</p>
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="admin-edit-empty">
        <p>この画面を表示するには運営者ログインが必要です。</p>
        <Link href="/login" className="admin-btn admin-btn--secondary">
          ログイン画面へ
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-edit-empty" role="alert">
        <p>店舗情報を取得できませんでした。通信状況を確認してください。</p>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => void refresh()}>
          再読み込み
        </button>
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

function makeSavePhotos(
  slug: string,
  useRemote: boolean,
  refresh: () => Promise<void>,
  revision:string|null
): DemoCustomerContext["savePhotos"] {
  return async (payload) => {
    if (useRemote) {
      // SaveBarが完了・失敗を判定できるようPromiseを返す。
      await updateDemoSiteContentViaApi(slug, payload,revision);
    } else {
      throw new Error("サーバー保存先が未設定です。入力内容は保持されています。");
    }
    await refresh();
  };
}

export function useDemoCustomer(): DemoCustomerContext {
  const ctx = useContext(DemoCustomerContextReact);
  if (!ctx) {
    throw new Error("useDemoCustomer must be used within DemoCustomerProvider");
  }
  return ctx;
}
