import type { BusinessType } from "@/types/demo";
import type { ContractTemplateId } from "@/types/demo";

const GENRE_MAP: { keywords: string[]; businessType: BusinessType }[] = [
  { keywords: ["カフェ", "cafe", "コーヒー", "喫茶"], businessType: "cafe" },
  { keywords: ["バー", "bar", "ワインバー", "カクテル"], businessType: "bar" },
  { keywords: ["イタリアン", "italian", "パスタ", "ピザ"], businessType: "italian" },
  { keywords: ["居酒屋", "izakaya", "酒場", "焼鳥", "炉端"], businessType: "izakaya" },
  { keywords: ["和食", "日本料理", "寿司", "鮨", "割烹", "懐石"], businessType: "japanese" },
];

export function genreToBusinessType(genre: string): BusinessType {
  const lower = genre.toLowerCase();
  for (const entry of GENRE_MAP) {
    if (entry.keywords.some((k) => lower.includes(k.toLowerCase()) || genre.includes(k))) {
      return entry.businessType;
    }
  }
  return "other";
}

export function suggestTemplateFromBusinessType(
  businessType: BusinessType
): ContractTemplateId {
  switch (businessType) {
    case "cafe":
      return "cafe";
    case "bar":
      return "bar";
    case "italian":
      return "bal";
    case "izakaya":
      return "izakaya-casual";
    case "japanese":
      return "luxury-japanese";
    default:
      return "luxury-japanese";
  }
}
