import type { Metadata } from "next";
import { BRAND } from "@/lib/admin/brand";
import { getPhotoByRole } from "@/lib/stores/helpers";
import type { StoreRecord } from "@/types/store";

export type StoreSeoInput = {
  name: string;
  concept?: string;
  catchCopy?: string;
  heroImageUrl?: string;
  isDemo?: boolean;
  canonicalPath?: string;
};

const DESCRIPTION_MAX = 160;

function truncate(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

/** ブラウザタブ用タイトル */
export function buildStoreDocumentTitle(input: StoreSeoInput): string {
  const name = input.name.trim() || "店舗";
  if (input.isDemo) return `${name} | SAKUPAGE Demo`;
  return name;
}

/** meta description / OGP description */
export function buildStoreMetaDescription(input: StoreSeoInput): string {
  const concept = input.concept?.trim();
  const catchCopy = input.catchCopy?.trim();
  const name = input.name.trim() || "店舗";

  if (concept) return truncate(concept, DESCRIPTION_MAX);
  if (catchCopy) return truncate(catchCopy, DESCRIPTION_MAX);
  return `${name}の公式サイト`;
}

export function storeRecordToSeoInput(
  store: StoreRecord,
  options?: { isDemo?: boolean; canonicalPath?: string }
): StoreSeoInput {
  const hero = getPhotoByRole(store, "hero");
  return {
    name: store.name,
    concept: store.concept,
    catchCopy: store.catchCopy,
    heroImageUrl: hero?.url,
    isDemo: options?.isDemo,
    canonicalPath: options?.canonicalPath,
  };
}

function resolveAbsoluteImageUrl(imageUrl: string | undefined, baseUrl: string): string | undefined {
  if (!imageUrl?.trim()) return undefined;
  const url = imageUrl.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = baseUrl.replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/** Next.js Metadata API 用 */
export function buildStoreSeoMetadata(
  input: StoreSeoInput,
  baseUrl: string
): Metadata {
  const title = buildStoreDocumentTitle(input);
  const description = buildStoreMetaDescription(input);
  const ogTitle = input.name.trim() || title;
  const ogImage = resolveAbsoluteImageUrl(input.heroImageUrl, baseUrl);
  const canonical =
    input.canonicalPath && baseUrl
      ? `${baseUrl.replace(/\/$/, "")}${input.canonicalPath.startsWith("/") ? input.canonicalPath : `/${input.canonicalPath}`}`
      : undefined;

  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      locale: "ja_JP",
      siteName: input.isDemo ? `${BRAND.name} Demo` : ogTitle,
      ...(ogImage ? { images: [{ url: ogImage, alt: `${ogTitle}の写真` }] } : {}),
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function buildStoreSeoTags(input: StoreSeoInput, baseUrl?: string) {
  const title = buildStoreDocumentTitle(input);
  const description = buildStoreMetaDescription(input);
  const ogTitle = input.name.trim() || title;
  const origin = baseUrl?.replace(/\/$/, "") ?? "";
  const ogImage = resolveAbsoluteImageUrl(input.heroImageUrl, origin || "http://localhost:3000");

  return {
    title,
    description,
    ogTitle,
    ogDescription: description,
    ogImage,
    twitterCard: ogImage ? ("summary_large_image" as const) : ("summary" as const),
  };
}

export async function resolveSiteBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch {
    /* headers unavailable outside request */
  }
  return "http://localhost:3000";
}

export const DEFAULT_PUBLIC_METADATA: Metadata = {
  title: BRAND.name,
  description: `${BRAND.name} — 飲食店向けWebサイト制作`,
  openGraph: {
    title: BRAND.name,
    description: `${BRAND.name} — 飲食店向けWebサイト制作`,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: BRAND.name,
    description: `${BRAND.name} — 飲食店向けWebサイト制作`,
  },
};
