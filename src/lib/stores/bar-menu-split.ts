import type { BarMenuItem } from "@/types/bar";

const DRINK_PATTERN =
  /カクテル|cocktail|ウイスキー|whisky|whiskey|ハイボール|highball|ジン|gin|ラム|rum|テキーラ|tequila|マルガリータ|margarita|サワー|sour|ビール|beer|wine|ワイン|シャンパン|champagne|スピリッツ|spirit|旧 fashioned|old fashioned|ネグローニ|negroni|マティーニ|martini|ブランデー|brandy|バーボン|bourbon|シングルモルト|single malt|クラフト|craft|ドリンク|drink|ショット|shot|リキュール|liqueur|グラス/i;

const SNACK_PATTERN =
  /スナック|snack|ナッツ|nuts|チーズ|cheese|チャコ|chips|フード|food|前菜|appetizer|タパス|tapas|盛り|plate|オリーブ|olive|サラミ|salami|パテ|pate|燻製|smoke|ドライ/i;

function isDrinkItem(item: BarMenuItem): boolean {
  const text = [item.name, item.nameEn, item.description]
    .filter(Boolean)
    .join(" ");
  if (SNACK_PATTERN.test(text) && !DRINK_PATTERN.test(text)) return false;
  return DRINK_PATTERN.test(text);
}

export function splitBarMenu(items: BarMenuItem[]): {
  signatureDrinks: BarMenuItem[];
  foodSnacks: BarMenuItem[];
} {
  const drinks = items.filter(isDrinkItem);
  const food = items.filter((item) => !isDrinkItem(item));

  const badgeDrinks = drinks.filter((item) => item.badge);
  const signatureDrinks =
    badgeDrinks.length > 0
      ? badgeDrinks
      : drinks.length > 0
        ? drinks.slice(0, Math.min(3, drinks.length))
        : items.slice(0, Math.min(3, items.length));

  return { signatureDrinks, foodSnacks: food };
}
