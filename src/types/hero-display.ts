export type HeroImageFit = "cover" | "contain";

export type HeroObjectPosition =
  | "center center"
  | "center top"
  | "center bottom"
  | "left center"
  | "right center";

export const HERO_IMAGE_FIT_OPTIONS: { value: HeroImageFit; label: string }[] = [
  { value: "cover", label: "cover（枠いっぱい）" },
  { value: "contain", label: "contain（全体表示）" },
];

export const HERO_OBJECT_POSITION_OPTIONS: {
  value: HeroObjectPosition;
  label: string;
}[] = [
  { value: "center center", label: "中央" },
  { value: "center top", label: "上寄せ" },
  { value: "center bottom", label: "下寄せ" },
  { value: "left center", label: "左寄せ" },
  { value: "right center", label: "右寄せ" },
];

export const DEFAULT_HERO_FIT: HeroImageFit = "cover";
export const DEFAULT_HERO_OBJECT_POSITION: HeroObjectPosition = "center center";

export function normalizeHeroFit(value?: HeroImageFit): HeroImageFit {
  return value === "contain" ? "contain" : "cover";
}

export function normalizeHeroObjectPosition(
  value?: HeroObjectPosition
): HeroObjectPosition {
  const allowed = HERO_OBJECT_POSITION_OPTIONS.map((o) => o.value);
  return allowed.includes(value as HeroObjectPosition)
    ? (value as HeroObjectPosition)
    : DEFAULT_HERO_OBJECT_POSITION;
}

export function heroObjectPositionClass(position: HeroObjectPosition): string {
  const map: Record<HeroObjectPosition, string> = {
    "center center": "object-center",
    "center top": "object-top",
    "center bottom": "object-bottom",
    "left center": "object-left",
    "right center": "object-right",
  };
  return map[position];
}
