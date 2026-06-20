import { PhotosManager } from "@/components/admin/PhotosManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getCurrentCustomerContext } from "@/lib/admin/customer-context";
import { notFound } from "next/navigation";

export default function DashboardPhotosPage() {
  const ctx = getCurrentCustomerContext();
  if (!ctx) notFound();

  return (
    <>
      <PageHeader
        title="写真管理"
        description="各セクションの写真をアップロード・差し替え"
      />
      <PhotosManager photos={ctx.store.photos} />
    </>
  );
}
