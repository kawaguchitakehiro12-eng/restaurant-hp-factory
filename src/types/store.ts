/** テンプレート種別（Supabase: stores.template_type） */
export type TemplateType = "luxury-izakaya" | "cafe";

/** 公開状態（Supabase: stores.publish_status） */
export type PublishStatus = "draft" | "published" | "archived";

/** 写真の用途（Supabase: photos.role） */
export type StorePhotoRole =
  | "hero"
  | "about"
  | "concept"
  | "interior"
  | "food"
  | "exterior"
  | "gallery"
  | "commitment";

/** メニュー（Supabase: menu_items） */
export type StoreMenuItem = {
  id: string;
  sortOrder: number;
  name: string;
  nameEn?: string;
  price: string;
  description?: string;
  imageUrl: string;
  badge?: string;
};

/** コース（Supabase: courses） */
export type StoreCourseItem = {
  id: string;
  sortOrder: number;
  name: string;
  price: string;
  note: string;
  isFeatured?: boolean;
};

/** 写真（Supabase: photos） */
export type StorePhoto = {
  id: string;
  sortOrder: number;
  url: string;
  alt: string;
  caption?: string;
  role: StorePhotoRole;
};

/** トピックス（Supabase: topics） */
export type StoreTopic = {
  id: string;
  sortOrder: number;
  date: string;
  category?: string;
  title: string;
};

/** 営業時間（Supabase: stores.business_hours JSONB） */
export type StoreBusinessHours = {
  weekday?: string;
  weekend?: string;
  dinner?: string;
  lunch?: string;
};

/** 和風テンプレ固有データ（Supabase: stores.template_extensions JSONB） */
export type LuxuryIzakayaExtensions = {
  templateType: "luxury-izakaya";
  exclusivity: string;
  seats: string;
  story: string[];
  useCases: {
    label: string;
    title: string;
    description: string;
  }[];
  commitments: {
    number: string;
    title: string;
    description: string;
    photoId: string;
  }[];
};

/** Cafeテンプレ固有データ（Supabase: stores.template_extensions JSONB） */
export type CafeExtensions = {
  templateType: "cafe";
  conceptPoints: string[];
  interior: {
    title: string;
    description: string;
    features: string[];
    photoId: string;
  };
};

export type StoreTemplateExtensions = LuxuryIzakayaExtensions | CafeExtensions;

/**
 * 店舗マスタ（Supabase移行時は stores + 関連テーブルに分割）
 */
export type StoreRecord = {
  id: string;
  slug: string;
  templateType: TemplateType;
  publishStatus: PublishStatus;

  name: string;
  nameEn: string;
  location: string;
  catchCopy: string;
  /** サブコピー（Cafe: 英字1行 / 和風: 縦書き配列） */
  subCopy: string | string[];
  concept: string;

  address: string;
  phone: string;
  access: string;
  mapEmbedUrl: string;
  instagramUrl: string | null;
  instagramHandle: string | null;
  reservationUrl: string;

  businessHours: StoreBusinessHours;
  closedDays: string;

  menu: StoreMenuItem[];
  courses: StoreCourseItem[];
  photos: StorePhoto[];
  topics: StoreTopic[];

  templateExtensions: StoreTemplateExtensions;
};
