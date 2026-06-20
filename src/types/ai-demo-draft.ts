import type { BusinessType } from "@/types/demo";

/** AI下書き生成の入力（運営側デモ作成のみ） */
export type AiDemoDraftInput = {
  tabelogUrl: string;
  instagramUrl: string;
  officialUrl?: string;
};

/** 写真のAI分類カテゴリ */
export type AiPhotoClassification =
  | "hero"
  | "interior"
  | "food"
  | "exterior"
  | "gallery";

export type AiClassifiedPhoto = {
  url: string;
  alt: string;
  classification: AiPhotoClassification;
  source: "tabelog" | "instagram" | "official";
};

export type AiMenuDraft = {
  name: string;
  /** 取得できない場合は空文字（推測で埋めない） */
  price: string;
  description: string;
  imageUrl: string;
};

/** AIが生成したデモ下書き（モック / 将来APIレスポンス） */
export type AiDemoDraft = {
  storeName: string;
  businessType: BusinessType;
  address: string;
  phone: string;
  businessHours: string;
  closedDays: string;
  mapEmbedUrl: string;
  instagramUrl: string;
  officialUrl: string;

  catchCopy: string;
  subCopy: string;
  subCopyLines: string[];
  concept: string;

  menus: AiMenuDraft[];
  classifiedPhotos: AiClassifiedPhoto[];

  photos: {
    hero: string;
    interior: string;
    food: string;
    exterior: string;
    gallery: { url: string; alt: string }[];
  };

  /** 実データとして取得できたフィールド名（推測生成は含まない） */
  extractedFields: string[];
  /** 文章系でAIが生成したフィールド名 */
  generatedCopyFields: string[];

  sourceUrls: AiDemoDraftInput;
};

export const AI_PHOTO_CLASSIFICATION_LABELS: Record<AiPhotoClassification, string> = {
  hero: "ファーストビュー",
  interior: "店内",
  food: "料理",
  exterior: "外観",
  gallery: "ギャラリー",
};

export const AI_EXTRACTED_FIELD_LABELS: Record<string, string> = {
  storeName: "店舗名",
  businessType: "業態",
  address: "住所",
  phone: "電話番号",
  businessHours: "営業時間",
  closedDays: "定休日",
  mapEmbedUrl: "Google Map URL",
  instagramUrl: "Instagram URL",
  officialUrl: "公式サイトURL",
  catchCopy: "キャッチコピー",
  subCopy: "サブコピー",
  concept: "コンセプト",
  menus: "メニュー",
  photos: "写真",
};
