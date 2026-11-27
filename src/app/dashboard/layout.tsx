import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOperatorAuth } from "@/lib/auth/operator";
import { BRAND } from "@/lib/admin/brand";
import { ADMIN_FAVICON_ICONS } from "@/lib/admin/tokens";
import "../admin/admin.css";

export const metadata: Metadata = {
  title: `${BRAND.name} | ${BRAND.customerPanelTitle}`,
  icons: ADMIN_FAVICON_ICONS,
  robots: { index: false, follow: false },
};

export default async function DashboardRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 顧客本人の認証・店舗所有者判定が完成するまでは運営者専用。
  const auth = await getOperatorAuth();
  if(auth.status==="unavailable")return <main role="alert"><h1>認証サービスに接続できません</h1><p>時間をおいてページを再読み込みしてください。</p></main>;
  if (auth.status === "unauthenticated") redirect("/login?next=/dashboard");
  if (auth.status === "forbidden") redirect("/login?error=forbidden");
  return children;
}
