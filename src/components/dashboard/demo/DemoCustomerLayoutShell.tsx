"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminClientLayout } from "@/components/admin/AdminClientLayout";
import { BRAND } from "@/lib/admin/brand";
import { getStoreSitePath } from "@/lib/admin/helpers";
import { DemoCustomerProvider, useDemoCustomer } from "./DemoCustomerProvider";
import type { ReactNode } from "react";

function DemoCustomerNavShell({ children }: { children: ReactNode }) {
  const { store, basePath, subscription } = useDemoCustomer();

  const navItems = [
    { href: basePath, label: "ダッシュボード", exact: true, icon: "dashboard" as const },
    { href: `${basePath}/settings`, label: "店舗基本情報", icon: "settings" as const },
    { href: `${basePath}/topics`, label: "トピックス", icon: "topics" as const },
    { href: `${basePath}/photos`, label: "写真管理", icon: "photos" as const },
    { href: `${basePath}/menu`, label: "メニュー管理", icon: "menu" as const },
    { href: `${basePath}/billing`, label: "契約・請求", icon: "billing" as const },
  ];

  return (
    <AdminClientLayout
      variant="customer"
      title={store.name}
      subtitle={BRAND.customerPanelTitle}
      navItems={navItems}
      headerRight={
        <Link
          href={getStoreSitePath(subscription.storeSlug)}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn--primary admin-header-cta"
        >
          <ExternalLink size={14} strokeWidth={1.75} />
          サイトを確認
        </Link>
      }
    >
      {children}
    </AdminClientLayout>
  );
}

export function DemoCustomerLayoutShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <DemoCustomerProvider slug={slug}>
      <DemoCustomerNavShell>{children}</DemoCustomerNavShell>
    </DemoCustomerProvider>
  );
}
