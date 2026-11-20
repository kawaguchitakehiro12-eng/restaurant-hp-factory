"use client";

import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { useDemoCustomer } from "@/components/dashboard/demo/DemoCustomerProvider";

export function DemoCustomerSettingsPage() {
  const { store } = useDemoCustomer();

  return (
    <>
      <PageHeader title="店舗基本情報" description="店舗情報の編集" />
      <SettingsForm store={store} />
    </>
  );
}
