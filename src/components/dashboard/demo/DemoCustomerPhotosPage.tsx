"use client";

import { PhotosManager } from "@/components/admin/PhotosManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { useDemoCustomer } from "@/components/dashboard/demo/DemoCustomerProvider";

export function DemoCustomerPhotosPage() {
  const { store } = useDemoCustomer();

  return (
    <>
      <PageHeader title="写真管理" description="各セクションの写真をアップロード・差し替え" />
      <PhotosManager photos={store.photos} />
    </>
  );
}
