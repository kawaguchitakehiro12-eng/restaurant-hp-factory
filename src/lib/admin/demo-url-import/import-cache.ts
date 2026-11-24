import type { DemoUrlImportInput, DemoUrlImportResult } from "@/types/demo-url-import";

export const DEMO_IMPORT_CACHE_KEY = "demo-import-cache";
const TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = {
  input: DemoUrlImportInput;
  result: DemoUrlImportResult;
  fetchedAt: string;
};

type CacheMap = Record<string, CacheEntry>;

function normalizeTabelogUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    parsed.hash = "";
    parsed.search = "";
    return parsed.href.replace(/\/+$/, "").toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
}

/** 食べログURLを優先キーに（同一店舗の再取得を省略） */
export function getImportCacheKey(input: DemoUrlImportInput): string | null {
  const tabelog = normalizeTabelogUrl(input.tabelogUrl);
  if (tabelog) return tabelog;
  const parts = [
    normalizeTabelogUrl(input.instagramUrl),
    normalizeTabelogUrl(input.officialUrl ?? ""),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("|") : null;
}

function readCacheMap(): CacheMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEMO_IMPORT_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CacheMap;
  } catch {
    return {};
  }
}

function writeCacheMap(map: CacheMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_IMPORT_CACHE_KEY, JSON.stringify(map));
}

export function getCachedImport(
  input: DemoUrlImportInput
): DemoUrlImportResult | null {
  const key = getImportCacheKey(input);
  if (!key) return null;

  const entry = readCacheMap()[key];
  if (!entry) return null;

  const age = Date.now() - new Date(entry.fetchedAt).getTime();
  if (age > TTL_MS) return null;

  return entry.result;
}

export function setCachedImport(
  input: DemoUrlImportInput,
  result: DemoUrlImportResult
): void {
  const key = getImportCacheKey(input);
  if (!key) return;

  const map = readCacheMap();
  map[key] = {
    input,
    result,
    fetchedAt: new Date().toISOString(),
  };
  writeCacheMap(map);
}

export function formatCacheAge(fetchedAt: string): string {
  const hours = Math.floor((Date.now() - new Date(fetchedAt).getTime()) / (60 * 60 * 1000));
  if (hours < 1) return "1時間以内";
  return `${hours}時間前`;
}
