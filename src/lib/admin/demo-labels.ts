import type {
  BusinessType,
  DemoSite,
  DemoSiteFormInput,
  SalesStatus,
  SiteContractStatus,
} from "@/types/demo";
import type { ContractTemplateId } from "@/types/demo";

export const BUSINESS_TYPE_OPTIONS: { id: BusinessType; label: string }[] = [
  { id: "japanese", label: "和食" },
  { id: "izakaya", label: "居酒屋" },
  { id: "cafe", label: "カフェ" },
  { id: "bar", label: "バー" },
  { id: "italian", label: "イタリアン" },
  { id: "other", label: "その他" },
];

export const SALES_STATUS_OPTIONS: { id: SalesStatus; label: string }[] = [
  { id: "not_approached", label: "未アプローチ" },
  { id: "proposal_scheduled", label: "提案予定" },
  { id: "proposed", label: "提案済み" },
  { id: "considering", label: "検討中" },
  { id: "contracted", label: "契約済み" },
  { id: "lost", label: "失注" },
];

export const SITE_CONTRACT_STATUS_LABELS: Record<SiteContractStatus, string> = {
  demo: "デモ",
  contracted: "契約済み",
  lost: "失注",
  suspended: "停止",
};

export const salesStatusLabels: Record<SalesStatus, string> = {
  not_approached: "未アプローチ",
  proposal_scheduled: "提案予定",
  proposed: "提案済み",
  considering: "検討中",
  contracted: "契約済み",
  lost: "失注",
};

export function getBusinessTypeLabel(type: BusinessType): string {
  return BUSINESS_TYPE_OPTIONS.find((b) => b.id === type)?.label ?? type;
}

export function getSalesStatusLabel(status: SalesStatus): string {
  return salesStatusLabels[status];
}

export function salesStatusVariant(
  status: SalesStatus
): "gray" | "blue" | "yellow" | "green" | "red" | "orange" {
  switch (status) {
    case "not_approached":
      return "gray";
    case "proposal_scheduled":
      return "blue";
    case "proposed":
      return "yellow";
    case "considering":
      return "orange";
    case "contracted":
      return "green";
    case "lost":
      return "red";
    default:
      return "gray";
  }
}

export function siteContractStatusVariant(
  status: SiteContractStatus
): "gray" | "blue" | "yellow" | "green" | "red" | "orange" {
  switch (status) {
    case "demo":
      return "blue";
    case "contracted":
      return "green";
    case "lost":
      return "red";
    case "suspended":
      return "gray";
    default:
      return "gray";
  }
}

export function inferTemplateId(templateType: DemoSite["templateType"]): ContractTemplateId {
  if (templateType === "cafe") return "cafe";
  return "luxury-japanese";
}
