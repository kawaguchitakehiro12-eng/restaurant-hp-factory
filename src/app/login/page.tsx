import type { Metadata } from "next";
import { OperatorLoginForm } from "@/components/auth/OperatorLoginForm";
import { BRAND } from "@/lib/admin/brand";
import { ADMIN_FAVICON_ICONS } from "@/lib/admin/tokens";
import { sanitizeAdminNextPath } from "@/lib/auth/operator-role";
import "@/app/admin/admin.css";

export const metadata: Metadata = {
  title: `${BRAND.name} | 運営者ログイン`,
  icons: ADMIN_FAVICON_ICONS,
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = sanitizeAdminNextPath(typeof params.next === "string" ? params.next : null);
  const forbidden = params.error === "forbidden";

  return <OperatorLoginForm nextPath={next} forbidden={forbidden} />;
}
