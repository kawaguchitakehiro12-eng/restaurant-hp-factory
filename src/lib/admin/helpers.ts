import type { StoreRecord } from "@/types/store";
import type { StoreSubscription } from "@/types/admin";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getStoreSitePath(slug: string): string {
  return slug === "nuee" ? "/cafe" : slug === "shogetsu" ? "/" : `/${slug}`;
}

export function getStoreSiteUrl(slug: string): string {
  return getStoreSitePath(slug);
}

export function daysUntil(dateStr: string, from = new Date()): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / MS_PER_DAY);
}

export function daysRemainingLabel(days: number): string {
  if (days < 0) return "終了済み";
  if (days === 0) return "本日";
  return `あと${days}日`;
}

export function isWithinDays(dateStr: string, days: number, from = new Date()): boolean {
  const remaining = daysUntil(dateStr, from);
  return remaining >= 0 && remaining <= days;
}

export function truncateAddress(address: string, max = 18): string {
  if (address.length <= max) return address;
  return `${address.slice(0, max)}…`;
}

export function formatBusinessHoursSummary(store: StoreRecord): string {
  const { businessHours } = store;
  if (businessHours.dinner) return businessHours.dinner;
  if (businessHours.weekday && businessHours.weekend) {
    return `平日 ${businessHours.weekday}`;
  }
  if (businessHours.weekday) return businessHours.weekday;
  return "未設定";
}

export function hasValidReservationUrl(store: StoreRecord): boolean {
  const url = store.reservationUrl.trim();
  return url.length > 0 && url !== "#reservation" && url !== "#";
}

export type OnboardingItem = {
  id: string;
  label: string;
  done: boolean;
};

export function getOnboardingChecklist(
  store: StoreRecord,
  subscription: StoreSubscription
): OnboardingItem[] {
  const hasBasicInfo =
    Boolean(store.name.trim()) &&
    Boolean(store.address.trim()) &&
    Boolean(store.phone.trim()) &&
    Boolean(store.concept.trim());

  return [
    { id: "settings", label: "基本情報", done: hasBasicInfo },
    {
      id: "photos",
      label: "写真登録",
      done: store.photos.length >= 3,
    },
    { id: "menu", label: "メニュー登録", done: store.menu.length >= 1 },
    {
      id: "reservation",
      label: "予約URL設定",
      done: hasValidReservationUrl(store),
    },
    {
      id: "site",
      label: "サイト確認",
      done: subscription.publishStatus === "published",
    },
  ];
}

export function getOnboardingProgress(items: OnboardingItem[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.done).length;
  return Math.round((done / items.length) * 100);
}

export function isWithinMinimumTerm(subscription: StoreSubscription, from = new Date()): boolean {
  return daysUntil(subscription.minimumTermEndDate, from) > 0;
}
