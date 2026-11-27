"use client";

import { CreateDemoButton } from "@/components/admin/operator/CreateDemoButton";
import { CreateDemoFlow } from "@/components/admin/operator/CreateDemoFlow";
import { PublishSiteFlow } from "@/components/admin/operator/PublishSiteFlow";
import { ConvertToContractModal } from "@/components/admin/operator/ConvertToContractModal";
import { DemoShareModal } from "@/components/admin/operator/DemoShareModal";
import { OperatorAdminProvider, useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { AdminShell, type NavItem } from "@/components/admin/AdminShell";
import { AdminUiProvider } from "@/components/admin/AdminUiProvider";
import { OperatorAccountMenu, signOutOperator } from "@/components/auth/OperatorAccountMenu";
import type { ReactNode } from "react";

type AdminOperatorLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  operatorEmail: string | null;
  children: ReactNode;
};

function AuthErrorBanner() {
  const { authError } = useOperatorAdmin();
  if (!authError) return null;

  const loginHref = `/login?next=${encodeURIComponent(
    typeof window === "undefined" ? "/admin" : window.location.pathname
  )}`;

  return (
    <div className="admin-auth-banner" role="alert">
      <p className="admin-auth-banner-text">
        {authError === 401
          ? "ログインの有効期限が切れたため、直前の操作は保存されていません。別タブで再ログインしてから、もう一度操作してください。"
          : "このアカウントには管理画面の操作権限がありません。運営者アカウントでログインし直してください。"}
      </p>
      <div className="admin-auth-banner-actions">
        {authError === 401 ? (
          <a
            href={loginHref}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--primary"
          >
            別タブで再ログイン
          </a>
        ) : (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => void signOutOperator()}
          >
            ログアウト
          </button>
        )}
      </div>
    </div>
  );
}

function AdminOperatorShell({
  title,
  subtitle,
  navItems,
  operatorEmail,
  children,
}: AdminOperatorLayoutProps) {
  const { openPublishModal, shareModalDemoId, closeShareModal, getDemoSite, refreshShareData } =
    useOperatorAdmin();
  const shareDemoSite = shareModalDemoId ? getDemoSite(shareModalDemoId) : null;

  return (
    <AdminShell
      variant="operator"
      title={title}
      subtitle={subtitle}
      navItems={navItems}
      headerRight={
        <div className="admin-header-actions">
          <CreateDemoButton />
          <OperatorAccountMenu email={operatorEmail} />
        </div>
      }
    >
      {children}
      <CreateDemoFlow onRequestPublish={openPublishModal} />
      <PublishSiteFlow />
      <ConvertToContractModal />
      <DemoShareModal
        demoSite={shareDemoSite ?? null}
        onClose={closeShareModal}
        onShareUpdated={refreshShareData}
      />
      <AuthErrorBanner />
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
