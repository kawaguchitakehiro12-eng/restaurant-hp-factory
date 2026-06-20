import type { CustomerAccount } from "@/types/admin";
import type { DomainStatus } from "@/types/contract";
import type {
  ConvertToContractForm,
  ConvertToContractResult,
  CreateDemoSiteResult,
  DemoSite,
  DemoSiteFormInput,
} from "@/types/demo";
import {
  DEFAULT_MONTHLY_FEE,
  getDomainStatusLabel,
  getTemplateLabel,
  getTemplateType,
  MINIMUM_TERM_MONTHS,
} from "@/lib/admin/contract-templates";
import { getSalesStatusLabel } from "@/lib/admin/demo-labels";
import { createEmptyDemoContent, ensureDemoContent } from "@/types/demo-content";
import {
  addMonths,
  APP_BASE_URL,
  generateId,
  generateTempPassword,
  normalizeSlug,
  todayIso,
} from "@/lib/admin/form-utils";
import { buildDemoDashboardUrl } from "@/lib/admin/demo-dashboard";
import { getStoreSitePath } from "@/lib/admin/helpers";

export function buildDemoUrl(slug: string): string {
  return `${APP_BASE_URL}${getStoreSitePath(slug)}`;
}

export function buildAdminUrl(slug: string): string {
  return buildDemoDashboardUrl(slug);
}

export function buildCustomerProposalText(params: {
  contactPersonName: string;
  demoUrl: string;
}): string {
  const name = params.contactPersonName.trim() || "ご担当者";
  return `${name}様

お世話になっております。
SAKUPAGEにて、貴店向けのホームページデモを作成いたしました。

下記URLよりご確認いただけます。

デモサイトURL：
${params.demoUrl}

実際の掲載写真やメニュー内容は、ご契約後に管理画面より自由に編集可能です。

初期費用なし、月額2,980円にてご利用いただけます。

ぜひ一度ご確認ください。`;
}

export function buildSalesUrlText(demoUrl: string): string {
  return demoUrl;
}

export function buildContractInvitationText(params: {
  dashboardUrl: string;
  loginEmail: string;
  initialPassword: string;
}): string {
  return `SAKUPAGEの管理画面をご用意いたしました。

下記よりログインいただき、店舗情報・写真・メニューの編集をお願いいたします。

管理画面URL：
${params.dashboardUrl}

ログインメール：
${params.loginEmail}

初期パスワード：
${params.initialPassword}`;
}

export function createDemoSiteFromForm(input: DemoSiteFormInput): {
  demoSite: DemoSite;
  result: CreateDemoSiteResult;
} {
  const today = todayIso();
  const id = generateId("demo");
  const storeId = generateId("store");
  const demoUrl = buildDemoUrl(input.storeSlug);
  const adminUrl = buildAdminUrl(input.storeSlug);

  const demoSite: DemoSite = {
    id,
    storeId,
    storeName: input.storeName.trim(),
    storeSlug: normalizeSlug(input.storeSlug),
    businessType: input.businessType,
    sourceUrl: input.sourceUrl.trim(),
    address: input.address.trim() || undefined,
    templateId: input.templateId,
    templateType: getTemplateType(input.templateId),
    prospectName: input.prospectName.trim(),
    contactPersonName: input.contactPersonName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    salesStatus: input.salesStatus,
    salesMemo: input.salesMemo.trim(),
    siteContractStatus: "demo",
    publishStatus: "published",
    createdAt: today,
    lastUpdatedAt: today,
    isNewlyCreated: true,
    content: input.content ? ensureDemoContent(input.content) : createEmptyDemoContent(),
  };

  const result: CreateDemoSiteResult = {
    demoSiteId: id,
    storeName: demoSite.storeName,
    storeSlug: demoSite.storeSlug,
    templateLabel: getTemplateLabel(input.templateId),
    salesStatusLabel: getSalesStatusLabel(input.salesStatus),
    demoUrl,
    adminUrl,
    createdAt: today,
    customerProposalText: buildCustomerProposalText({
      contactPersonName: input.contactPersonName,
      demoUrl,
    }),
    salesUrlText: buildSalesUrlText(demoUrl),
  };

  return { demoSite, result };
}

export function convertDemoToContract(
  demoSite: DemoSite,
  form: ConvertToContractForm
): {
  demoSite: DemoSite;
  customer: CustomerAccount;
  result: ConvertToContractResult;
} {
  const today = todayIso();
  const customerId = demoSite.customerId ?? generateId("cust");
  const minimumTermEndDate = addMonths(form.contractStartDate, MINIMUM_TERM_MONTHS);
  const password = form.initialPassword.trim() || generateTempPassword();
  const dashboardUrl = buildAdminUrl(demoSite.storeSlug);
  const demoUrl = buildDemoUrl(demoSite.storeSlug);

  const customer: CustomerAccount = {
    id: customerId,
    name: demoSite.prospectName,
    contactEmail: form.loginEmail.trim(),
    contactPhone: demoSite.phone,
    contactPersonName: demoSite.contactPersonName,
    createdAt: demoSite.createdAt,
  };

  const updatedDemoSite: DemoSite = {
    ...demoSite,
    customerId,
    siteContractStatus: "contracted",
    salesStatus: "contracted",
    contractStartDate: form.contractStartDate,
    minimumTermEndDate,
    monthlyFee: form.monthlyFee,
    domainStatus: form.domainStatus,
    loginEmail: form.loginEmail.trim(),
    initialPassword: password,
    nextBillingDate: addMonths(form.contractStartDate, 1),
    billingStatus: "pending",
    planName: "スタンダード",
    paymentMethod: "invoice",
    lastUpdatedAt: today,
    isNewlyCreated: false,
  };

  const result: ConvertToContractResult = {
    demoSiteId: demoSite.id,
    storeName: demoSite.storeName,
    demoUrl,
    dashboardUrl,
    loginEmail: form.loginEmail.trim(),
    initialPassword: password,
    contractStartDate: form.contractStartDate,
    minimumTermEndDate,
    domainStatusLabel: getDomainStatusLabel(form.domainStatus),
    invitationText: buildContractInvitationText({
      dashboardUrl,
      loginEmail: form.loginEmail.trim(),
      initialPassword: password,
    }),
  };

  return { demoSite: updatedDemoSite, customer, result };
}

export function markDemoAsLost(demoSite: DemoSite): DemoSite {
  return {
    ...demoSite,
    siteContractStatus: "lost",
    salesStatus: "lost",
    lastUpdatedAt: todayIso(),
  };
}

export function computeDemoDashboardStats(demoSites: DemoSite[]) {
  const contracted = demoSites.filter((d) => d.siteContractStatus === "contracted");
  const monthlyRevenue = contracted.reduce((sum, d) => sum + (d.monthlyFee ?? 0), 0);
  const demos = demoSites.filter((d) => d.siteContractStatus === "demo");

  return {
    totalDemoSites: demoSites.length,
    activeDemos: demos.length,
    contractedCount: contracted.length,
    lostCount: demoSites.filter((d) => d.siteContractStatus === "lost").length,
    proposalPipeline: demoSites.filter((d) =>
      ["proposal_scheduled", "proposed", "considering"].includes(d.salesStatus)
    ).length,
    monthlyRevenue,
    publishedCount: demoSites.filter((d) => d.publishStatus === "published").length,
    createdThisMonth: demoSites.filter((d) => d.createdAt.startsWith(todayIso().slice(0, 7)))
      .length,
  };
}

export { normalizeSlug, addMonths, isValidEmail, isValidSlug } from "@/lib/admin/form-utils";
