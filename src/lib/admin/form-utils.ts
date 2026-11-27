import { getAppBaseUrl } from "@/lib/admin/app-url";

export const APP_BASE_URL = getAppBaseUrl();

export function generateId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

export function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  if (!Number.isInteger(length) || length < 8 || length > 128) {
    throw new RangeError("Password length must be an integer between 8 and 128");
  }
  // 余りによる偏りを避け、ブラウザ・Node共通のWeb Cryptoを使う。
  const limit = 256 - (256 % chars.length);
  const bytes = new Uint8Array(length * 2);
  let result = "";
  while (result.length < length) {
    globalThis.crypto.getRandomValues(bytes);
    for (const value of bytes) {
      if (value >= limit) continue;
      result += chars[value % chars.length];
      if (result.length === length) break;
    }
  }
  return result;
}

export function todayIso(): string {
  return new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}

export function addCalendarMonths(dateStr: string, months: number): string {
  const source = new Date(dateStr + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !Number.isFinite(source.getTime()) || source.toISOString().slice(0,10) !== dateStr || !Number.isInteger(months)) throw new RangeError("Invalid contract date");
  const target = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth()+1, 0)).getUTCDate();
  target.setUTCDate(Math.min(source.getUTCDate(), lastDay));
  return target.toISOString().slice(0,10);
}

export function addMonths(dateStr: string, months: number): string {
  const end = new Date(addCalendarMonths(dateStr, months) + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate()-1);
  return end.toISOString().slice(0,10);
}

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Empty or invalid input must never silently select a service price. */
export function parseAgreedMonthlyFee(value:string):number|null {
 const input=value.trim();if(!/^[0-9]{1,7}$/.test(input))return null;const fee=Number(input);return Number.isSafeInteger(fee)&&fee<=1_000_000?fee:null;
}
