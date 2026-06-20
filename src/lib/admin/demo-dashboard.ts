import type { StoreSubscription } from "@/types/admin";
import type { DemoSite } from "@/types/demo";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";
import { APP_BASE_URL } from "@/lib/admin/form-utils";
import type { StoreRecord } from "@/types/store";

export function buildDemoDashboardUrl(slug: string): string {
  return `${APP_BASE_URL}/dashboard/demo/${slug}`;
}

/** デモ案件用の顧客ダッシュボード表示コンテキスト */
export type DemoCustomerContext = {
  demo: DemoSite;
  store: StoreRecord;
  subscription: StoreSubscription;
  basePath: string;
};

export function demoSiteToSubscription(demo: DemoSite): StoreSubscription {
  const isContracted = demo.siteContractStatus === "contracted";
  return {
    id: demo.id,
    customerId: demo.customerId ?? demo.id,
    storeId: demo.storeId,
    storeSlug: demo.storeSlug,
    storeName: demo.storeName,
    templateType: demo.templateType,
    contractTemplateId: demo.templateId,
    monthlyFee: demo.monthlyFee ?? 2980,
    contractStartDate: demo.contractStartDate ?? demo.createdAt,
    minimumTermEndDate: demo.minimumTermEndDate ?? demo.createdAt,
    nextBillingDate: demo.nextBillingDate ?? demo.createdAt,
    contractStatus: isContracted ? "active" : "pending",
    billingStatus: demo.billingStatus ?? "pending",
    publishStatus: demo.publishStatus,
    planName: demo.planName ?? "スタンダード",
    paymentMethod: demo.paymentMethod ?? "invoice",
    cancellationNoticeStatus: "none",
    noticeEmailVerified: false,
    lastUpdatedAt: demo.lastUpdatedAt,
    suspensionScheduled: false,
  };
}

export function buildDemoCustomerContext(
  demo: DemoSite,
  slug: string
): DemoCustomerContext {
  const { store } = resolveDemoStore(demo);
  return {
    demo,
    store,
    subscription: demoSiteToSubscription(demo),
    basePath: `/dashboard/demo/${slug}`,
  };
}
