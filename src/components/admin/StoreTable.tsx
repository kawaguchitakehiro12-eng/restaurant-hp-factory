import {
  billingStatusLabels,
  contractStatusLabels,
  formatCurrency,
  formatDate,
  publishStatusLabels,
  templateTypeLabels,
} from "@/lib/admin/labels";
import {
  billingStatusVariant,
  contractStatusVariant,
  publishStatusVariant,
  StatusBadge,
} from "@/components/admin/StatusBadge";
import { getCustomerName } from "@/data/admin/mock";
import type { StoreSubscription } from "@/types/admin";

type StoreTableProps = {
  subscriptions: StoreSubscription[];
  showActions?: boolean;
};

export function StoreTable({ subscriptions, showActions = true }: StoreTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>顧客名</th>
            <th>店舗名</th>
            <th>テンプレ</th>
            <th>月額料金</th>
            <th>契約開始日</th>
            <th>最低利用期間終了日</th>
            <th>契約</th>
            <th>請求</th>
            <th>公開</th>
            {showActions && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td>{getCustomerName(sub.customerId)}</td>
              <td className="font-medium">{sub.storeName}</td>
              <td>{templateTypeLabels[sub.templateType]}</td>
              <td>{formatCurrency(sub.monthlyFee)}</td>
              <td>{formatDate(sub.contractStartDate)}</td>
              <td>{formatDate(sub.minimumTermEndDate)}</td>
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
              {showActions && (
                <td>
                  <div className="flex gap-1">
                    {sub.publishStatus === "published" ? (
                      <button type="button" className="admin-btn admin-btn--ghost">
                        停止
                      </button>
                    ) : (
                      <button type="button" className="admin-btn admin-btn--ghost">
                        公開
                      </button>
                    )}
                    <a
                      href={sub.storeSlug === "nuee" ? "/cafe" : "/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn--ghost"
                    >
                      確認
                    </a>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
