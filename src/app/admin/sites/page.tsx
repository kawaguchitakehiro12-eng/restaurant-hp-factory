import { PageHeader } from "@/components/admin/PageHeader";
import { SitesTable } from "@/components/admin/SitesTable";
import { storeSubscriptions } from "@/data/admin/mock";

export default function AdminSitesPage() {
  return (
    <>
      <PageHeader
        title="サイト運用管理"
        description="公開・停止の操作とサイト確認"
      />

      <SitesTable subscriptions={storeSubscriptions} />
    </>
  );
}
