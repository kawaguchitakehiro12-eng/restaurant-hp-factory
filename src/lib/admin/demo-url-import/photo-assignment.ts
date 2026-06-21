import type { DemoImportedPhoto, DemoPhotoAssignment } from "@/types/demo-url-import";
import { emptyPhotoAssignment } from "@/types/demo-url-import";
import { filterUsablePhotos } from "@/lib/admin/demo-photo-exclusions";
import { estimatePixelsFromUrl } from "@/lib/admin/demo-url-import/image-filter";

type PhotoCategory = "food" | "interior" | "exterior" | "other";

const FOOD_KEYWORDS = [
  "料理",
  "food",
  "dish",
  "plate",
  "menu",
  "メニュー",
  "寿司",
  "鮨",
  "刺身",
  "焼",
  "鍋",
  "天ぷら",
  "揚",
  "コース",
  "デザート",
  "スイーツ",
  "drink",
  "ドリンク",
];

const INTERIOR_KEYWORDS = [
  "店内",
  "内観",
  "interior",
  "席",
  "個室",
  "カウンター",
  "テーブル",
  "空間",
  "room",
  "ホール",
  "bar",
  "ラウンジ",
  "座席",
];

const EXTERIOR_KEYWORDS = [
  "外観",
  "exterior",
  "入口",
  "facade",
  "看板",
  "エントランス",
  "entrance",
  "storefront",
];

function photoScore(photo: DemoImportedPhoto): number {
  return estimatePixelsFromUrl(photo.url);
}

function isLandscape(url: string): boolean {
  const dim = url.match(/(\d{3,4})x(\d{3,4})/i);
  if (dim) {
    const w = parseInt(dim[1], 10);
    const h = parseInt(dim[2], 10);
    return w >= h && w / Math.max(h, 1) >= 1.2;
  }
  return /1280|1200|1024|960|800|640/.test(url);
}

function classifyPhoto(photo: DemoImportedPhoto): PhotoCategory {
  const text = `${photo.alt} ${photo.url}`.toLowerCase();

  if (EXTERIOR_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return "exterior";
  if (FOOD_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return "food";
  if (INTERIOR_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return "interior";

  if (/food|dish|menu|plate|sushi|sashimi/i.test(text)) return "food";
  if (/interior|inside|room|counter/i.test(text)) return "interior";
  if (/exterior|outside|facade|entrance/i.test(text)) return "exterior";

  return "other";
}

/** ルールベースで写真スロットへ自動仮配置 */
export function suggestPhotoAssignment(
  photos: DemoImportedPhoto[]
): DemoPhotoAssignment {
  const usable = filterUsablePhotos(photos);
  if (usable.length === 0) return emptyPhotoAssignment();

  const assignment = emptyPhotoAssignment();
  const used = new Set<string>();
  const scored = [...usable].sort((a, b) => photoScore(b) - photoScore(a));

  const pick = (predicate: (photo: DemoImportedPhoto) => boolean): string | null => {
    const found = scored.find((p) => !used.has(p.id) && predicate(p));
    if (!found) return null;
    used.add(found.id);
    return found.id;
  };

  assignment.hero =
    pick((p) => isLandscape(p.url)) ??
    pick(() => true);

  assignment.food = pick((p) => classifyPhoto(p) === "food");
  assignment.exterior = pick((p) => classifyPhoto(p) === "exterior");
  assignment.interior = pick((p) => classifyPhoto(p) === "interior");

  if (!assignment.food) {
    assignment.food = pick((p) => classifyPhoto(p) === "other" && !isLandscape(p.url));
  }
  if (!assignment.interior) {
    assignment.interior = pick(() => true);
  }
  if (!assignment.exterior) {
    assignment.exterior = pick((p) => isLandscape(p.url));
  }

  assignment.gallery = scored
    .filter((p) => !used.has(p.id))
    .slice(0, 12)
    .map((p) => p.id);

  return assignment;
}
