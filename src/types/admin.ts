import type { TemplateType } from "@/types/store";

export type ContractStatus = "active" | "pending" | "expired" | "cancelled";
export type BillingStatus = "paid" | "unpaid" | "overdue" | "pending";
export type AdminPublishStatus = "published" | "draft" | "suspended";
export type CancellationNoticeStatus = "none" | "scheduled" | "notified";
export type PaymentMethod = "card" | "invoice";

export type CustomerAccount = {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
};

export type StoreSubscription = {
  id: string;
  customerId: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  templateType: TemplateType;
  monthlyFee: number;
  contractStartDate: string;
  minimumTermEndDate: string;
  nextBillingDate: string;
  contractStatus: ContractStatus;
  billingStatus: BillingStatus;
  publishStatus: AdminPublishStatus;
  planName: string;
  paymentMethod: PaymentMethod;
  cancellationNoticeStatus: CancellationNoticeStatus;
  cancellationNoticeScheduledDate?: string;
  noticeEmailVerified: boolean;
  lastUpdatedAt: string;
  suspensionScheduled: boolean;
};

export type StoreSectionUpdates = {
  settings: string;
  topics: string;
  photos: string;
  menu: string;
};

export type AdminDashboardStats = {
  totalCustomers: number;
  totalStores: number;
  activeContracts: number;
  monthlyRevenue: number;
  monthlyIncomingExpected: number;
  unpaidCount: number;
  publishedCount: number;
  suspendedCount: number;
  cancellationNoticeCount: number;
  minTermEndingWithin30Days: number;
  suspensionScheduledCount: number;
};
