"use client";

import {matchesSearch} from "@/lib/admin/search";
import Link from "next/link";
import { ExternalLink, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { formatShareViewStatus } from "@/components/admin/operator/DemoShareModal";
import {
  SITE_DISPLAY_STATUS_LABELS,
  getSiteDisplayStatus,
  isDemoPhase,
  siteDisplayStatusVariant,
} from "@/lib/admin/site-display-status";
import {
  evaluatePublishQuality,
  PUBLISH_QUALITY_CONFIRM_THRESHOLD,
  PUBLISH_QUALITY_WARN_THRESHOLD,
} from "@/lib/admin/publish-quality-check";
import {
  salesStatusVariant,
  salesStatusLabels,
} from "@/lib/admin/demo-labels";
import { getTemplateLabel } from "@/lib/admin/contract-templates";
import { buildAdminUrl, buildDemoUrl, buildOperatorPreviewUrl } from "@/lib/admin/demo-create";
import {
  fetchDemoShareSummaries,
  isSupabaseConfigured,
} from "@/lib/data/demo-share-client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/labels";
import type { DemoSite } from "@/types/demo";
import type { DemoShareSummary } from "@/types/demo-share";

type DemoSiteTableProps = {
  demoSites: DemoSite[];
  onPublish: (demoSiteId: string) => void;
  onShare: (demoSiteId: string) => void;
  onMarkLost: (demoSiteId: string) => void;
  onDelete: (demoSiteId: string) => void;
  shareDataVersion?: number;
};

export function DemoSiteTable({
  demoSites,
  onPublish,
  onShare,
  onMarkLost,
  onDelete,
  shareDataVersion = 0,
}: DemoSiteTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<DemoSite | null>(null);
  const [qualityConfirmTarget, setQualityConfirmTarget] = useState<DemoSite | null>(null);
  const [shareSummaries, setShareSummaries] = useState<Record<string, DemoShareSummary>>({});
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [shareFilter,setShareFilter]=useState("all");
  const [page,setPage]=useState(1);
  const [shareError,setShareError]=useState("");
  const [summaryTime,setSummaryTime]=useState<string|null>(null);
  const [refresh,setRefresh]=useState(0);
  const useRemote = isSupabaseConfigured();

  useEffect(() => {
    if (!useRemote || demoSites.length === 0) {
      return;
    }
    let cancelled = false;
    void fetchDemoShareSummaries(demoSites.map((d) => d.id)).then((summaries) => {
      if (!cancelled) {setShareSummaries(summaries);setShareError("");setSummaryTime(new Date().toLocaleTimeString("ja-JP"));}
    }).catch(() => { if (!cancelled) setShareError("共有状態を更新できませんでした。表示は前回取得した情報です。"); });
    return () => {
      cancelled = true;
    };
  }, [demoSites, useRemote, shareDataVersion, refresh]);

  const filtered=useMemo(()=>demoSites.filter(site=>{
    if(!matchesSearch(query,[site.storeName,site.storeSlug,site.prospectName,site.address]))return false;
    if(statusFilter!=="all" && (statusFilter==="contracted"?site.siteContractStatus!=="contracted":getSiteDisplayStatus(site)!==statusFilter))return false;
    return shareFilter==="all" || shareSummaries[site.id]?.status===shareFilter;
  }),[demoSites,query,statusFilter,shareFilter,shareSummaries]);
  const pages=Math.max(1,Math.ceil(filtered.length/25)),currentPage=Math.min(page,pages);
  const visible=useMemo(()=>filtered.slice((currentPage-1)*25,currentPage*25),[filtered,currentPage]);

  const qualityBySiteId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof evaluatePublishQuality>>();
    for (const site of visible) {
      map.set(site.id, evaluatePublishQuality(site));
    }
    return map;
  }, [visible]);

  const handlePublishClick = (site: DemoSite) => {
    const report = qualityBySiteId.get(site.id);
    if (report && report.score < PUBLISH_QUALITY_CONFIRM_THRESHOLD) {
      setQualityConfirmTarget(site);
      return;
    }
    onPublish(site.id);
  };

  return (
    <>
      <div className="admin-list-filters">
        <label>店舗を検索<input className="admin-form-input" type="search" value={query} placeholder="店舗名・住所・URL名" onChange={e=>{setQuery(e.target.value);setPage(1)}} /></label>
        <label>店舗の状態<select className="admin-form-select" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}}>{[["all","すべて"],["demo","デモ"],["contracted","契約済み"],["published","公開中"],["suspended","公開停止中"],["lost","失注"]].map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
        <label>共有URL<select className="admin-form-select" value={shareFilter} onChange={e=>{setShareFilter(e.target.value);setPage(1)}}>{[["all","すべて"],["active","共有中"],["expired","期限切れ"],["revoked","停止済み"],["none","未発行"]].map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={()=>{setQuery("");setStatusFilter("all");setShareFilter("all");setPage(1)}}>条件をリセット</button>
      </div>
      <p className="admin-form-hint">共有状態の取得時刻：{summaryTime??"未取得"} <button type="button" className="admin-btn admin-btn--ghost" onClick={()=>setRefresh(x=>x+1)}>共有状態を再取得</button></p>
      {shareError?<p role="alert" className="admin-form-error">{shareError}<button type="button" className="admin-btn admin-btn--ghost" onClick={()=>setRefresh(x=>x+1)}>再取得</button></p>:null}
      <p role="status" className="admin-form-hint">{filtered.length}件 / 全{demoSites.length}件（{currentPage}/{pages}ページ）</p>
      {filtered.length===0?<p className="admin-card">条件に合う店舗がありません。検索語を短くするか、絞り込みを解除してください。</p>:null}
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--relaxed admin-table--demo">
          <thead>
            <tr>
              <th>店舗名</th>
              <th>テンプレート</th>
              <th>サイト状態</th>
              <th>完成度</th>
              <th>共有閲覧</th>
              <th>営業ステータス</th>
              <th>作成日</th>
              <th>URL</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((site) => {
              const siteUrl = site.siteContractStatus === "contracted" && site.publishStatus === "published" ? buildDemoUrl(site.storeSlug) : buildOperatorPreviewUrl(site.storeSlug);
              const dashboardUrl = buildAdminUrl(site.storeSlug);
              const displayStatus = getSiteDisplayStatus(site);
              const canPublish = isDemoPhase(site) && site.salesStatus !== "lost";
              const canMarkLost = site.siteContractStatus === "demo";
              const quality = qualityBySiteId.get(site.id);
              const publishWarn =
                quality && quality.score < PUBLISH_QUALITY_WARN_THRESHOLD;
              const shareSummary = shareSummaries[site.id];

              return (
                <tr
                  key={site.id}
                  className={site.isNewlyCreated ? "admin-table-row--new" : undefined}
                >
                  <td className="font-medium admin-cell-nowrap" data-label="店舗名">
                    <span className="admin-demo-store-name" title={site.storeName}>{site.storeName}</span>
                    {site.isNewlyCreated ? (
                      <span className="admin-badge-new">新規</span>
                    ) : null}
                    {site.prospectName ? (
                      <span className="admin-demo-prospect">{site.prospectName}</span>
                    ) : null}
                  </td>
                  <td data-label="テンプレート">{getTemplateLabel(site.templateId)}</td>
                  <td data-label="サイト状態">
                    <StatusBadge
                      label={SITE_DISPLAY_STATUS_LABELS[displayStatus]}
                      variant={siteDisplayStatusVariant(displayStatus)}
                    />
                  </td>
                  <td data-label="完成度">
                    {quality ? (
                      <span
                        className="admin-quality-score-pill"
                        data-level={
                          quality.score >= PUBLISH_QUALITY_WARN_THRESHOLD
                            ? "good"
                            : quality.score >= PUBLISH_QUALITY_CONFIRM_THRESHOLD
                              ? "warn"
                              : "critical"
                        }
                        title={quality.missingLabels.join("、") || "完成"}
                      >
                        {quality.score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="共有閲覧">
                    {shareSummary && shareSummary.hasActiveShare ? (
                      <span className="admin-share-view-status">
                        共有中 · {formatShareViewStatus(shareSummary)}
                      </span>
                    ) : useRemote ? (
                      <span className="admin-share-view-status admin-share-view-status--muted">
                        {({expired:"期限切れ",revoked:"停止済み",none:"未発行"} as Record<string,string>)[shareSummary?.status??""]??"共有状態未確認"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="営業ステータス">
                    <StatusBadge
                      label={salesStatusLabels[site.salesStatus]}
                      variant={salesStatusVariant(site.salesStatus)}
                    />
                  </td>
                  <td data-label="作成日">{formatDate(site.createdAt)}</td>
                  <td data-label="URL">
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-demo-url-link"
                    >
                      {site.storeSlug}
                    </a>
                  </td>
                  <td data-label="操作">
                    <div className="admin-table-actions">
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn--ghost"
                      >
                        <ExternalLink size={13} strokeWidth={1.75} />
                        サイトを見る
                      </a>
                      <Link
                        href={`/admin/demo/${site.storeSlug}/edit`}
                        className="admin-btn admin-btn--ghost"
                      >
                        編集
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={() => onShare(site.id)}
                        title="営業用共有URL"
                      >
                        <Share2 size={13} strokeWidth={1.75} />
                        共有
                      </button>
                      {canPublish ? (
                        <button
                          type="button"
                          className={`admin-btn admin-btn--ghost${
                            publishWarn ? " admin-btn--publish-warn" : " admin-btn--accent"
                          }`}
                          onClick={() => handlePublishClick(site)}
                          title={
                            quality && quality.missingLabels.length > 0
                              ? quality.missingLabels.join("、")
                              : undefined
                          }
                        >
                          公開
                        </button>
                      ) : null}
                      {canMarkLost ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--danger-text"
                          onClick={() => onMarkLost(site.id)}
                        >
                          失注にする
                        </button>
                      ) : null}
                      <Link href={dashboardUrl} className="admin-btn admin-btn--ghost">
                        管理画面
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--danger-text"
                        onClick={() => setDeleteTarget(site)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button type="button" className="admin-btn admin-btn--secondary" disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>前の25件</button>
        <span>{currentPage} / {pages}</span>
        <button type="button" className="admin-btn admin-btn--secondary" disabled={currentPage>=pages} onClick={()=>setPage(currentPage+1)}>次の25件</button>
      </div>
      <ConfirmModal
        open={deleteTarget !== null}
        title="この案件を削除しますか？"
        message="削除すると、デモサイト・営業メモ・編集内容は復元できません。"
        confirmLabel="削除する"
        confirmVariant="danger"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={qualityConfirmTarget !== null}
        title="完成度が低い状態で公開しますか？"
        message=""
        confirmLabel="公開フローを続ける"
        onConfirm={() => {
          if (qualityConfirmTarget) onPublish(qualityConfirmTarget.id);
          setQualityConfirmTarget(null);
        }}
        onCancel={() => setQualityConfirmTarget(null)}
      >
        {qualityConfirmTarget ? (
          <PublishQualityConfirmBody site={qualityConfirmTarget} />
        ) : null}
      </ConfirmModal>
    </>
  );
}

function PublishQualityConfirmBody({ site }: { site: DemoSite }) {
  const report = evaluatePublishQuality(site);
  return (
    <div className="admin-quality-confirm-body">
      <p className="admin-modal-message">
        完成度 <strong>{report.score}%</strong>（{PUBLISH_QUALITY_CONFIRM_THRESHOLD}%未満）のため、
        お客様に提供する前に内容の確認をおすすめします。
      </p>
      {report.missingLabels.length > 0 ? (
        <ul className="admin-quality-missing admin-quality-missing--confirm">
          {report.missingLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      <p className="admin-form-hint">
        <Link href={`/admin/demo/${site.storeSlug}/edit`}>編集画面</Link>
        で不足項目を入力してから公開することもできます。
      </p>
    </div>
  );
}
