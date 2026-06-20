import type { ContractTemplateId } from "@/types/demo";

/** 店舗基本情報（編集可能） */
export type DemoBasicInfo = {
  nameEn: string;
  catchCopy: string;
  subCopy: string;
  subCopyLines: string[];
  concept: string;
  address: string;
  phone: string;
  businessHours: string;
  weekdayHours: string;
  weekendHours: string;
  closedDays: string;
  access: string;
  mapEmbedUrl: string;
  instagramUrl: string;
  reservationUrl: string;
};

export type DemoGalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  sortOrder: number;
};

/** 写真スロット */
export type DemoPhotos = {
  hero: string;
  interior: string;
  food: string;
  exterior: string;
  gallery: DemoGalleryPhoto[];
};

/** メニュー項目 */
export type DemoMenuItem = {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  visible: boolean;
  sortOrder: number;
};

/** トピックス */
export type DemoTopicItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  visible: boolean;
};

/** 営業管理（編集可能） */
export type DemoSalesInfo = {
  prospectName: string;
  contactPersonName: string;
  phone: string;
  email: string;
  salesStatus: import("@/types/demo").SalesStatus;
  salesMemo: string;
};

/** デモサイト編集コンテンツ（Supabase: demo_site_content JSONB 想定） */
export type DemoSiteContent = {
  basicInfo: DemoBasicInfo;
  photos: DemoPhotos;
  menus: DemoMenuItem[];
  topics: DemoTopicItem[];
};

/** サンプル表示フラグ（どの項目がサンプルか） */
export type DemoSampleFlags = {
  basicInfo: Partial<Record<keyof DemoBasicInfo, boolean>>;
  photos: Partial<Record<"hero" | "interior" | "food" | "exterior" | "gallery", boolean>>;
  menuItemIds: string[];
  topicIds: string[];
};

export type ResolvedDemoDisplay = {
  sampleFlags: DemoSampleFlags;
  templateId: ContractTemplateId;
};

export function createEmptyDemoContent(): DemoSiteContent {
  return {
    basicInfo: {
      nameEn: "",
      catchCopy: "",
      subCopy: "",
      subCopyLines: [],
      concept: "",
      address: "",
      phone: "",
      businessHours: "",
      weekdayHours: "",
      weekendHours: "",
      closedDays: "",
      access: "",
      mapEmbedUrl: "",
      instagramUrl: "",
      reservationUrl: "",
    },
    photos: {
      hero: "",
      interior: "",
      food: "",
      exterior: "",
      gallery: [],
    },
    menus: [],
    topics: [],
  };
}

export function ensureDemoContent(content?: DemoSiteContent): DemoSiteContent {
  const empty = createEmptyDemoContent();
  if (!content) return empty;
  return {
    basicInfo: { ...empty.basicInfo, ...content.basicInfo },
    photos: {
      ...empty.photos,
      ...content.photos,
      gallery: content.photos?.gallery ?? [],
    },
    menus: content.menus ?? [],
    topics: content.topics ?? [],
  };
}
