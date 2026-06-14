import { nueeStore } from "./nuee";
import { shogetsuStore } from "./shogetsu";
import { isPublished } from "@/lib/stores/helpers";
import type { StoreRecord, TemplateType } from "@/types/store";

/** 登録店舗一覧（Supabase移行後はDBクエリに置き換え） */
export const stores: StoreRecord[] = [shogetsuStore, nueeStore];

const storeMap = new Map(stores.map((store) => [store.slug, store]));

/** slugで店舗を取得 */
export function getStoreBySlug(slug: string): StoreRecord | undefined {
  return storeMap.get(slug);
}

/** 公開中の店舗一覧を取得 */
export function getPublishedStores(): StoreRecord[] {
  return stores.filter(isPublished);
}

/** テンプレート種別で店舗を取得 */
export function getStoresByTemplate(
  templateType: TemplateType
): StoreRecord[] {
  return stores.filter((store) => store.templateType === templateType);
}

export { shogetsuStore } from "./shogetsu";
export { nueeStore } from "./nuee";
