"use client";

import { useEffect, useState } from "react";
import { PublicStoreView } from "@/components/public/PublicStoreView";
import { ShareDemoBanner } from "@/components/share/ShareDemoBanner";
import {
  ShareExpiredPage,
  ShareLoadErrorPage,
  ShareNotFoundPage,
} from "@/components/share/ShareStatusPages";
import type { PublicStoreResolution } from "@/lib/stores/demo-to-store";
import "@/app/bar/bar.css";
import "@/app/cafe/cafe.css";
import "@/app/izakaya/izakaya.css";

const FETCH_TIMEOUT_MS = 15_000;

type ShareApiResponse =
  | { status: "expired" }
  | { status: "not_found" }
  | {
      status: "found";
      prospectLabel: string;
      resolution: Extract<PublicStoreResolution, { status: "found" }>;
    };

type SharePublicPageProps = {
  shareToken: string;
};

/**
 * 共有ページは PublicStorePage と同様、クライアント取得後にテンプレートを描画する。
 * fetch は必ず相対 URL（同一オリジン）のみ使用する。
 */
export function SharePublicPage({ shareToken }: SharePublicPageProps) {
  const [state, setState] = useState<
    ShareApiResponse | "loading" | { status: "error"; message: string }
  >("loading");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const apiPath = `/api/public/share/${encodeURIComponent(shareToken)}`;

    async function load() {
      try {
        const res = await fetch(apiPath, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.status === 404) {
          if (!cancelled) setState({ status: "not_found" });
          return;
        }

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          const message = `API エラー (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`;
          console.error("[SharePublicPage] fetch failed", { apiPath, status: res.status, detail });
          if (!cancelled) setState({ status: "error", message });
          return;
        }

        const data = (await res.json()) as ShareApiResponse;
        if (data.status === "found" && !data.resolution) {
          const message = "API レスポンスに resolution が含まれていません";
          console.error("[SharePublicPage] invalid API response", { apiPath, data });
          if (!cancelled) setState({ status: "error", message });
          return;
        }
        if (!cancelled) setState(data);
      } catch (error) {
        const isAbort = error instanceof DOMException && error.name === "AbortError";
        const message = isAbort
          ? `${FETCH_TIMEOUT_MS / 1000}秒以内に応答がありませんでした`
          : error instanceof Error
            ? error.message
            : "ネットワークエラーが発生しました";
        console.error("[SharePublicPage] fetch error", { apiPath, error });
        if (!cancelled) setState({ status: "error", message });
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void load();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [shareToken]);

  if (state === "loading") {
    return (
      <div className="share-status-page">
        <div className="share-status-card">
          <p>読み込み中…</p>
        </div>
      </div>
    );
  }

  if (typeof state === "object" && state.status === "error") {
    return <ShareLoadErrorPage message={state.message} />;
  }

  if (state.status === "not_found") {
    return <ShareNotFoundPage />;
  }

  if (state.status === "expired") {
    return <ShareExpiredPage />;
  }

  return (
    <div className="share-page-root">
      <PublicStoreView
        resolution={state.resolution}
        canonicalPath={`/share/${shareToken}`}
        topBanner={<ShareDemoBanner prospectLabel={state.prospectLabel} />}
      />
    </div>
  );
}
