import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

const SPECIAL_PATTERN =
  /名物|看板|特製|一番|おすすめ|人気|炙り|秘伝|ねぎま|つくね|レバ|刺し|盛り|煮込み/i;

const TODAY_PATTERN = /本日|今日|日替|季節|限定|旬/i;

export function splitIzakayaCasualMenu(items: IzakayaCasualMenuItem[]): {
  specialtyDishes: IzakayaCasualMenuItem[];
  todaysSpecials: IzakayaCasualMenuItem[];
  menuItems: IzakayaCasualMenuItem[];
} {
  const badgeSpecials = items.filter(
    (item) =>
      Boolean(item.badge) &&
      !TODAY_PATTERN.test([item.badge, item.name, item.description].filter(Boolean).join(" "))
  );

  const todays = items.filter((item) =>
    TODAY_PATTERN.test([item.badge, item.name, item.description].filter(Boolean).join(" "))
  );

  const nameSpecials = items.filter(
    (item) =>
      !badgeSpecials.includes(item) &&
      !todays.includes(item) &&
      SPECIAL_PATTERN.test([item.name, item.description].filter(Boolean).join(" "))
  );

  const specialtyDishes =
    badgeSpecials.length > 0
      ? badgeSpecials
      : nameSpecials.length > 0
        ? nameSpecials.slice(0, Math.min(3, nameSpecials.length))
        : items.slice(0, Math.min(3, items.length));

  const specialtyIds = new Set(specialtyDishes.map((item) => item.name));
  const todaysSpecials =
    todays.length > 0
      ? todays.filter((item) => !specialtyIds.has(item.name))
      : items
          .filter((item) => !specialtyIds.has(item.name))
          .slice(0, Math.min(2, items.length));

  return {
    specialtyDishes,
    todaysSpecials,
    menuItems: items,
  };
}
