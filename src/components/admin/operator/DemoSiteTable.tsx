"use client";

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
import { buildAdminUrl, buildDemoUrl } from "@/lib/admin/demo-create";
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
  const useRemote = isSupabaseConfigured();

  useEffect(() => {
    if (!useRemote || demoSites.length === 0) {
      setShareSummaries({});
      return;
    }
    let cancelled = false;
    void fetchDemoShareSummaries(demoSites.map((d) => d.id)).then((summaries) => {
      if (!cancelled) setShareSummaries(summaries);
    });
    return () => {
      cancelled = true;
    };
  }, [demoSites, useRemote, shareDataVersion]);

  const qualityBySiteId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof evaluatePublishQuality>>();
    for (const site of demoSites) {
      map.set(site.id, evaluatePublishQuality(site));
    }
    return map;
  }, [demoSites]);

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
            {demoSites.map((site) => {
              const siteUrl = buildDemoUrl(site.storeSlug);
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
                  <td className="font-medium admin-cell-nowrap">
                    {site.storeName}
                    {site.isNewlyCreated ? (
                      <span className="admin-badge-new">新規</span>
                    ) : null}
                    {site.prospectName ? (
                      <span className="admin-demo-prospect">{site.prospectName}</span>
                    ) : null}
                  </td>
                  <td>{getTemplateLabel(site.templateId)}</td>
                  <td>
                    <StatusBadge
                      label={SITE_DISPLAY_STATUS_LABELS[displayStatus]}
                      variant={siteDisplayStatusVariant(displayStatus)}
                    />
                  </td>
                  <td>
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
                  <td>
                    {shareSummary && shareSummary.hasActiveShare ? (
                      <span className="admin-share-view-status">
                        {formatShareViewStatus(shareSummary)}
                      </span>
                    ) : useRemote ? (
                      <span className="admin-share-view-status admin-share-view-status--muted">
                        未共有
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <StatusBadge
                      label={salesStatusLabels[site.salesStatus]}
                      variant={salesStatusVariant(site.salesStatus)}
                    />
                  </td>
                  <td>{formatDate(site.createdAt)}</td>
                  <td>
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-demo-url-link"
                    >
                      {site.storeSlug}
                    </a>
                  </td>
                  <td>
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
