"use client";

import { NavLinkCard } from "@/components/admin/NavLinkCard";
import { OnboardingChecklist } from "@/components/admin/OnboardingChecklist";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  billingStatusVariant,
  contractStatusVariant,
  publishStatusVariant,
  StatusBadge,
} from "@/components/admin/StatusBadge";
import { useDemoCustomer } from "@/components/dashboard/demo/DemoCustomerProvider";
import {
  formatBusinessHoursSummary,
  getOnboardingChecklist,
  getOnboardingProgress,
  truncateAddress,
} from "@/lib/admin/helpers";
import {
  billingStatusLabels,
  contractStatusLabels,
  formatCurrency,
  formatDate,
  publishStatusLabels,
  templateTypeLabels,
} from "@/lib/admin/labels";
import { getPhotoCompleteness, PHOTO_RECOMMENDED_TOTAL } from "@/lib/admin/photos";

export function DemoCustomerDashboardPage() {
  const { store, subscription, basePath, demo } = useDemoCustomer();
  const updated = formatDate(demo.lastUpdatedAt);
  const photoStats = getPhotoCompleteness(store.photos);
  const checklist = getOnboardingChecklist(store, subscription);
  const progress = getOnboardingProgress(checklist);
  const popularMenu = store.menu[0]?.name ?? "未登録";

  const navCards = [
    {
      href: `${basePath}/settings`,
      title: "店舗基本情報",
      icon: "settings" as const,
      status: `${store.name} · ${formatBusinessHoursSummary(store)}`,
      detail: truncateAddress(store.address),
      meta: `最終更新 ${updated}`,
    },
    {
      href: `${basePath}/topics`,
      title: "トピックス",
      icon: "topics" as const,
      status: `${store.topics.length}件登録`,
      detail: store.topics[0]?.title ?? "お知らせを追加しましょう",
      meta: `最終更新 ${updated}`,
    },
    {
      href: `${basePath}/photos`,
      title: "写真管理",
      icon: "photos" as const,
      status: `${photoStats.current}枚登録（推奨${PHOTO_RECOMMENDED_TOTAL}枚）`,
      detail:
        photoStats.remaining > 0
          ? `あと${photoStats.remaining}枚で充実度UP`
          : "推奨枚数に達しています",
      meta: `最終更新 ${updated}`,
    },
    {
      href: `${basePath}/menu`,
      title: "メニュー管理",
      icon: "menu" as const,
      status: `${store.menu.length}件登録`,
      detail: `人気メニュー：${popularMenu}`,
      meta: `最終更新 ${updated}`,
    },
    {
      href: `${basePath}/billing`,
      title: "契約・請求",
      icon: "billing" as const,
      status: `月額 ${formatCurrency(subscription.monthlyFee)}`,
      detail: `次回請求 ${formatDate(subscription.nextBillingDate)}`,
      meta: `${subscription.planName}プラン`,
    },
  ];

  return (
    <>
      <PageHeader title="ダッシュボード" description={`${store.name} の店舗管理`} />

      <OnboardingChecklist items={checklist} progress={progress} />

      <div className="admin-card mb-5">
        <div className="admin-overview-grid admin-overview-grid--4">
          <div>
            <p className="text-xs text-[var(--admin-muted)]">店舗名</p>
            <p className="mt-1 text-sm font-medium">{store.name}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--admin-muted)]">テンプレート</p>
            <p className="mt-1 text-sm">{templateTypeLabels[store.templateType]}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--admin-muted)]">契約</p>
            <div className="mt-1">
              <StatusBadge
                label={contractStatusLabels[subscription.contractStatus]}
                variant={contractStatusVariant(subscription.contractStatus)}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--admin-muted)]">公開</p>
            <div className="mt-1">
              <StatusBadge
                label={publishStatusLabels[subscription.publishStatus]}
                variant={publishStatusVariant(subscription.publishStatus)}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[var(--admin-border)] pt-3 text-xs text-[var(--admin-muted)]">
          <span>月額 {formatCurrency(subscription.monthlyFee)}</span>
          <span>次回請求 {formatDate(subscription.nextBillingDate)}</span>
          <StatusBadge
            label={billingStatusLabels[subscription.billingStatus]}
            variant={billingStatusVariant(subscription.billingStatus)}
          />
        </div>
      </div>

      <h2 className="mb-3 text-sm font-medium">管理メニュー</h2>
      <div className="admin-nav-grid">
        {navCards.map((card) => (
          <NavLinkCard key={card.href} {...card} />
        ))}
      </div>
    </>
  );
}
