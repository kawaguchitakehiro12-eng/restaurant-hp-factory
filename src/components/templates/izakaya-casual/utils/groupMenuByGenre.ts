import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

export type IzakayaMenuGenre = {
  name: string;
  items: IzakayaCasualMenuItem[];
};

const GENRE_RULES: { name: string; pattern: RegExp }[] = [
  { name: "焼き鳥・串", pattern: /串|焼|つくね|ねぎ|レバ|もも|ささみ|やき|鳥/i },
  { name: "刺身・海鮮", pattern: /刺|盛|魚|海|鮮/i },
  { name: "ドリンク", pattern: /ビール|酒|サワー|ハイボール|日本酒|ワイン|焼酎|レモン|梅|ドリンク|生/i },
  { name: "一品・逸品", pattern: /煮|サラダ|唐揚|揚|豆腐|卵|鍋|逸品|おつまみ/i },
];

export function groupMenuByGenre(
  items: IzakayaCasualMenuItem[]
): IzakayaMenuGenre[] {
  const buckets = new Map<string, IzakayaCasualMenuItem[]>();
  const fallback = "その他";

  for (const item of items) {
    const haystack = [item.name, item.nameEn, item.description]
      .filter(Boolean)
      .join(" ");
    const matched = GENRE_RULES.find((rule) => rule.pattern.test(haystack));
    const genre = matched?.name ?? fallback;
    const list = buckets.get(genre) ?? [];
    list.push(item);
    buckets.set(genre, list);
  }

  const orderedNames = [
    ...GENRE_RULES.map((rule) => rule.name),
    fallback,
  ].filter((name, index, arr) => buckets.has(name) && arr.indexOf(name) === index);

  return orderedNames.map((name) => ({
    name,
    items: buckets.get(name) ?? [],
  }));
}
