import type {
  AdminDashboardStats,
  CustomerAccount,
  StoreSectionUpdates,
  StoreSubscription,
} from "@/types/admin";

export const customers: CustomerAccount[] = [
  {
    id: "cust-001",
    name: "山田商事株式会社",
    contactEmail: "yamada@example.com",
    contactPhone: "03-1111-2222",
    createdAt: "2025-10-01",
  },
  {
    id: "cust-002",
    name: "株式会社LILAC",
    contactEmail: "info@lilac-cafe.example.com",
    contactPhone: "03-3333-4444",
    createdAt: "2026-01-15",
  },
  {
    id: "cust-003",
    name: "鈴木レストランズ",
    contactEmail: "suzuki@example.com",
    contactPhone: "03-5555-6666",
    createdAt: "2026-03-01",
  },
];

export const storeSubscriptions: StoreSubscription[] = [
  {
    id: "sub-001",
    customerId: "cust-001",
    storeId: "a1b2c3d4-0001-4000-8000-000000000001",
    storeSlug: "shogetsu",
    storeName: "宵月",
    templateType: "luxury-izakaya",
    monthlyFee: 29800,
    contractStartDate: "2025-10-15",
    minimumTermEndDate: "2026-10-14",
    nextBillingDate: "2026-07-01",
    contractStatus: "active",
    billingStatus: "paid",
    publishStatus: "published",
    planName: "スタンダード",
    paymentMethod: "card",
    cancellationNoticeStatus: "none",
    noticeEmailVerified: true,
    lastUpdatedAt: "2026-06-10",
    suspensionScheduled: false,
  },
  {
    id: "sub-002",
    customerId: "cust-002",
    storeId: "b2c3d4e5-0002-4000-8000-000000000002",
    storeSlug: "nuee",
    storeName: "nuée",
    templateType: "cafe",
    monthlyFee: 19800,
    contractStartDate: "2026-02-01",
    minimumTermEndDate: "2027-01-31",
    nextBillingDate: "2026-07-01",
    contractStatus: "active",
    billingStatus: "paid",
    publishStatus: "published",
    planName: "ライト",
    paymentMethod: "card",
    cancellationNoticeStatus: "none",
    noticeEmailVerified: true,
    lastUpdatedAt: "2026-06-08",
    suspensionScheduled: false,
  },
  {
    id: "sub-003",
    customerId: "cust-003",
    storeId: "pending-store-001",
    storeSlug: "hanami",
    storeName: "花見（準備中）",
    templateType: "luxury-izakaya",
    monthlyFee: 29800,
    contractStartDate: "2026-04-01",
    minimumTermEndDate: "2027-03-31",
    nextBillingDate: "2026-07-01",
    contractStatus: "pending",
    billingStatus: "pending",
    publishStatus: "draft",
    planName: "スタンダード",
    paymentMethod: "invoice",
    cancellationNoticeStatus: "scheduled",
    cancellationNoticeScheduledDate: "2026-09-14",
    noticeEmailVerified: false,
    lastUpdatedAt: "2026-05-20",
    suspensionScheduled: false,
  },
];

/** セクション別の最終更新日（静的モック） */
export const storeSectionUpdates: Record<string, StoreSectionUpdates> = {
  "sub-001": {
    settings: "2026-06-10",
    topics: "2026-05-28",
    photos: "2026-06-02",
    menu: "2026-04-15",
  },
  "sub-002": {
    settings: "2026-06-08",
    topics: "2026-06-01",
    photos: "2026-05-30",
    menu: "2026-05-12",
  },
  "sub-003": {
    settings: "2026-05-20",
    topics: "2026-05-01",
    photos: "2026-04-28",
    menu: "2026-04-10",
  },
};

/** 顧客ダッシュボード用：ログイン中顧客（静的モック） */
export const currentCustomerId = "cust-001";

export function getDashboardStats(): AdminDashboardStats {
  const active = storeSubscriptions.filter((s) => s.contractStatus === "active");
  const monthlyRevenue = active.reduce((sum, s) => sum + s.monthlyFee, 0);
  const monthlyIncomingExpected = storeSubscriptions
    .filter(
      (s) =>
        s.contractStatus === "active" ||
        (s.contractStatus === "pending" && s.billingStatus === "pending")
    )
    .reduce((sum, s) => sum + s.monthlyFee, 0);

  return {
    totalCustomers: customers.length,
    totalStores: storeSubscriptions.length,
    activeContracts: active.length,
    monthlyRevenue,
    monthlyIncomingExpected,
    unpaidCount: storeSubscriptions.filter(
      (s) => s.billingStatus === "unpaid" || s.billingStatus === "overdue"
    ).length,
    publishedCount: storeSubscriptions.filter(
      (s) => s.publishStatus === "published"
    ).length,
    suspendedCount: storeSubscriptions.filter(
      (s) => s.publishStatus === "suspended"
    ).length,
    cancellationNoticeCount: storeSubscriptions.filter(
      (s) => s.cancellationNoticeStatus !== "none"
    ).length,
    minTermEndingWithin30Days: storeSubscriptions.filter((s) => {
      const end = new Date(s.minimumTermEndDate);
      const now = new Date();
      const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length,
    suspensionScheduledCount: storeSubscriptions.filter((s) => s.suspensionScheduled)
      .length,
  };
}

export function getCustomerById(id: string): CustomerAccount | undefined {
  return customers.find((c) => c.id === id);
}

export function getSubscriptionByCustomerId(
  customerId: string
): StoreSubscription | undefined {
  return storeSubscriptions.find((s) => s.customerId === customerId);
}

export function getCustomerName(customerId: string): string {
  return getCustomerById(customerId)?.name ?? "—";
}

export function getSectionUpdates(subscriptionId: string): StoreSectionUpdates {
  return (
    storeSectionUpdates[subscriptionId] ?? {
      settings: "—",
      topics: "—",
      photos: "—",
      menu: "—",
    }
  );
}
