"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";
import { SakupageLogo } from "@/components/admin/SakupageLogo";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { NAV_ICONS, type NavIconName } from "@/components/admin/nav-icons";
import { BRAND } from "@/lib/admin/brand";

export type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon?: NavIconName;
};

type AdminShellProps = {
  variant: "customer" | "operator";
  title: string;
  subtitle: string;
  navItems: NavItem[];
  headerRight?: ReactNode;
  children: ReactNode;
};

export function AdminShell({
  variant,
  title,
  subtitle,
  navItems,
  headerRight,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const { confirmLeave } = useAdminUi();
  const showLogo = variant === "customer";

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) return;
    if (!confirmLeave()) {
      e.preventDefault();
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div
            className={`admin-sidebar-brand${showLogo ? " admin-sidebar-brand--with-logo" : ""}`}
          >
            {showLogo && (
              <div className="admin-sidebar-logo-wrap">
                <SakupageLogo variant="sidebar" />
              </div>
            )}
            <div className="admin-sidebar-brand-text">
              {!showLogo && <p className="admin-sidebar-brand-name">{BRAND.name}</p>}
              <p className="admin-sidebar-title">{title}</p>
              <p className="admin-sidebar-subtitle">{subtitle}</p>
            </div>
          </div>
          <nav className="admin-nav">
            {navItems.map((item) => {
              const Icon = item.icon ? NAV_ICONS[item.icon] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive(item) ? "true" : "false"}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {Icon && <Icon size={15} strokeWidth={1.75} />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="admin-main">
          <header className="admin-header admin-header--sticky">
            {showLogo ? (
              <div className="admin-header-brand">
                <SakupageLogo variant="header" />
                <span className="admin-header-subtitle">{subtitle}</span>
              </div>
            ) : (
              <span className="admin-header-subtitle">{subtitle}</span>
            )}
            {headerRight}
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
