export const balNavItems = [
  { en: "TAPAS", ja: "タパス", href: "#tapas" },
  { en: "WINE", ja: "ワイン", href: "#wine" },
  { en: "BOARD", ja: "本日の黒板", href: "#board" },
  { en: "TABLE", ja: "店内", href: "#table" },
  { en: "ACCESS", ja: "アクセス", href: "#access" },
];

export function telHref(phone: string): string {
  return phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
}

export function openTime(dinner: string): string {
  const m = dinner.match(/(\d{1,2}:\d{2})/);
  return m ? m[1] : dinner;
}

export function walkMinutes(access: string): string | null {
  const m = access.match(/徒歩\s*(\d+)\s*分/);
  return m ? m[1] : null;
}
