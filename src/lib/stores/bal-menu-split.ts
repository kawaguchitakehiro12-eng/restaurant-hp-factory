import type { BalMenuItem } from "@/types/bal";

/** 説明文の「赤ワインに合う」等で料理が混ざらないよう、品名だけで判定する */
const WINE_PATTERN =
  /ワイン|wine|vino|\bvin\b|ロゼ|スパークリング|カヴァ|\bcava\b|サングリア|sangria|シャンパ|champagne|プロセッコ|prosecco|スプマンテ|シェリー|sherry|ボトル|botella|bottle/i;

const BOARD_PATTERN = /本日|今日|日替|黒板|季節|限定|旬|入荷/i;

function textOf(item: BalMenuItem): string {
  return [item.badge, item.name, item.nameEn, item.description]
    .filter(Boolean)
    .join(" ");
}

function isWine(item: BalMenuItem): boolean {
  return WINE_PATTERN.test([item.name, item.nameEn].filter(Boolean).join(" "));
}

export function splitBalMenu(items: BalMenuItem[]): {
  tapas: BalMenuItem[];
  wines: BalMenuItem[];
  boardItems: BalMenuItem[];
} {
  const wines = items.filter(isWine);
  const food = items.filter((item) => !wines.includes(item));
  const boardItems = food.filter((item) => BOARD_PATTERN.test(textOf(item)));
  const tapas = food.filter((item) => !boardItems.includes(item));

  return {
    tapas: tapas.length > 0 ? tapas : food,
    wines,
    boardItems,
  };
}
