import type { ContractTemplateId } from "@/types/demo";
import type { DomainStatus } from "@/types/contract";
import type { TemplateType } from "@/types/store";

export const CONTRACT_TEMPLATE_OPTIONS: {
  id: ContractTemplateId;
  label: string;
  templateType: TemplateType;
}[] = [
  { id: "luxury-japanese", label: "高級和風", templateType: "luxury-izakaya" },
  { id: "cafe", label: "Cafe", templateType: "cafe" },
  { id: "bar", label: "Bar", templateType: "luxury-izakaya" },
  { id: "bal", label: "バル", templateType: "luxury-izakaya" },
  { id: "izakaya-casual", label: "大衆居酒屋", templateType: "luxury-izakaya" },
];

export const DOMAIN_STATUS_OPTIONS: { id: DomainStatus; label: string }[] = [
  { id: "unset", label: "未設定" },
  { id: "planned", label: "取得予定" },
  { id: "configured", label: "設定済み" },
];

export const MINIMUM_TERM_MONTHS = 6;
export const DEFAULT_MONTHLY_FEE = 2980;

export function getTemplateLabel(id: ContractTemplateId): string {
  return CONTRACT_TEMPLATE_OPTIONS.find((t) => t.id === id)?.label ?? id;
}

export function getTemplateType(id: ContractTemplateId): TemplateType {
  return (
    CONTRACT_TEMPLATE_OPTIONS.find((t) => t.id === id)?.templateType ?? "luxury-izakaya"
  );
}

export function getDomainStatusLabel(status: DomainStatus): string {
  return DOMAIN_STATUS_OPTIONS.find((d) => d.id === status)?.label ?? status;
}
