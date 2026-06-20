import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ActionRequired } from "@/components/admin/ActionRequired";
import {
  billingStatusVariant,
  contractStatusVariant,
  publishStatusVariant,
  StatusBadge,
} from "@/components/admin/StatusBadge";
import { getCustomerName as getMockCustomerName } from "@/data/admin/mock";
import { getBillingActionItems } from "@/lib/admin/action-items";
import {
  billingStatusLabels,
  cancellationNoticeLabels,
  contractStatusLabels,
  formatCurrency,
  formatDate,
  paymentMethodLabels,
  publishStatusLabels,
} from "@/lib/admin/labels";
import {
  daysRemainingLabel,
  daysUntil,
  getStoreSitePath,
} from "@/lib/admin/helpers";
import type { StoreSubscription } from "@/types/admin";

type BillingTableProps = {
  subscriptions: StoreSubscription[];
};

export function BillingTable({ subscriptions }: BillingTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-table--relaxed">
        <thead>
          <tr>
            <th className="admin-cell-nowrap">顧客名</th>
            <th>店舗名</th>
            <th>プラン</th>
            <th>月額</th>
            <th>支払方法</th>
            <th>次回請求日</th>
            <th>契約</th>
            <th>請求</th>
            <th>要対応</th>
            <th>解約通知</th>
            <th>残日数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => {
            const daysLeft = daysUntil(sub.minimumTermEndDate);
            const actions = getBillingActionItems(sub);

            return (
              <tr key={sub.id}>
                <td className="admin-cell-nowrap">{getMockCustomerName(sub.customerId)}</td>
                <td className="font-medium">{sub.storeName}</td>
                <td>{sub.planName}</td>
                <td>{formatCurrency(sub.monthlyFee)}</td>
                <td>{paymentMethodLabels[sub.paymentMethod]}</td>
                <td>{formatDate(sub.nextBillingDate)}</td>
                <td>
                  <StatusBadge
                    label={contractStatusLabels[sub.contractStatus]}
                    variant={contractStatusVariant(sub.contractStatus)}
                  />
                </td>
                <td>
                  <StatusBadge
                    label={billingStatusLabels[sub.billingStatus]}
                    variant={billingStatusVariant(sub.billingStatus)}
                  />
                </td>
                <td>
                  <ActionRequired items={actions} />
                </td>
                <td>
                  <StatusBadge
                    label={
                      cancellationNoticeLabels[sub.cancellationNoticeStatus]
                    }
                    variant={
                      sub.cancellationNoticeStatus === "none" ? "gray" : "yellow"
                    }
                  />
                </td>
                <td>{daysRemainingLabel(daysLeft)}</td>
                <td>
                  <div className="admin-table-actions">
                    <Link href="/dashboard" className="admin-btn admin-btn--ghost">
                      顧客画面
                    </Link>
                    <button type="button" className="admin-btn admin-btn--ghost">
                      請求確認
                    </button>
                    <button type="button" className="admin-btn admin-btn--ghost">
                      停止
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type AdminStoreTableProps = {
  subscriptions: StoreSubscription[];
  getCustomerName?: (customerId: string) => string;
};

export function AdminStoreTable({
  subscriptions,
  getCustomerName = getMockCustomerName,
}: AdminStoreTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-table--relaxed">
        <thead>
          <tr>
            <th className="admin-cell-nowrap">顧客名</th>
            <th>店舗名</th>
            <th>月額</th>
            <th>契約</th>
            <th>請求</th>
            <th>公開</th>
            <th>要対応</th>
            <th>残日数</th>
            <th>最終更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => {
            const daysLeft = daysUntil(sub.minimumTermEndDate);
            const actions = getBillingActionItems(sub);
            const sitePath = getStoreSitePath(sub.storeSlug);

            return (
              <tr
                key={sub.id}
                className={sub.isNewlyCreated ? "admin-table-row--new" : undefined}
              >
                <td className="admin-cell-nowrap">
                  {getCustomerName(sub.customerId)}
                  {sub.isNewlyCreated ? (
                    <span className="admin-badge-new">新規</span>
                  ) : null}
                </td>
                <td className="font-medium">{sub.storeName}</td>
                <td>{formatCurrency(sub.monthlyFee)}</td>
                <td>
                  <StatusBadge
                    label={contractStatusLabels[sub.contractStatus]}
                    variant={contractStatusVariant(sub.contractStatus)}
                  />
                </td>
                <td>
                  <StatusBadge
                    label={billingStatusLabels[sub.billingStatus]}
                    variant={billingStatusVariant(sub.billingStatus)}
                  />
                </td>
                <td>
                  <StatusBadge
                    label={publishStatusLabels[sub.publishStatus]}
                    variant={publishStatusVariant(sub.publishStatus)}
                  />
                </td>
                <td>
                  <ActionRequired items={actions} />
                </td>
                <td>{daysRemainingLabel(daysLeft)}</td>
                <td>{formatDate(sub.lastUpdatedAt)}</td>
                <td>
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
                    ) : null}
                    <Link href="/dashboard" className="admin-btn admin-btn--ghost">
                      管理画面へ
                    </Link>
                    <button type="button" className="admin-btn admin-btn--ghost">
                      編集
                    </button>
                    <button type="button" className="admin-btn admin-btn--ghost">
                      停止
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
