"use client";

import { TopicsManager } from "@/components/admin/TopicsManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { useDemoCustomer } from "@/components/dashboard/demo/DemoCustomerProvider";

export function DemoCustomerTopicsPage() {
  const { store } = useDemoCustomer();

  return (
    <>
      <PageHeader title="トピックス" description="お知らせ・新作・限定情報の管理" />
      <TopicsManager topics={store.topics} />
    </>
  );
}
