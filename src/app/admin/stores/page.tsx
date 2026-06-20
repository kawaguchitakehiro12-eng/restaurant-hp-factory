import { AdminStoreTable } from "@/components/admin/BillingTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { storeSubscriptions } from "@/data/admin/mock";

export default function StoresPage() {
  return (
    <>
      <PageHeader
        title="店舗一覧"
        description="契約・請求・公開ステータスの管理"
        action={
          <button type="button" className="admin-btn admin-btn--primary">
            + 新規契約作成
          </button>
        }
      />

      <AdminStoreTable subscriptions={storeSubscriptions} />
    </>
  );
}
