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
  { id: "bar", label: "Bar", templateType: "bar" },
  { id: "bal", label: "バル", templateType: "bal" },
  { id: "izakaya-casual", label: "大衆居酒屋", templateType: "izakaya-casual" },
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

/**
 * バル専用テンプレ追加前に保存されたデモは templateId "bal" / templateType "luxury-izakaya"
 * のままなので、templateId を優先して "bal" に寄せる。
 */
export function normalizeDemoTemplateType(
  templateId: ContractTemplateId | string | undefined,
  templateType: TemplateType
): TemplateType {
  if (templateId === "bal") return "bal";
  return templateType;
}

export function getDomainStatusLabel(status: DomainStatus): string {
  return DOMAIN_STATUS_OPTIONS.find((d) => d.id === status)?.label ?? status;
}
