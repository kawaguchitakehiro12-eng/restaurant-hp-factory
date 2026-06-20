"use client";

import { CreateDemoButton } from "@/components/admin/operator/CreateDemoButton";
import { CreateDemoFlow } from "@/components/admin/operator/CreateDemoFlow";
import { ConvertToContractModal } from "@/components/admin/operator/ConvertToContractModal";
import { OperatorAdminProvider, useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { AdminShell, type NavItem } from "@/components/admin/AdminShell";
import { AdminUiProvider } from "@/components/admin/AdminUiProvider";
import type { ReactNode } from "react";

type AdminOperatorLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: ReactNode;
};

function AdminOperatorShell({
  title,
  subtitle,
  navItems,
  children,
}: AdminOperatorLayoutProps) {
  const { openConvertModal } = useOperatorAdmin();

  return (
    <AdminShell
      variant="operator"
      title={title}
      subtitle={subtitle}
      navItems={navItems}
      headerRight={<CreateDemoButton />}
    >
      {children}
      <CreateDemoFlow onRequestConvert={openConvertModal} />
      <ConvertToContractModal />
    </AdminShell>
  );
}

export function AdminOperatorLayout(props: AdminOperatorLayoutProps) {
  return (
    <OperatorAdminProvider>
      <AdminUiProvider>
        <AdminOperatorShell {...props} />
      </AdminUiProvider>
    </OperatorAdminProvider>
  );
}
