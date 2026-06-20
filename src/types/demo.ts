import type { DomainStatus } from "@/types/contract";
import type { AdminPublishStatus, BillingStatus, PaymentMethod } from "@/types/admin";
import type { DemoSiteContent } from "@/types/demo-content";
import type { TemplateType } from "@/types/store";

/** テンプレート選択ID（5種） */
export type ContractTemplateId =
  | "luxury-japanese"
  | "cafe"
  | "bar"
  | "bal"
  | "izakaya-casual";

/** 営業ステータス */
export type SalesStatus =
  | "not_approached"
  | "proposal_scheduled"
  | "proposed"
  | "considering"
  | "contracted"
  | "lost";

/** 契約状態（デモ・契約管理） */
export type SiteContractStatus = "demo" | "contracted" | "lost" | "suspended";

export type BusinessType =
  | "japanese"
  | "izakaya"
  | "cafe"
  | "bar"
  | "italian"
  | "other";

/** デモサイト作成フォーム（Supabase 保存用に平坦化） */
export type DemoSiteFormInput = {
  storeName: string;
  storeSlug: string;
  businessType: BusinessType;
  sourceUrl: string;
  address: string;
  templateId: ContractTemplateId;
  prospectName: string;
  contactPersonName: string;
  phone: string;
  email: string;
  salesStatus: SalesStatus;
  salesMemo: string;
  /** AI下書きなどから反映された公開コンテンツ（任意） */
  content?: DemoSiteContent;
};

/** 契約切り替えフォーム */
export type ConvertToContractForm = {
  contractStartDate: string;
  monthlyFee: number;
  loginEmail: string;
  initialPassword: string;
  domainStatus: DomainStatus;
};

/** デモサイトエンティティ */
export type DemoSite = {
  id: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  businessType: BusinessType;
  sourceUrl: string;
  address?: string;
  templateId: ContractTemplateId;
  templateType: TemplateType;
  prospectName: string;
  contactPersonName: string;
  phone: string;
  email: string;
  salesStatus: SalesStatus;
  salesMemo: string;
  siteContractStatus: SiteContractStatus;
  publishStatus: AdminPublishStatus;
  createdAt: string;
  lastUpdatedAt: string;
  isNewlyCreated?: boolean;
  customerId?: string;
  contractStartDate?: string;
  minimumTermEndDate?: string;
  monthlyFee?: number;
  domainStatus?: DomainStatus;
  loginEmail?: string;
  initialPassword?: string;
  nextBillingDate?: string;
  billingStatus?: BillingStatus;
  planName?: string;
  paymentMethod?: PaymentMethod;
  /** 公開サイト表示用コンテンツ */
  content?: DemoSiteContent;
};

export type CreateDemoSiteResult = {
  demoSiteId: string;
  storeName: string;
  storeSlug: string;
  templateLabel: string;
  salesStatusLabel: string;
  demoUrl: string;
  adminUrl: string;
  createdAt: string;
  customerProposalText: string;
  salesUrlText: string;
};

export type ConvertToContractResult = {
  demoSiteId: string;
  storeName: string;
  demoUrl: string;
  dashboardUrl: string;
  loginEmail: string;
  initialPassword: string;
  contractStartDate: string;
  minimumTermEndDate: string;
  domainStatusLabel: string;
  invitationText: string;
};
