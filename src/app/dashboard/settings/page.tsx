import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { getCurrentCustomerContext } from "@/lib/admin/customer-context";
import { notFound } from "next/navigation";

export default function DashboardSettingsPage() {
  const ctx = getCurrentCustomerContext();
  if (!ctx) notFound();

  return (
    <>
      <PageHeader
        title="店舗基本情報"
        description="店舗情報の編集"
      />
      <SettingsForm store={ctx.store} />
    </>
  );
}
