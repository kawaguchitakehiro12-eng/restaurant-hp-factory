import type { BusinessType } from "@/types/demo";
import type { ContractTemplateId } from "@/types/demo";

const GENRE_MAP: { keywords: string[]; businessType: BusinessType }[] = [
  { keywords: ["カフェ", "cafe", "コーヒー", "喫茶", "喫茶店"], businessType: "cafe" },
  { keywords: ["バー", "bar", "ワインバー", "カクテル", "ラウンジ"], businessType: "bar" },
  {
    keywords: [
      "ビストロ",
      "bistro",
      "イタリアン",
      "italian",
      "スペイン",
      "spanish",
      "パスタ",
      "ピザ",
      "バル",
    ],
    businessType: "italian",
  },
  {
    keywords: [
      "寿司",
      "鮨",
      "割烹",
      "和食",
      "日本料理",
      "懐石",
      "会席",
      "居酒屋",
      "izakaya",
      "酒場",
      "焼鳥",
      "炉端",
      "天ぷら",
      "うどん",
      "そば",
      "ラーメン",
    ],
    businessType: "japanese",
  },
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

/** ジャンルからテンプレートをルールベースで自動選択 */
export function suggestTemplateFromGenre(genre: string): ContractTemplateId {
  return suggestTemplateFromBusinessType(genreToBusinessType(genre));
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
    case "japanese":
    case "izakaya":
      return "luxury-japanese";
    default:
      return "luxury-japanese";
  }
}

export function getTemplateLabelFromGenre(genre: string): string {
  const templateId = suggestTemplateFromGenre(genre);
  const labels: Record<ContractTemplateId, string> = {
    "luxury-japanese": "和風（高級和食）",
    cafe: "Cafe",
    bar: "Bar",
    bal: "バル",
    "izakaya-casual": "大衆居酒屋",
  };
  return labels[templateId] ?? templateId;
}
