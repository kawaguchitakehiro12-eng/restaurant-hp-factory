import type { CustomerAccount, StoreSubscription } from "@/types/admin";
import type { DemoSite } from "@/types/demo";
import { inferTemplateId } from "@/lib/admin/demo-labels";
import { customers, storeSubscriptions } from "@/data/admin/mock";

function subscriptionToDemoSite(
  sub: StoreSubscription,
  customer?: CustomerAccount
): DemoSite {
  const isContracted = sub.contractStatus === "active";
  const isLost = sub.contractStatus === "cancelled";
  const isSuspended = sub.publishStatus === "suspended";

  let siteContractStatus: DemoSite["siteContractStatus"] = "demo";
  if (isContracted) siteContractStatus = "contracted";
  else if (isLost) siteContractStatus = "lost";
  else if (isSuspended) siteContractStatus = "suspended";
  else if (sub.contractStatus === "pending") siteContractStatus = "demo";

  let salesStatus: DemoSite["salesStatus"] = "considering";
  if (isContracted) salesStatus = "contracted";
  else if (isLost) salesStatus = "lost";
  else if (sub.id === "sub-003") salesStatus = "proposal_scheduled";

  return {
    id: sub.id,
    storeId: sub.storeId,
    storeName: sub.storeName,
    storeSlug: sub.storeSlug,
    businessType: sub.templateType === "cafe" ? "cafe" : "izakaya",
    sourceUrl: "",
    templateId: inferTemplateId(sub.templateType),
    templateType: sub.templateType,
    prospectName: customer?.name ?? "—",
    contactPersonName: customer?.contactPersonName ?? "",
    phone: customer?.contactPhone ?? "",
    email: customer?.contactEmail ?? "",
    salesStatus,
    salesMemo: "",
    siteContractStatus,
    publishStatus: sub.publishStatus,
    createdAt: customer?.createdAt ?? sub.contractStartDate,
    lastUpdatedAt: sub.lastUpdatedAt,
    customerId: sub.customerId,
    contractStartDate: isContracted || sub.contractStatus === "pending" ? sub.contractStartDate : undefined,
    minimumTermEndDate: sub.minimumTermEndDate,
    monthlyFee: isContracted ? sub.monthlyFee : undefined,
    nextBillingDate: sub.nextBillingDate,
    billingStatus: sub.billingStatus,
    planName: sub.planName,
    paymentMethod: sub.paymentMethod,
  };
}

export const initialDemoSites: DemoSite[] = storeSubscriptions.map((sub) => {
  const customer = customers.find((c) => c.id === sub.customerId);
  return subscriptionToDemoSite(sub, customer);
});

export const initialDemoCustomers: CustomerAccount[] = [...customers];
