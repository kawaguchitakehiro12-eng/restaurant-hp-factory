"use client";

import { DemoSiteTable } from "@/components/admin/operator/DemoSiteTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { CreateDemoButton } from "@/components/admin/operator/CreateDemoButton";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { StatCard } from "@/components/admin/StatCard";
import { computeDemoDashboardStats } from "@/lib/admin/demo-create";
import { SITE_DISPLAY_STATUS_LABELS } from "@/lib/admin/site-display-status";
import { computeSiteStatusCounts } from "@/lib/admin/site-status-counts";
import { formatCurrency } from "@/lib/admin/labels";

export function AdminDashboardClient() {
  const {
    demoSites,
    openPublishModal,
    openShareModal,
    markAsLost,
    deleteDemoSite,
    shareDataVersion,
  } = useOperatorAdmin();
  const stats = computeDemoDashboardStats(demoSites);
  const statusCounts = computeSiteStatusCounts(demoSites);

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="デモ・契約・営業状況の概要"
      />

      <div className="admin-stat-rows mb-6">
        <div className="admin-stat-grid admin-stat-grid--status">
          <StatCard
            label={SITE_DISPLAY_STATUS_LABELS.published}
            value={statusCounts.published}
            hint="正式公開中"
            emphasis={1}
          />
          <StatCard
            label={SITE_DISPLAY_STATUS_LABELS.demo}
            value={statusCounts.demo}
            hint="営業デモ"
            emphasis={2}
          />
          <StatCard
            label={SITE_DISPLAY_STATUS_LABELS.suspended}
            value={statusCounts.suspended}
            hint="公開停止"
            emphasis={3}
          />
          <StatCard
            label={SITE_DISPLAY_STATUS_LABELS.lost}
            value={statusCounts.lost}
            hint="失注案件"
            emphasis={4}
          />
        </div>
        <div className="admin-stat-grid">
          <StatCard label="契約済み" value={stats.contractedCount} />
          <StatCard label="提案パイプライン" value={stats.proposalPipeline} />
          <StatCard label="総案件数" value={stats.totalDemoSites} />
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
        onPublish={openPublishModal}
        onShare={openShareModal}
        onMarkLost={markAsLost}
        onDelete={deleteDemoSite}
        shareDataVersion={shareDataVersion}
      />
    </>
  );
}

export function AdminStoresClient() {
  const {
    demoSites,
    openPublishModal,
    openShareModal,
    markAsLost,
    deleteDemoSite,
    shareDataVersion,
  } = useOperatorAdmin();

  return (
    <>
      <PageHeader
        title="デモ・契約管理"
        description="営業デモから本契約までの案件管理"
        action={<CreateDemoButton />}
      />

      <DemoSiteTable
        demoSites={demoSites}
        onPublish={openPublishModal}
        onShare={openShareModal}
        onMarkLost={markAsLost}
        onDelete={deleteDemoSite}
        shareDataVersion={shareDataVersion}
      />
    </>
  );
}
