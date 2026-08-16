/**
 * Casual izakaya photo focus defaults.
 * Hero uses data.heroObjectPosition when set; other photos use these safe crops.
 */
export type IzkPhotoFocus = "food" | "interior" | "drink" | "center";

const FOCUS_CLASS: Record<IzkPhotoFocus, string> = {
  food: "izk-pos-food",
  interior: "izk-pos-interior",
  drink: "izk-pos-drink",
  center: "izk-pos-center",
};

export function izkPhotoFocusClass(focus: IzkPhotoFocus = "food"): string {
  return FOCUS_CLASS[focus];
}

/** Infer crop focus from alt / dish name when no focal data exists. */
export function guessIzkPhotoFocus(label: string): IzkPhotoFocus {
  const t = label.toLowerCase();
  if (/ビール|酒|グラス|サワー|ハイボール|ドリンク|beer|drink|sour|wine/.test(t)) {
    return "drink";
  }
  if (
    /店内|カウンター|テーブル|席|宴会|interior|space|dining|bar|seat/.test(t)
  ) {
    return "interior";
  }
  return "food";
}
