import type { CustomerAccount } from "@/types/admin";
import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import { ensureDemoContent } from "@/types/demo-content";

export type DemoSiteRow = {
  id: string;
  store_id: string;
  store_name: string;
  store_slug: string;
  business_type: string;
  source_url: string;
  address: string | null;
  template_id: string;
  template_type: string;
  prospect_name: string;
  contact_person_name: string;
  phone: string;
  email: string;
  sales_status: string;
  sales_memo: string;
  site_contract_status: string;
  publish_status: string;
  customer_id: string | null;
  contract_start_date: string | null;
  minimum_term_end_date: string | null;
  monthly_fee: number | null;
  domain_status: string | null;
  login_email: string | null;
  initial_password: string | null;
  next_billing_date: string | null;
  billing_status: string | null;
  plan_name: string | null;
  payment_method: string | null;
  published_at: string | null;
  is_newly_created: boolean;
  created_at: string;
  last_updated_at: string;
};

export type StoreContentRow = {
  site_id: string;
  content: DemoSiteContent;
  updated_at: string;
};

export type CustomerRow = {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  contact_person_name: string | null;
  auth_user_id: string | null;
  created_at: string;
};

export type DemoSiteWithContentRow = DemoSiteRow & {
  store_content: StoreContentRow | StoreContentRow[] | null;
};

export function demoSiteToRow(site: DemoSite): DemoSiteRow {
  return {
    id: site.id,
    store_id: site.storeId,
    store_name: site.storeName,
    store_slug: site.storeSlug,
    business_type: site.businessType,
    source_url: site.sourceUrl,
    address: site.address ?? null,
    template_id: site.templateId,
    template_type: site.templateType,
    prospect_name: site.prospectName,
    contact_person_name: site.contactPersonName,
    phone: site.phone,
    email: site.email,
    sales_status: site.salesStatus,
    sales_memo: site.salesMemo,
    site_contract_status: site.siteContractStatus,
    publish_status: site.publishStatus,
    customer_id: site.customerId ?? null,
    contract_start_date: site.contractStartDate ?? null,
    minimum_term_end_date: site.minimumTermEndDate ?? null,
    monthly_fee: site.monthlyFee ?? null,
    domain_status: site.domainStatus ?? null,
    login_email: site.loginEmail ?? null,
    initial_password: site.initialPassword ?? null,
    next_billing_date: site.nextBillingDate ?? null,
    billing_status: site.billingStatus ?? null,
    plan_name: site.planName ?? null,
    payment_method: site.paymentMethod ?? null,
    published_at: site.publishedAt ?? null,
    is_newly_created: site.isNewlyCreated ?? false,
    created_at: site.createdAt,
    last_updated_at: site.lastUpdatedAt,
  };
}

export function rowToDemoSite(
  row: DemoSiteRow,
  content?: DemoSiteContent | null
): DemoSite {
  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.store_name,
    storeSlug: row.store_slug,
    businessType: row.business_type as DemoSite["businessType"],
    sourceUrl: row.source_url,
    address: row.address ?? undefined,
    templateId: row.template_id as DemoSite["templateId"],
    templateType: row.template_type as DemoSite["templateType"],
    prospectName: row.prospect_name,
    contactPersonName: row.contact_person_name,
    phone: row.phone,
    email: row.email,
    salesStatus: row.sales_status as DemoSite["salesStatus"],
    salesMemo: row.sales_memo,
    siteContractStatus: row.site_contract_status as DemoSite["siteContractStatus"],
    publishStatus: row.publish_status as DemoSite["publishStatus"],
    customerId: row.customer_id ?? undefined,
    contractStartDate: row.contract_start_date ?? undefined,
    minimumTermEndDate: row.minimum_term_end_date ?? undefined,
    monthlyFee: row.monthly_fee ?? undefined,
    domainStatus: (row.domain_status as DemoSite["domainStatus"]) ?? undefined,
    loginEmail: row.login_email ?? undefined,
    initialPassword: row.initial_password ?? undefined,
    nextBillingDate: row.next_billing_date ?? undefined,
    billingStatus: (row.billing_status as DemoSite["billingStatus"]) ?? undefined,
    planName: row.plan_name ?? undefined,
    paymentMethod: (row.payment_method as DemoSite["paymentMethod"]) ?? undefined,
    publishedAt: row.published_at ?? undefined,
    isNewlyCreated: row.is_newly_created,
    createdAt: row.created_at,
    lastUpdatedAt: row.last_updated_at,
    content: content ? ensureDemoContent(content) : undefined,
  };
}

export function customerToRow(customer: CustomerAccount): Omit<CustomerRow, "auth_user_id"> {
  return {
    id: customer.id,
    name: customer.name,
    contact_email: customer.contactEmail,
    contact_phone: customer.contactPhone,
    contact_person_name: customer.contactPersonName ?? null,
    created_at: customer.createdAt,
  };
}

export function rowToCustomer(row: CustomerRow): CustomerAccount {
  return {
    id: row.id,
    name: row.name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactPersonName: row.contact_person_name ?? undefined,
    createdAt: row.created_at,
  };
}

export function extractContentFromRow(row: DemoSiteWithContentRow): DemoSiteContent | undefined {
  const sc = row.store_content;
  if (!sc) return undefined;
  const contentRow = Array.isArray(sc) ? sc[0] : sc;
  return contentRow?.content ? ensureDemoContent(contentRow.content) : undefined;
}

export function mergeContentPatch(
  current: DemoSiteContent,
  patch: Partial<DemoSiteContent>
): DemoSiteContent {
  return {
    ...current,
    ...patch,
    basicInfo: patch.basicInfo
      ? { ...current.basicInfo, ...patch.basicInfo }
      : current.basicInfo,
    photos: patch.photos ? { ...current.photos, ...patch.photos } : current.photos,
    importedPhotos: patch.importedPhotos ?? current.importedPhotos,
  };
}
