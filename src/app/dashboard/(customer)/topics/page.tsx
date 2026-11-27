import { TopicsManager } from "@/components/admin/TopicsManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getCurrentCustomerContext } from "@/lib/admin/customer-context";
import { notFound } from "next/navigation";

export default function DashboardTopicsPage() {
  const ctx = getCurrentCustomerContext();
  if (!ctx) notFound();

  return (
    <>
      <PageHeader title="トピックス" description="お知らせ・新作・限定情報の管理" />
      <TopicsManager topics={ctx.store.topics} />
    </>
  );
}
