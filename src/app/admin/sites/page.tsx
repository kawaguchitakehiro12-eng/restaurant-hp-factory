import { PageHeader } from "@/components/admin/PageHeader";
import { SiteVisibilityManager } from "@/components/admin/operator/SiteVisibilityManager";


export default function AdminSitesPage() {
  return (
    <>
      <PageHeader
        title="サイト運用管理"
        description="公開・停止の操作とサイト確認"
      />

      <SiteVisibilityManager />
    </>
  );
}
