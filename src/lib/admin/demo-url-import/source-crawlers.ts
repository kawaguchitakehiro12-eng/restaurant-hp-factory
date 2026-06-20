import type { DemoImportedPhoto } from "@/types/demo-url-import";
import { generateId } from "@/lib/admin/form-utils";
import { fetchPageHtml, stripTags, extractMetaContent, decodeHtmlEntities } from "@/lib/admin/demo-url-import/fetch-page";
import {
  discoverTabelogPhotoPages,
  extractAllImageCandidates,
  extractInstagramEmbeddedImages,
  upgradeTabelogImageUrl,
} from "@/lib/admin/demo-url-import/image-extract";
import { parseJsonLdFromHtml, parseTabelogExtraFields } from "@/lib/admin/demo-url-import/parsers";
import type { PartialImportData } from "@/lib/admin/demo-url-import/parsers";
import {
  normalizeImageUrlForDedup,
  probeImagesBatch,
  passesSizeFilter,
  shouldExcludeByUrl,
  estimatePixelsFromUrl,
} from "@/lib/admin/demo-url-import/image-filter";

async function collectPhotosFromPages(
  pageUrls: string[],
  source: DemoImportedPhoto["source"],
  altPrefix: string,
  maxPages?: number
): Promise<RawCollected[]> {
  const rawUrls = new Map<string, string>();
  const pages = maxPages ? pageUrls.slice(0, maxPages) : pageUrls;

  await Promise.all(
    pages.map(async (pageUrl) => {
      const html = await fetchPageHtml(pageUrl);
      if (!html) return;

      const candidates = extractAllImageCandidates(html, pageUrl);
      for (const c of candidates) {
        let url = c.url;
        if (source === "tabelog") url = upgradeTabelogImageUrl(url);
        if (shouldExcludeByUrl(url)) continue;
        if (source === "tabelog" && !isTabelogImage(url) && !isRestaurantImage(url)) continue;
        if (source === "instagram" && !isInstagramImage(url)) continue;

        const key = normalizeImageUrlForDedup(url);
        if (!rawUrls.has(key)) rawUrls.set(key, url);
      }
    })
  );

  return [...rawUrls.values()].map((url) => ({
    url,
    source,
    alt: altPrefix,
  }));
}

type RawCollected = {
  url: string;
  source: DemoImportedPhoto["source"];
  alt: string;
};

function isTabelogImage(url: string): boolean {
  return /tblg\.k-img\.com|tabelog\.com.*\.(?:jpg|jpeg|png|webp)/i.test(url);
}

function isRestaurantImage(url: string): boolean {
  return /k-img\.com\/restaurant/i.test(url);
}

function isInstagramImage(url: string): boolean {
  return /cdninstagram|fbcdn\.net|instagram\.com/i.test(url);
}

async function finalizePhotos(raw: RawCollected[]): Promise<DemoImportedPhoto[]> {
  if (raw.length === 0) return [];

  const unique = new Map<string, RawCollected>();
  for (const item of raw) {
    const key = normalizeImageUrlForDedup(item.url);
    if (!unique.has(key)) unique.set(key, item);
  }

  const urls = [...unique.values()].map((r) => r.url);
  const metaMap = await probeImagesBatch(urls);

  const passed: { raw: RawCollected; score: number }[] = [];

  for (const item of unique.values()) {
    const meta = metaMap.get(item.url) ?? {
      url: item.url,
      byteSize: 0,
      width: 0,
      height: 0,
    };
    if (!passesSizeFilter(meta)) continue;

    const score =
      meta.byteSize || meta.width * meta.height || estimatePixelsFromUrl(item.url);
    passed.push({ raw: item, score });
  }

  passed.sort((a, b) => b.score - a.score);

  return passed.map(({ raw: item }) => ({
    id: generateId("photo"),
    url: item.url,
    alt: item.alt,
    source: item.source,
  }));
}

function parseTabelogStoreFromHtml(html: string, tabelogUrl: string): PartialImportData {
  const notes: string[] = [];
  const data: PartialImportData = { notes, photos: [], menus: [] };
  const jsonLd = parseJsonLdFromHtml(html, tabelogUrl);
  Object.assign(data, {
    storeName: jsonLd.storeName,
    address: jsonLd.address,
    phone: jsonLd.phone,
    businessHours: jsonLd.businessHours,
    menus: jsonLd.menus,
  });

  if (!data.storeName) {
    const h2 = html.match(/class=["'][^"']*display-name[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
    if (h2) data.storeName = stripTags(h2[1]);
    if (!data.storeName) {
      const title = extractMetaContent(html, "og:title");
      if (title) data.storeName = title.replace(/\s*[|｜\-–—].*$/, "").trim();
    }
  }

  const genreMatch = html.match(
    /class=["'][^"']*linktree__parent-target[^"']*["'][^>]*>([\s\S]*?)<\/a>/i
  );
  if (genreMatch) data.genre = stripTags(genreMatch[1]);

  if (!data.address) {
    const addr = html.match(/class=["'][^"']*rstinfo-table__address[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
    if (addr) data.address = stripTags(addr[1]);
  }

  if (!data.phone) {
    const tel = html.match(/href=["']tel:([^"']+)["']/i);
    if (tel) data.phone = decodeHtmlEntities(tel[1].trim());
  }

  if (!data.businessHours) {
    const hours = html.match(
      /class=["'][^"']*rstinfo-table__business-hours[^"']*["'][^>]*>([\s\S]*?)<\/td>/i
    );
    if (hours) data.businessHours = stripTags(hours[1]);
  }

  const closed = html.match(/定休日[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);
  if (closed) data.closedDays = stripTags(closed[1]);

  Object.assign(data, parseTabelogExtraFields(html));

  const menuItems = [...(data.menus ?? [])];
  const menuRe =
    /class=["'][^"']*rstdtl-menu-lst__name[^"']*["'][^>]*>([\s\S]*?)<\/p>[\s\S]*?class=["'][^"']*rstdtl-menu-lst__price[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi;
  let menuMatch: RegExpExecArray | null;
  while ((menuMatch = menuRe.exec(html)) !== null) {
    const name = stripTags(menuMatch[1]);
    const priceRaw = stripTags(menuMatch[2]);
    if (!name || menuItems.some((m) => m.name === name)) continue;
    menuItems.push({
      name,
      price: priceRaw.includes("円") || priceRaw.includes("¥") ? priceRaw : "",
      description: "",
      imageUrl: "",
    });
  }
  data.menus = menuItems;

  return data;
}

const INITIAL_PHOTO_PAGES = 2;
const INITIAL_PHOTO_TARGET = 20;

/** 食べログ: 店舗情報 → 初期20枚 → 残り写真の順で段階取得 */
export async function crawlTabelogProgressive(
  tabelogUrl: string,
  onPartial: (
    data: PartialImportData,
    phase: "store" | "photos-initial" | "photos-more"
  ) => void
): Promise<PartialImportData> {
  const notes: string[] = [];
  const html = await fetchPageHtml(tabelogUrl);
  if (!html) {
    const fail = { notes: ["食べログ: ページを取得できませんでした"] };
    return fail;
  }

  const storeData = parseTabelogStoreFromHtml(html, tabelogUrl);
  storeData.notes = [...(storeData.notes ?? []), ...notes];
  onPartial(storeData, "store");

  const alt = storeData.storeName ? `${storeData.storeName} 写真` : "食べログ写真";
  const photoPages = discoverTabelogPhotoPages(html, tabelogUrl);
  storeData.notes?.push(`食べログ: ${photoPages.length}ページをスキャン`);

  const raw: RawCollected[] = [];
  const mainCandidates = extractAllImageCandidates(html, tabelogUrl);
  for (const c of mainCandidates) {
    let url = upgradeTabelogImageUrl(c.url);
    if (shouldExcludeByUrl(url)) continue;
    if (!isTabelogImage(url) && !isRestaurantImage(url)) continue;
    raw.push({ url, source: "tabelog", alt: c.alt || alt });
  }

  const initialPages = photoPages.slice(0, INITIAL_PHOTO_PAGES);
  const initialRaw = await collectPhotosFromPages(
    initialPages,
    "tabelog",
    alt,
    INITIAL_PHOTO_PAGES
  );
  raw.push(...initialRaw);

  let photos = await finalizePhotos(raw);
  if (photos.length > INITIAL_PHOTO_TARGET) {
    photos = photos.slice(0, INITIAL_PHOTO_TARGET);
  }

  onPartial(
    {
      photos,
      notes: [`食べログ: 初期 ${photos.length}枚の写真を取得`],
    },
    "photos-initial"
  );

  if (photoPages.length > INITIAL_PHOTO_PAGES) {
    const remainingRaw = await collectPhotosFromPages(
      photoPages.slice(INITIAL_PHOTO_PAGES),
      "tabelog",
      alt
    );
    const allRaw = [...raw, ...remainingRaw];
    const allPhotos = await finalizePhotos(allRaw);
    onPartial(
      {
        photos: allPhotos,
        notes: [`食べログ: 合計 ${allPhotos.length}枚の写真を取得`],
      },
      "photos-more"
    );
    return {
      ...storeData,
      photos: allPhotos,
      notes: storeData.notes,
    };
  }

  return { ...storeData, photos, notes: storeData.notes };
}

export async function crawlTabelog(tabelogUrl: string): Promise<PartialImportData> {
  return crawlTabelogProgressive(tabelogUrl, () => {});
}

export async function crawlInstagram(instagramUrl: string): Promise<PartialImportData> {
  const html = await fetchPageHtml(instagramUrl);
  if (!html) {
    return { notes: ["Instagram: ページを取得できませんでした"] };
  }

  const storeName =
    extractMetaContent(html, "og:title")?.replace(/\s*[(@].*$/, "").trim() ?? "";

  const raw: RawCollected[] = [];
  const alt = storeName ? `${storeName} Instagram` : "Instagram写真";

  for (const url of extractInstagramEmbeddedImages(html)) {
    if (shouldExcludeByUrl(url)) continue;
    raw.push({ url, source: "instagram", alt });
  }

  for (const c of extractAllImageCandidates(html, instagramUrl)) {
    if (!isInstagramImage(c.url)) continue;
    if (shouldExcludeByUrl(c.url)) continue;
    raw.push({ url: c.url, source: "instagram", alt: c.alt || alt });
  }

  const photos = await finalizePhotos(raw);

  return {
    storeName,
    photos,
    notes: [`Instagram: ${photos.length}枚の写真を取得`],
  };
}

export async function crawlOfficialSite(officialUrl: string): Promise<PartialImportData> {
  const html = await fetchPageHtml(officialUrl);
  if (!html) {
    return { notes: ["公式サイト: ページを取得できませんでした"] };
  }

  const jsonLd = parseJsonLdFromHtml(html, officialUrl);
  const storeName =
    jsonLd.storeName ||
    extractMetaContent(html, "og:site_name") ||
    extractMetaContent(html, "og:title")?.replace(/\s*[|｜\-–—].*$/, "").trim() ||
    "";

  const alt = storeName ? `${storeName} 公式サイト` : "公式サイト写真";
  const candidates = extractAllImageCandidates(html, officialUrl);
  const raw: RawCollected[] = candidates
    .filter((c) => !shouldExcludeByUrl(c.url))
    .map((c) => ({ url: c.url, source: "official" as const, alt: c.alt || alt }));

  if (jsonLd.photos) {
    for (const p of jsonLd.photos) {
      if (!shouldExcludeByUrl(p.url)) {
        raw.push({ url: p.url, source: "official", alt: p.alt || alt });
      }
    }
  }

  const photos = await finalizePhotos(raw);

  const insta =
    html.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"']+)["']/i)?.[1] ?? "";
  const reserve =
    html.match(/href=["']([^"']*(?:reserve|yoyaku|booking|reservation)[^"']*)["']/i)?.[1] ??
    "";

  return {
    ...jsonLd,
    storeName: storeName || jsonLd.storeName,
    photos,
    instagramUrl: insta || undefined,
    reservationUrl: reserve.startsWith("http") ? reserve : undefined,
    officialUrl: officialUrl,
    notes: [`公式サイト: ${photos.length}枚の写真を取得`],
  };
}

export function countPhotosBySource(photos: DemoImportedPhoto[]): {
  tabelog: number;
  instagram: number;
  official: number;
  total: number;
} {
  const tabelog = photos.filter((p) => p.source === "tabelog").length;
  const instagram = photos.filter((p) => p.source === "instagram").length;
  const official = photos.filter((p) => p.source === "official").length;
  return { tabelog, instagram, official, total: photos.length };
}
