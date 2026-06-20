import { AdminStoreTable } from "@/components/admin/BillingTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import {
  getDashboardStats,
  storeSubscriptions,
} from "@/data/admin/mock";
import { formatCurrency } from "@/lib/admin/labels";

export default function AdminDashboardPage() {
  const stats = getDashboardStats();

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="契約・請求・公開状況の概要"
      />

      <div className="admin-stat-rows mb-6">
        <div className="admin-stat-grid admin-stat-grid--primary">
          <StatCard label="MRR" value={formatCurrency(stats.monthlyRevenue)} hint="月次固定収益" emphasis={1} />
          <StatCard label="今月入金予定" value={formatCurrency(stats.monthlyIncomingExpected)} emphasis={2} />
        </div>
        <div className="admin-stat-grid">
          <StatCard label="解約通知予約" value={stats.cancellationNoticeCount} emphasis={3} />
          <StatCard label="公開店舗数" value={stats.publishedCount} emphasis={4} />
          <StatCard label="顧客数" value={stats.totalCustomers} />
          <StatCard label="未払い件数" value={stats.unpaidCount} />
          <StatCard label="最低利用終了30日以内" value={stats.minTermEndingWithin30Days} />
          <StatCard label="停止中サイト" value={stats.suspendedCount} />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">店舗一覧</h2>
        <a href="/admin/stores" className="admin-btn admin-btn--secondary text-xs">
          すべて表示
        </a>
      </div>

      <AdminStoreTable subscriptions={storeSubscriptions} />
    </>
  );
}
