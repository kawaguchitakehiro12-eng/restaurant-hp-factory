"use client";

import { MenuManager } from "@/components/admin/MenuManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { useDemoCustomer } from "@/components/dashboard/demo/DemoCustomerProvider";

export function DemoCustomerMenuPage() {
  const { store } = useDemoCustomer();

  return (
    <>
      <PageHeader title="メニュー管理" description="メニュー写真・価格・説明の編集" />
      <MenuManager items={store.menu} />
    </>
  );
}
