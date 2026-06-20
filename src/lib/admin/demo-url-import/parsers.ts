import type { DemoImportedMenu, DemoImportedPhoto } from "@/types/demo-url-import";
import { generateId } from "@/lib/admin/form-utils";
import {
  decodeHtmlEntities,
  extractImageUrls,
  extractJsonLdBlocks,
  extractMetaContent,
  stripTags,
} from "@/lib/admin/demo-url-import/fetch-page";

export type PartialImportData = {
  storeName?: string;
  genre?: string;
  address?: string;
  phone?: string;
  businessHours?: string;
  closedDays?: string;
  menus?: DemoImportedMenu[];
  photos?: DemoImportedPhoto[];
  notes?: string[];
};

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function flattenJsonLd(nodes: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj["@graph"])) {
      for (const item of obj["@graph"]) {
        if (item && typeof item === "object") out.push(item as Record<string, unknown>);
      }
    } else {
      out.push(obj);
    }
  }
  return out;
}

function isRestaurantType(type: unknown): boolean {
  if (typeof type === "string") {
    return /Restaurant|FoodEstablishment|CafeOrCoffeeShop|BarOrPub|LocalBusiness/i.test(type);
  }
  if (Array.isArray(type)) {
    return type.some((t) => isRestaurantType(t));
  }
  return false;
}

function addressFromJsonLd(obj: Record<string, unknown>): string {
  const addr = obj.address;
  if (typeof addr === "string") return addr;
  if (addr && typeof addr === "object") {
    const a = addr as Record<string, unknown>;
    const parts = [
      pickString(a, ["postalCode"]),
      pickString(a, ["addressRegion", "addressLocality", "streetAddress"]),
    ].filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return "";
}

function hoursFromJsonLd(obj: Record<string, unknown>): string {
  const hours = obj.openingHoursSpecification ?? obj.openingHours;
  if (typeof hours === "string") return hours;
  if (Array.isArray(hours)) {
    return hours
      .map((h) => {
        if (typeof h === "string") return h;
        if (h && typeof h === "object") {
          const spec = h as Record<string, unknown>;
          const day = pickString(spec, ["dayOfWeek"]);
          const opens = pickString(spec, ["opens"]);
          const closes = pickString(spec, ["closes"]);
          if (day && opens) return `${day} ${opens}–${closes}`.trim();
        }
        return "";
      })
      .filter(Boolean)
      .join(" / ");
  }
  return "";
}

function menusFromJsonLd(obj: Record<string, unknown>): DemoImportedMenu[] {
  const menu = obj.hasMenu ?? obj.menu;
  if (!menu) return [];
  const items: DemoImportedMenu[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    const type = o["@type"];
    const name = pickString(o, ["name"]);
    if (name && (type === "MenuItem" || type === "Product" || o.offers)) {
      let price = "";
      const offers = o.offers;
      if (offers && typeof offers === "object") {
        const offer = offers as Record<string, unknown>;
        price = pickString(offer, ["price", "lowPrice"]);
        if (price && !price.startsWith("¥")) price = `¥${price}`;
      }
      items.push({
        name,
        price,
        description: pickString(o, ["description"]),
        imageUrl:
          typeof o.image === "string"
            ? o.image
            : Array.isArray(o.image) && typeof o.image[0] === "string"
              ? o.image[0]
              : "",
      });
    }
    for (const val of Object.values(o)) {
      if (Array.isArray(val)) val.forEach(walk);
      else if (val && typeof val === "object") walk(val);
    }
  };

  walk(menu);
  return items.slice(0, 20);
}

export function parseJsonLdFromHtml(html: string, sourceUrl: string): PartialImportData {
  const blocks = flattenJsonLd(extractJsonLdBlocks(html));
  const restaurant = blocks.find((b) => isRestaurantType(b["@type"]));
  if (!restaurant) return {};

  const photos: DemoImportedPhoto[] = [];
  const image = restaurant.image;
  const imageList = Array.isArray(image) ? image : image ? [image] : [];
  for (const img of imageList) {
    const url = typeof img === "string" ? img : pickString(img as Record<string, unknown>, ["url"]);
    if (url) {
      photos.push({
        id: generateId("photo"),
        url,
        alt: pickString(restaurant, ["name"]) || "店舗写真",
        source: "official",
      });
    }
  }

  return {
    storeName: pickString(restaurant, ["name"]),
    genre: pickString(restaurant, ["servesCuisine"]),
    address: addressFromJsonLd(restaurant),
    phone: pickString(restaurant, ["telephone"]),
    businessHours: hoursFromJsonLd(restaurant),
    menus: menusFromJsonLd(restaurant),
    photos,
    notes: ["JSON-LD（構造化データ）から取得"],
  };
}

export function parseOpenGraphFromHtml(
  html: string,
  baseUrl: string,
  source: DemoImportedPhoto["source"]
): PartialImportData {
  const storeName =
    extractMetaContent(html, "og:site_name") ??
    extractMetaContent(html, "og:title") ??
    extractMetaContent(html, "twitter:title") ??
    "";

  const photos: DemoImportedPhoto[] = [];
  const ogImage = extractMetaContent(html, "og:image");
  if (ogImage) {
    photos.push({
      id: generateId("photo"),
      url: ogImage.startsWith("http") ? ogImage : new URL(ogImage, baseUrl).href,
      alt: storeName || "画像",
      source,
    });
  }

  for (const url of extractImageUrls(html, baseUrl)) {
    if (photos.some((p) => p.url === url)) continue;
    photos.push({
      id: generateId("photo"),
      url,
      alt: storeName || "画像",
      source,
    });
  }

  return {
    storeName: storeName.replace(/\s*[|｜\-–—].*$/, "").trim(),
    photos: photos.slice(0, 20),
    notes: [`${source} のOGP・HTMLから取得`],
  };
}

export function parseTabelogHtml(html: string, baseUrl: string): PartialImportData {
  const notes: string[] = ["食べログHTMLから取得"];
  const data: PartialImportData = { notes, photos: [], menus: [] };

  const jsonLd = parseJsonLdFromHtml(html, baseUrl);
  Object.assign(data, {
    storeName: jsonLd.storeName,
    address: jsonLd.address,
    phone: jsonLd.phone,
    businessHours: jsonLd.businessHours,
    menus: jsonLd.menus,
    photos: jsonLd.photos,
  });

  if (!data.storeName) {
    const h2Match = html.match(/class=["'][^"']*display-name[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Match) data.storeName = stripTags(h2Match[1]);
    if (!data.storeName) {
      const title = extractMetaContent(html, "og:title");
      if (title) data.storeName = title.replace(/\s*[|｜\-–—].*$/, "").trim();
    }
  }

  const genreMatch = html.match(/class=["'][^"']*linktree__parent-target[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
  if (genreMatch) data.genre = stripTags(genreMatch[1]);

  if (!data.address) {
    const addrMatch = html.match(/class=["'][^"']*rstinfo-table__address[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
    if (addrMatch) data.address = stripTags(addrMatch[1]);
  }

  if (!data.phone) {
    const telMatch = html.match(/href=["']tel:([^"']+)["']/i);
    if (telMatch) data.phone = decodeHtmlEntities(telMatch[1].trim());
  }

  if (!data.businessHours) {
    const hoursMatch = html.match(/class=["'][^"']*rstinfo-table__business-hours[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
    if (hoursMatch) data.businessHours = stripTags(hoursMatch[1]);
  }

  const closedMatch = html.match(/定休日[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);
  if (closedMatch) data.closedDays = stripTags(closedMatch[1]);

  const menuItems: DemoImportedMenu[] = [...(data.menus ?? [])];
  const menuRe =
    /class=["'][^"']*rstdtl-menu-lst__name[^"']*["'][^>]*>([\s\S]*?)<\/p>[\s\S]*?class=["'][^"']*rstdtl-menu-lst__price[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi;
  let menuMatch: RegExpExecArray | null;
  while ((menuMatch = menuRe.exec(html)) !== null) {
    const name = stripTags(menuMatch[1]);
    const priceRaw = stripTags(menuMatch[2]);
    if (!name) continue;
    if (menuItems.some((m) => m.name === name)) continue;
    menuItems.push({
      name,
      price: priceRaw.includes("円") || priceRaw.includes("¥") ? priceRaw : "",
      description: "",
      imageUrl: "",
    });
  }
  data.menus = menuItems.slice(0, 20);

  const photoUrls = extractImageUrls(html, baseUrl).filter(
    (u) => u.includes("tblg") || u.includes("tabelog") || u.includes("unsplash") === false
  );
  const existing = new Set((data.photos ?? []).map((p) => p.url));
  for (const url of photoUrls) {
    if (existing.has(url)) continue;
    data.photos!.push({
      id: generateId("photo"),
      url,
      alt: data.storeName ? `${data.storeName} 写真` : "食べログ写真",
      source: "tabelog",
    });
    existing.add(url);
  }
  data.photos = data.photos!.slice(0, 25);

  return data;
}
