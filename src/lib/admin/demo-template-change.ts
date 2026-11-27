import type { DemoSite } from "@/types/demo";
import { CONTRACT_TEMPLATE_OPTIONS } from "./contract-templates";

/** Change presentation only; preserve content, revision and sales/contract state. */
export function changeDemoTemplate(site: DemoSite, templateId: string): DemoSite {
  const option = CONTRACT_TEMPLATE_OPTIONS.find((item) => item.id === templateId);
  if (!option) throw new Error("テンプレートを選択してください。");
  return { ...site, templateId: option.id, templateType: option.templateType };
}
