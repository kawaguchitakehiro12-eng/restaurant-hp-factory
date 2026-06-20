import { CustomerPhotosPageClient } from "@/components/dashboard/CustomerPhotosPageClient";
import { getCurrentCustomerContext } from "@/lib/admin/customer-context";
import { notFound } from "next/navigation";

export default function DashboardPhotosPage() {
  const ctx = getCurrentCustomerContext();
  if (!ctx) notFound();

  return (
    <CustomerPhotosPageClient
      storeSlug={ctx.store.slug}
      storeName={ctx.store.name}
    />
  );
}
