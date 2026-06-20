import type { BusinessType } from "@/types/demo";

/** デモ作成用URL入力（運営側のみ） */
export type DemoUrlImportInput = {
  tabelogUrl: string;
  instagramUrl: string;
  officialUrl?: string;
};

export type DemoImportedPhoto = {
  id: string;
  url: string;
  alt: string;
  source: "tabelog" | "instagram" | "official" | "upload";
};

export type DemoImportedMenu = {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
};

export type DemoPhotoStats = {
  tabelog: number;
  instagram: number;
  official: number;
  total: number;
};

/** URL取得結果（スクレイピング / HTML解析 / JSON-LD） */
export type DemoUrlImportResult = {
  storeName: string;
  genre: string;
  businessType: BusinessType;
  address: string;
  phone: string;
  businessHours: string;
  closedDays: string;
  instagramUrl: string;
  officialUrl: string;
  menus: DemoImportedMenu[];
  photos: DemoImportedPhoto[];
  photoStats: DemoPhotoStats;
  /** 実際に取得できたフィールド名 */
  extractedFields: string[];
  sourceUrls: DemoUrlImportInput;
  /** 取得元ごとのメモ（デバッグ・営業向け） */
  fetchNotes: string[];
};

export type PhotoSlotKey = "hero" | "exterior" | "interior" | "food" | "gallery";

export type DemoPhotoAssignment = {
  hero: string | null;
  exterior: string | null;
  interior: string | null;
  food: string | null;
  /** ギャラリーに割り当てる photo id の配列 */
  gallery: string[];
};

export const PHOTO_SLOT_LABELS: Record<Exclude<PhotoSlotKey, "gallery">, string> = {
  hero: "ファーストビュー",
  exterior: "外観",
  interior: "店内",
  food: "料理",
};

export function emptyPhotoAssignment(): DemoPhotoAssignment {
  return {
    hero: null,
    exterior: null,
    interior: null,
    food: null,
    gallery: [],
  };
}

/** 将来AIプロバイダへ差し替え可能なインターフェース */
export type DemoImportProvider = {
  importFromUrls(input: DemoUrlImportInput): Promise<DemoUrlImportResult>;
};
