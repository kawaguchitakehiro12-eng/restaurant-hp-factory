/**
 * 将来AI実装へ差し替え可能な型エイリアス（後方互換）
 * @deprecated demo-url-import を直接使用してください
 */
export type {
  DemoUrlImportInput as AiDemoDraftInput,
  DemoUrlImportResult as AiDemoDraft,
  DemoImportedMenu as AiMenuDraft,
  DemoImportedPhoto as AiClassifiedPhoto,
} from "@/types/demo-url-import";
