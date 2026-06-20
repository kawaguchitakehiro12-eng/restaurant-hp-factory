import { BillingContractPanel } from "@/components/admin/BillingContractPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  billingStatusVariant,
  contractStatusVariant,
  StatusBadge,
} from "@/components/admin/StatusBadge";
import { getCustomerById, currentCustomerId } from "@/data/admin/mock";
import { getCurrentCustomerContext } from "@/lib/admin/customer-context";
import {
  billingStatusLabels,
  cancellationNoticeLabels,
  contractStatusLabels,
  formatCurrency,
  formatDate,
  paymentMethodLabels,
} from "@/lib/admin/labels";
import { daysRemainingLabel, daysUntil } from "@/lib/admin/helpers";
import { notFound } from "next/navigation";

export default function DashboardBillingPage() {
  const ctx = getCurrentCustomerContext();
  if (!ctx) notFound();

  const { subscription } = ctx;
  const customer = getCustomerById(currentCustomerId);
  const daysLeft = daysUntil(subscription.minimumTermEndDate);

  return (
    <>
      <PageHeader
        title="契約・請求情報"
        description="プラン・契約期間・請求状況の確認"
      />

      <div className="admin-card max-w-xl">
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">現在のプラン</span>
          <span className="font-medium">{subscription.planName}</span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">月額料金</span>
          <span className="font-medium">
            {formatCurrency(subscription.monthlyFee)}
          </span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">支払方法</span>
          <span>{paymentMethodLabels[subscription.paymentMethod]}</span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">契約開始日</span>
          <span>{formatDate(subscription.contractStartDate)}</span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">最低利用期間終了日</span>
          <span>{formatDate(subscription.minimumTermEndDate)}</span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">最低利用期間まで</span>
          <span>{daysRemainingLabel(daysLeft)}</span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">次回請求日</span>
          <span>{formatDate(subscription.nextBillingDate)}</span>
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">契約ステータス</span>
          <StatusBadge
            label={contractStatusLabels[subscription.contractStatus]}
            variant={contractStatusVariant(subscription.contractStatus)}
          />
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">請求ステータス</span>
          <StatusBadge
            label={billingStatusLabels[subscription.billingStatus]}
            variant={billingStatusVariant(subscription.billingStatus)}
          />
        </div>
        <div className="admin-billing-row">
          <span className="text-[var(--admin-muted)]">解約通知予約</span>
          <StatusBadge
            label={
              cancellationNoticeLabels[subscription.cancellationNoticeStatus]
            }
            variant={
              subscription.cancellationNoticeStatus === "none" ? "gray" : "yellow"
            }
          />
        </div>
      </div>

      <div className="mt-4 max-w-xl">
        <BillingContractPanel
          subscription={subscription}
          contactEmail={customer?.contactEmail ?? ""}
        />
      </div>
    </>
  );
}
