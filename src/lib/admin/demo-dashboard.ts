import type { StoreSubscription } from "@/types/admin";
import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import type { HeroImageFit, HeroObjectPosition } from "@/types/hero-display";
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
  heroFit: HeroImageFit;
  heroObjectPosition: HeroObjectPosition;
  savePhotos: (payload: Pick<DemoSiteContent, "photos" | "importedPhotos">) => void;
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
  slug: string,
  savePhotos: DemoCustomerContext["savePhotos"]
): DemoCustomerContext {
  const resolved = resolveDemoStore(demo);
  return {
    demo,
    store: resolved.store,
    subscription: demoSiteToSubscription(demo),
    basePath: `/dashboard/demo/${slug}`,
    heroFit: resolved.heroFit,
    heroObjectPosition: resolved.heroObjectPosition,
    savePhotos,
  };
}
