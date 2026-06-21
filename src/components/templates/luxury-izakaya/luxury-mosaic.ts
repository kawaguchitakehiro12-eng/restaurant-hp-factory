/** 写真グリッド用 — インデックスごとにサイズクラスを返す */

export type LuxuryMosaicSize = "hero" | "xl" | "lg" | "md" | "sm" | "xs";

const SPACE_PATTERN: LuxuryMosaicSize[] = ["hero", "lg", "sm", "md", "xl", "xs"];
const GALLERY_PATTERN: LuxuryMosaicSize[] = ["hero", "sm", "md", "xs", "xl", "sm", "lg", "xs"];
const COMMITMENT_PATTERN: LuxuryMosaicSize[] = ["xl", "md", "hero"];

export function luxuryMosaicClass(
  index: number,
  pattern: LuxuryMosaicSize[]
): string {
  const size = pattern[index % pattern.length];
  return `luxury-mosaic--${size}`;
}

export function luxurySpaceClass(index: number): string {
  return luxuryMosaicClass(index, SPACE_PATTERN);
}

export function luxuryGalleryClass(index: number): string {
  return luxuryMosaicClass(index, GALLERY_PATTERN);
}

export function luxuryCommitmentPhotoClass(index: number): string {
  return luxuryMosaicClass(index, COMMITMENT_PATTERN);
}

export function luxuryDishPhotoClass(index: number): string {
  if (index === 0) return "luxury-dish-photo--hero";
  return index % 2 === 1 ? "luxury-dish-photo--portrait" : "luxury-dish-photo--landscape";
}

export function luxuryCoursePhotoClass(index: number): string {
  return index === 0 ? "luxury-course-card--featured" : "luxury-course-card--standard";
}
