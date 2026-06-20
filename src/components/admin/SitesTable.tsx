"use client";

import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  publishStatusVariant,
  StatusBadge,
} from "@/components/admin/StatusBadge";
import {
  cancellationNoticeLabels,
  formatDate,
  publishStatusLabels,
} from "@/lib/admin/labels";
import {
  daysRemainingLabel,
  daysUntil,
  getStoreSitePath,
} from "@/lib/admin/helpers";
import type { StoreSubscription } from "@/types/admin";

type SitesTableProps = {
  subscriptions: StoreSubscription[];
};

export function SitesTable({ subscriptions }: SitesTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const openSuspend = (id: string) => {
    void id;
    setModalOpen(true);
  };

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--clickable">
          <thead>
            <tr>
              <th>店舗名</th>
              <th>サイトURL</th>
              <th>公開</th>
              <th>最終更新日</th>
              <th>解約通知予約</th>
              <th>最低利用残日数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const sitePath = getStoreSitePath(sub.storeSlug);
              const daysLeft = daysUntil(sub.minimumTermEndDate);
              const hasNotice = sub.cancellationNoticeStatus !== "none";

              return (
                <tr
                  key={sub.id}
                  className="admin-table-row--clickable"
                  onClick={() => router.push(`/admin/stores?store=${sub.id}`)}
                >
                  <td className="font-medium">{sub.storeName}</td>
                  <td>
                    <code className="admin-code">{sitePath}</code>
                  </td>
                  <td>
                    <StatusBadge
                      label={publishStatusLabels[sub.publishStatus]}
                      variant={publishStatusVariant(sub.publishStatus)}
                    />
                  </td>
                  <td>{formatDate(sub.lastUpdatedAt)}</td>
                  <td>
                    {hasNotice ? (
                      <span className="admin-notice-badge">
                        <Mail size={13} strokeWidth={1.75} />
                        <StatusBadge
                          label={
                            cancellationNoticeLabels[
                              sub.cancellationNoticeStatus
                            ]
                          }
                          variant="yellow"
                        />
                      </span>
                    ) : (
                      <StatusBadge
                        label={
                          cancellationNoticeLabels[
                            sub.cancellationNoticeStatus
                          ]
                        }
                        variant="gray"
                      />
                    )}
                  </td>
                  <td>{daysRemainingLabel(daysLeft)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="admin-table-actions">
                      {sub.publishStatus === "published" ? (
                        <a
                          href={sitePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn--ghost"
                        >
                          <ExternalLink size={13} strokeWidth={1.75} />
                          サイト確認
                        </a>
                      ) : (
                        <span className="admin-btn admin-btn--ghost opacity-40">
                          サイト確認
                        </span>
                      )}
                      <Link
                        href="/dashboard"
                        className="admin-btn admin-btn--ghost"
                      >
                        管理画面へ
                      </Link>
                      {sub.publishStatus === "published" ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          onClick={() => openSuspend(sub.id)}
                        >
                          停止
                        </button>
                      ) : (
                        <button type="button" className="admin-btn admin-btn--ghost">
                          公開
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="サイトの停止"
        message="本当に停止しますか？停止するとサイト公開と請求が停止します。顧客のログインは維持されます。"
        confirmLabel="停止する"
        onConfirm={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
