import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND } from "@/lib/admin/brand";
import { ADMIN_FAVICON_ICONS } from "@/lib/admin/tokens";
import "../admin/admin.css";

const inter = Inter({
  variable: "--font-admin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} | ${BRAND.customerPanelTitle}`,
  icons: ADMIN_FAVICON_ICONS,
};

export default function DashboardRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={inter.variable}>{children}</div>;
}
