import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminOperatorLayout } from "@/components/admin/operator/AdminOperatorLayout";
import { BRAND } from "@/lib/admin/brand";
import { ADMIN_FAVICON_ICONS } from "@/lib/admin/tokens";
import { getOperatorAuth } from "@/lib/auth/operator";
import "./admin.css";

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
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getOperatorAuth();
  if(auth.status==="unavailable")return <main role="alert"><h1>認証サービスに接続できません</h1><p>時間をおいてページを再読み込みしてください。</p></main>;
  if (auth.status === "unauthenticated") redirect("/login");
  if (auth.status === "forbidden") redirect("/login?error=forbidden");

  return (
    <AdminOperatorLayout
      title={BRAND.name}
      subtitle={BRAND.operatorPanelTitle}
      navItems={adminNav}
      operatorEmail={auth.user.email ?? null}
    >
      {children}
    </AdminOperatorLayout>
  );
}
