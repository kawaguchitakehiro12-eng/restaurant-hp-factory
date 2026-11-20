import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminClientLayout } from "@/components/admin/AdminClientLayout";
import {
  currentCustomerId,
  getSubscriptionByCustomerId,
} from "@/data/admin/mock";
import { BRAND } from "@/lib/admin/brand";
import { getStoreBySlug } from "@/data/stores";
import { getStoreSitePath } from "@/lib/admin/helpers";

const customerNav = [
  { href: "/dashboard", label: "ダッシュボード", exact: true, icon: "dashboard" as const },
  { href: "/dashboard/settings", label: "店舗基本情報", icon: "settings" as const },
  { href: "/dashboard/topics", label: "トピックス", icon: "topics" as const },
  { href: "/dashboard/photos", label: "写真管理", icon: "photos" as const },
  { href: "/dashboard/menu", label: "メニュー管理", icon: "menu" as const },
  { href: "/dashboard/billing", label: "契約・請求", icon: "billing" as const },
];

export default function CustomerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const subscription = getSubscriptionByCustomerId(currentCustomerId);
  const store = subscription ? getStoreBySlug(subscription.storeSlug) : undefined;

  return (
    <AdminClientLayout
      variant="customer"
      title={store?.name ?? "店舗"}
      subtitle={BRAND.customerPanelTitle}
      navItems={customerNav}
      headerRight={
        subscription && (
          <Link
            href={getStoreSitePath(subscription.storeSlug)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--primary admin-header-cta"
          >
            <ExternalLink size={14} strokeWidth={1.75} />
            サイトを確認
          </Link>
        )
      }
    >
      {children}
    </AdminClientLayout>
  );
}
