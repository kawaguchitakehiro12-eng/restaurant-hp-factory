import type { StorePhoto, StorePhotoRole } from "@/types/store";

export const PHOTO_DISPLAY_CATEGORIES = [
  {
    key: "hero",
    label: "ファーストビュー",
    recommended: 1,
    roles: ["hero"] as StorePhotoRole[],
  },
  {
    key: "interior",
    label: "店内写真",
    recommended: 3,
    roles: ["interior"] as StorePhotoRole[],
  },
  {
    key: "food",
    label: "料理",
    recommended: 5,
    roles: ["food", "gallery", "commitment"] as StorePhotoRole[],
  },
  {
    key: "exterior",
    label: "外観",
    recommended: 1,
    roles: ["exterior", "about", "concept"] as StorePhotoRole[],
  },
] as const;

export const PHOTO_RECOMMENDED_TOTAL = PHOTO_DISPLAY_CATEGORIES.reduce(
  (sum, c) => sum + c.recommended,
  0
);

export function getPhotoCompleteness(photos: StorePhoto[]) {
  const current = photos.length;
  const recommended = PHOTO_RECOMMENDED_TOTAL;
  const remaining = Math.max(0, recommended - current);
  const percent = Math.min(100, Math.round((current / recommended) * 100));
  const stars = Math.min(5, Math.max(0, Math.round(percent / 20)));

  return { current, recommended, remaining, percent, stars };
}

export function groupPhotosByCategory(photos: StorePhoto[]) {
  return PHOTO_DISPLAY_CATEGORIES.map((cat) => ({
    ...cat,
    photos: photos.filter((p) => cat.roles.includes(p.role)),
    count: photos.filter((p) => cat.roles.includes(p.role)).length,
  }));
}

export function getPhotoTitle(photo: StorePhoto): string {
  if (photo.caption) return photo.caption;
  return photo.alt;
}
