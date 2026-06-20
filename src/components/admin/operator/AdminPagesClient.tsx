"use client";

import { DemoSiteTable } from "@/components/admin/operator/DemoSiteTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { CreateDemoButton } from "@/components/admin/operator/CreateDemoButton";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { StatCard } from "@/components/admin/StatCard";
import { computeDemoDashboardStats } from "@/lib/admin/demo-create";
import { formatCurrency } from "@/lib/admin/labels";

export function AdminDashboardClient() {
  const { demoSites, openConvertModal, markAsLost, deleteDemoSite } = useOperatorAdmin();
  const stats = computeDemoDashboardStats(demoSites);

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="デモ・契約・営業状況の概要"
      />

      <div className="admin-stat-rows mb-6">
        <div className="admin-stat-grid admin-stat-grid--primary">
          <StatCard label="デモサイト" value={stats.activeDemos} hint="営業中のデモ" emphasis={1} />
          <StatCard label="契約済み" value={stats.contractedCount} emphasis={2} />
        </div>
        <div className="admin-stat-grid">
          <StatCard label="提案パイプライン" value={stats.proposalPipeline} emphasis={3} />
          <StatCard label="公開中" value={stats.publishedCount} emphasis={4} />
          <StatCard label="総案件数" value={stats.totalDemoSites} />
          <StatCard label="失注" value={stats.lostCount} />
          <StatCard label="MRR" value={formatCurrency(stats.monthlyRevenue)} />
          <StatCard label="今月作成" value={stats.createdThisMonth} />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">デモ・契約管理</h2>
        <a href="/admin/stores" className="admin-btn admin-btn--secondary text-xs">
          すべて表示
        </a>
      </div>

      <DemoSiteTable
        demoSites={demoSites}
        onConvert={openConvertModal}
        onMarkLost={markAsLost}
        onDelete={deleteDemoSite}
      />
    </>
  );
}

export function AdminStoresClient() {
  const { demoSites, openConvertModal, markAsLost, deleteDemoSite } = useOperatorAdmin();

  return (
    <>
      <PageHeader
        title="デモ・契約管理"
        description="営業デモから本契約までの案件管理"
        action={<CreateDemoButton />}
      />

      <DemoSiteTable
        demoSites={demoSites}
        onConvert={openConvertModal}
        onMarkLost={markAsLost}
        onDelete={deleteDemoSite}
      />
    </>
  );
}
