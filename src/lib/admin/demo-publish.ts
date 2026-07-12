import type { CustomerAccount } from "@/types/admin";
import {
  DEFAULT_MONTHLY_FEE,
  getDomainStatusLabel,
  MINIMUM_TERM_MONTHS,
} from "@/lib/admin/contract-templates";
import {
  addMonths,
  generateId,
  generateTempPassword,
  normalizeSlug,
  todayIso,
} from "@/lib/admin/form-utils";
import {
  buildAdminUrl,
  buildContractInvitationText,
  buildDemoUrl,
} from "@/lib/admin/demo-create";
import type { DemoSite, PublishSiteForm, PublishSiteResult } from "@/types/demo";

export class PublishSiteError extends Error {
  constructor(
    message: string,
    public field?: keyof PublishSiteForm | "storeSlug"
  ) {
    super(message);
    this.name = "PublishSiteError";
  }
}

export function publishDemoSite(
  demoSite: DemoSite,
  form: PublishSiteForm
): {
  demoSite: DemoSite;
  customer: CustomerAccount;
  result: PublishSiteResult;
} {
  const today = todayIso();
  const slug = normalizeSlug(form.storeSlug);
  if (!slug) {
    throw new PublishSiteError("公開URL（スラッグ）を入力してください", "storeSlug");
  }

  const customerId = demoSite.customerId ?? generateId("cust");
  const minimumTermEndDate = addMonths(form.contractStartDate, MINIMUM_TERM_MONTHS);
  const password = form.initialPassword.trim() || generateTempPassword();
  const loginEmail = form.loginEmail.trim();
  const publicUrl = buildDemoUrl(slug);
  const dashboardUrl = buildAdminUrl(slug);

  const customer: CustomerAccount = {
    id: customerId,
    name: demoSite.prospectName,
    contactEmail: loginEmail,
    contactPhone: demoSite.phone,
    contactPersonName: demoSite.contactPersonName,
    createdAt: demoSite.customerId ? demoSite.createdAt : today,
  };

  const updatedDemoSite: DemoSite = {
    ...demoSite,
    storeSlug: slug,
    customerId,
    siteContractStatus: "contracted",
    salesStatus: "contracted",
    publishStatus: "published",
    publishedAt: today,
    contractStartDate: form.contractStartDate,
    minimumTermEndDate,
    monthlyFee: form.monthlyFee ?? DEFAULT_MONTHLY_FEE,
    domainStatus: form.domainStatus,
    loginEmail,
    initialPassword: password,
    nextBillingDate: addMonths(form.contractStartDate, 1),
    billingStatus: "pending",
    planName: "スタンダード",
    paymentMethod: "invoice",
    lastUpdatedAt: today,
    isNewlyCreated: false,
  };

  const result: PublishSiteResult = {
    demoSiteId: demoSite.id,
    storeName: demoSite.storeName,
    storeSlug: slug,
    publicUrl,
    dashboardUrl,
    loginEmail,
    initialPassword: password,
    contractStartDate: form.contractStartDate,
    minimumTermEndDate,
    domainStatusLabel: getDomainStatusLabel(form.domainStatus),
    invitationText: buildContractInvitationText({
      dashboardUrl,
      loginEmail,
      initialPassword: password,
    }),
    publishedAt: today,
  };

  return { demoSite: updatedDemoSite, customer, result };
}
