import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AdminOperatorLayout } from "@/components/admin/operator/AdminOperatorLayout";
import { BRAND } from "@/lib/admin/brand";
import { ADMIN_FAVICON_ICONS } from "@/lib/admin/tokens";
import "./admin.css";

const inter = Inter({
  variable: "--font-admin",
  subsets: ["latin"],
  display: "swap",
});

const adminNav = [
  { href: "/admin", label: "ダッシュボード", exact: true, icon: "dashboard" as const },
  { href: "/admin/customers", label: "顧客一覧", icon: "customers" as const },
  { href: "/admin/stores", label: "デモ・契約管理", icon: "stores" as const },
  { href: "/admin/billing", label: "契約・請求管理", icon: "billing" as const },
  { href: "/admin/sites", label: "サイト管理", icon: "sites" as const },
];

export const metadata: Metadata = {
  title: `${BRAND.name} | ${BRAND.operatorPanelTitle}`,
  icons: ADMIN_FAVICON_ICONS,
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={inter.variable}>
      <AdminOperatorLayout
        title={BRAND.name}
        subtitle={BRAND.operatorPanelTitle}
        navItems={adminNav}
      >
        {children}
      </AdminOperatorLayout>
    </div>
  );
}
