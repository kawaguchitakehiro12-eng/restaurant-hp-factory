"use client";

import { AdminShell, type NavItem } from "@/components/admin/AdminShell";
import { AdminUiProvider } from "@/components/admin/AdminUiProvider";
import type { ReactNode } from "react";

type AdminClientLayoutProps = {
  variant: "customer" | "operator";
  title: string;
  subtitle: string;
  navItems: NavItem[];
  headerRight?: ReactNode;
  children: ReactNode;
};

export function AdminClientLayout({
  variant,
  title,
  subtitle,
  navItems,
  headerRight,
  children,
}: AdminClientLayoutProps) {
  return (
    <AdminUiProvider>
      <AdminShell
        variant={variant}
        title={title}
        subtitle={subtitle}
        navItems={navItems}
        headerRight={headerRight}
      >
        {children}
      </AdminShell>
    </AdminUiProvider>
  );
}
