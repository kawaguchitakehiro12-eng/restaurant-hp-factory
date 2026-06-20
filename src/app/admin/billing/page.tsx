import { BillingTable } from "@/components/admin/BillingTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { getDashboardStats, storeSubscriptions } from "@/data/admin/mock";
import { formatCurrency } from "@/lib/admin/labels";

export default function AdminBillingPage() {
  const stats = getDashboardStats();

  return (
    <>
      <PageHeader
        title="契約・請求管理"
        description="お金・契約・請求の管理"
      />

      <div className="admin-stat-rows mb-6">
        <div className="admin-stat-grid">
          <StatCard label="MRR" value={formatCurrency(stats.monthlyRevenue)} hint="月次固定収益" />
          <StatCard label="今月入金予定" value={formatCurrency(stats.monthlyIncomingExpected)} />
          <StatCard label="未払い件数" value={stats.unpaidCount} />
        </div>
        <div className="admin-stat-grid">
          <StatCard label="解約通知予約数" value={stats.cancellationNoticeCount} />
          <StatCard label="最低利用30日以内" value={stats.minTermEndingWithin30Days} />
          <StatCard label="停止予約" value={stats.suspensionScheduledCount} />
        </div>
      </div>

      <BillingTable subscriptions={storeSubscriptions} />
    </>
  );
}
