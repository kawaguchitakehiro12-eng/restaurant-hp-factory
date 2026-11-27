import type { CafeMenuItem } from "@/types/cafe";

const DRINK_PATTERN =
  /ラテ|latte|コーヒー|coffee|エスプレッソ|espresso|ティー|tea|ソーダ|soda|ドリンク|drink|brew|cappuccino|americano|macchiato|mocha|フラペ|smoothie|matcha|抹茶|クラフト|flat white|ホワイト/i;

function isDrinkItem(item: CafeMenuItem): boolean {
  const text = [item.name, item.nameEn, item.description]
    .filter(Boolean)
    .join(" ");
  return DRINK_PATTERN.test(text);
}

export function splitCafeMenu(items: CafeMenuItem[]): {
  popularMenu: CafeMenuItem[];
  foodMenu: CafeMenuItem[];
  drinkMenu: CafeMenuItem[];
} {
  const drinkMenu = items.filter(isDrinkItem);
  const foodMenu = items.filter((item) => !isDrinkItem(item));

  const badgeItems = items.filter((item) => item.badge);
  const popularMenu =
    badgeItems.length > 0
      ? badgeItems
      : items.slice(0, Math.min(3, items.length));

  return { popularMenu, foodMenu, drinkMenu };
}
