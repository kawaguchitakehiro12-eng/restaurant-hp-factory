import type { DemoSiteContent } from "@/types/demo-content";
import { ensureDemoContent } from "@/types/demo-content";

export type PhotoInsert = {
  id: string;
  site_id: string;
  slot: "hero" | "interior" | "food" | "exterior" | "gallery" | "menu";
  url: string;
  storage_path: string | null;
  alt: string;
  caption: string;
  sort_order: number;
  menu_item_id: string | null;
};

/** Sync photos table from DemoSiteContent (mirrors localStorage photo slots). */
export function extractPhotosFromContent(
  siteId: string,
  content: DemoSiteContent
): PhotoInsert[] {
  const normalized = ensureDemoContent(content);
  const photos: PhotoInsert[] = [];

  const slotUrls: Array<{ slot: PhotoInsert["slot"]; url: string }> = [
    { slot: "hero", url: normalized.photos.hero },
    { slot: "interior", url: normalized.photos.interior },
    { slot: "food", url: normalized.photos.food },
    { slot: "exterior", url: normalized.photos.exterior },
  ];

  for (const { slot, url } of slotUrls) {
    if (url) {
      photos.push({
        id: `${siteId}-${slot}`,
        site_id: siteId,
        slot,
        url,
        storage_path: null,
        alt: "",
        caption: "",
        sort_order: 0,
        menu_item_id: null,
      });
    }
  }

  for (const item of normalized.photos.gallery) {
    if (!item.url) continue;
    photos.push({
      id: item.id || `${siteId}-gallery-${item.sortOrder}`,
      site_id: siteId,
      slot: "gallery",
      url: item.url,
      storage_path: null,
      alt: item.alt ?? "",
      caption: item.caption ?? "",
      sort_order: item.sortOrder ?? 0,
      menu_item_id: null,
    });
  }

  for (const menu of normalized.menus) {
    if (!menu.imageUrl) continue;
    photos.push({
      id: `${siteId}-menu-${menu.id}`,
      site_id: siteId,
      slot: "menu",
      url: menu.imageUrl,
      storage_path: null,
      alt: menu.name,
      caption: menu.description ?? "",
      sort_order: menu.sortOrder,
      menu_item_id: menu.id,
    });
  }

  return photos;
}
