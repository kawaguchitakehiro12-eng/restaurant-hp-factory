import { MenuManager } from "@/components/admin/MenuManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getCurrentCustomerContext } from "@/lib/admin/customer-context";
import { notFound } from "next/navigation";

export default function DashboardMenuPage() {
  const ctx = getCurrentCustomerContext();
  if (!ctx) notFound();

  return (
    <>
      <PageHeader
        title="メニュー管理"
        description="メニュー写真・価格・説明の編集"
      />
      <MenuManager items={ctx.store.menu} />
    </>
  );
}
