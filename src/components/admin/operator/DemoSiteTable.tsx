"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  salesStatusVariant,
  SITE_CONTRACT_STATUS_LABELS,
  siteContractStatusVariant,
  salesStatusLabels,
} from "@/lib/admin/demo-labels";
import { getTemplateLabel } from "@/lib/admin/contract-templates";
import { buildAdminUrl, buildDemoUrl } from "@/lib/admin/demo-create";
import { publishStatusLabels } from "@/lib/admin/labels";
import { publishStatusVariant, StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/labels";
import type { DemoSite } from "@/types/demo";

type DemoSiteTableProps = {
  demoSites: DemoSite[];
  onConvert: (demoSiteId: string) => void;
  onMarkLost: (demoSiteId: string) => void;
  onDelete: (demoSiteId: string) => void;
};

export function DemoSiteTable({
  demoSites,
  onConvert,
  onMarkLost,
  onDelete,
}: DemoSiteTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<DemoSite | null>(null);

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--relaxed admin-table--demo">
          <thead>
            <tr>
              <th>店舗名</th>
              <th>テンプレート</th>
              <th>営業ステータス</th>
              <th>公開状態</th>
              <th>作成日</th>
              <th>契約状態</th>
              <th>デモURL</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {demoSites.map((site) => {
              const demoUrl = buildDemoUrl(site.storeSlug);
              const dashboardUrl = buildAdminUrl(site.storeSlug);
              const canConvert =
                site.siteContractStatus === "demo" && site.salesStatus !== "lost";
              const canMarkLost = site.siteContractStatus === "demo";

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
                      label={salesStatusLabels[site.salesStatus]}
                      variant={salesStatusVariant(site.salesStatus)}
                    />
                  </td>
                  <td>
                    <StatusBadge
                      label={publishStatusLabels[site.publishStatus]}
                      variant={publishStatusVariant(site.publishStatus)}
                    />
                  </td>
                  <td>{formatDate(site.createdAt)}</td>
                  <td>
                    <StatusBadge
                      label={SITE_CONTRACT_STATUS_LABELS[site.siteContractStatus]}
                      variant={siteContractStatusVariant(site.siteContractStatus)}
                    />
                  </td>
                  <td>
                    <a
                      href={demoUrl}
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
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn--ghost"
                      >
                        <ExternalLink size={13} strokeWidth={1.75} />
                        デモを見る
                      </a>
                      <Link
                        href={`/admin/demo/${site.storeSlug}/edit`}
                        className="admin-btn admin-btn--ghost"
                      >
                        編集
                      </Link>
                      {canConvert ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--accent"
                          onClick={() => onConvert(site.id)}
                        >
                          契約へ切り替え
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
    </>
  );
}
