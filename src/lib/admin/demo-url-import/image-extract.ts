import {
  decodeHtmlEntities,
  extractJsonLdBlocks,
  extractMetaContent,
  resolveUrl,
} from "@/lib/admin/demo-url-import/fetch-page";

export type RawImageCandidate = {
  url: string;
  alt?: string;
};

const LAZY_ATTRS = [
  "src",
  "data-src",
  "data-original",
  "data-lazy-src",
  "data-lazy",
  "data-url",
  "data-image",
  "data-full-url",
  "data-srcset",
];

/** HTMLから取得可能な画像URLをすべて抽出 */
export function extractAllImageCandidates(
  html: string,
  baseUrl: string
): RawImageCandidate[] {
  const found = new Map<string, RawImageCandidate>();

  const add = (raw: string | null | undefined, alt?: string) => {
    if (!raw?.trim()) return;
    const url = normalizeCandidateUrl(raw.trim(), baseUrl);
    if (!url) return;
    if (!found.has(url)) found.set(url, { url, alt });
  };

  for (const key of [
    "og:image",
    "og:image:url",
    "og:image:secure_url",
    "twitter:image",
    "twitter:image:src",
  ]) {
    add(extractMetaContent(html, key));
  }

  for (const block of extractJsonLdBlocks(html)) {
    collectJsonLdImages(block, add);
  }

  const imgTagRe = /<img\b[^>]*>/gi;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = imgTagRe.exec(html)) !== null) {
    const tag = tagMatch[0];
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    const alt = altMatch?.[1];

    for (const attr of LAZY_ATTRS) {
      const attrRe = new RegExp(`\\b${attr}=["']([^"']+)["']`, "i");
      const m = tag.match(attrRe);
      if (m?.[1]) {
        if (attr.includes("srcset")) {
          parseSrcset(m[1], baseUrl).forEach((u) => add(u, alt));
        } else {
          add(m[1], alt);
        }
      }
    }
  }

  const pictureSourceRe = /<source\b[^>]+srcset=["']([^"']+)["'][^>]*>/gi;
  while ((tagMatch = pictureSourceRe.exec(html)) !== null) {
    parseSrcset(tagMatch[1], baseUrl).forEach((u) => add(u));
  }

  const srcsetRe = /\bsrcset=["']([^"']+)["']/gi;
  while ((tagMatch = srcsetRe.exec(html)) !== null) {
    parseSrcset(tagMatch[1], baseUrl).forEach((u) => add(u));
  }

  const bgRe = /background(?:-image)?\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((tagMatch = bgRe.exec(html)) !== null) {
    add(tagMatch[1]);
  }

  const styleUrlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((tagMatch = styleUrlRe.exec(html)) !== null) {
    const u = tagMatch[1].trim();
    if (/\.(jpe?g|png|webp|gif|avif)/i.test(u) || u.includes("image") || u.includes("photo")) {
      add(u);
    }
  }

  const bareUrlRe =
    /["'](https?:\/\/[^"']+\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"']*)?)["']/gi;
  while ((tagMatch = bareUrlRe.exec(html)) !== null) {
    add(tagMatch[1]);
  }

  return [...found.values()];
}

function normalizeCandidateUrl(raw: string, baseUrl: string): string | null {
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return null;
  if (raw.startsWith("//")) return `https:${raw}`;
  try {
    const resolved = resolveUrl(baseUrl, decodeHtmlEntities(raw));
    const parsed = new URL(resolved);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function parseSrcset(srcset: string, baseUrl: string): string[] {
  return srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean)
    .map((u) => normalizeCandidateUrl(u, baseUrl))
    .filter((u): u is string => Boolean(u));
}

function collectJsonLdImages(
  node: unknown,
  add: (url: string, alt?: string) => void
): void {
  if (!node) return;
  if (typeof node === "string") {
    if (/^https?:\/\/.+\.(jpe?g|png|webp|gif|avif)/i.test(node)) add(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => collectJsonLdImages(n, add));
    return;
  }
  if (typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  if (typeof obj.url === "string") add(obj.url);
  if (typeof obj.contentUrl === "string") add(obj.contentUrl);
  if (typeof obj.image === "string") add(obj.image);
  if (Array.isArray(obj.image)) obj.image.forEach((i) => collectJsonLdImages(i, add));
  else if (obj.image && typeof obj.image === "object") collectJsonLdImages(obj.image, add);

  for (const val of Object.values(obj)) {
    if (val && typeof val === "object") collectJsonLdImages(val, add);
  }
}

/** ページ内リンクを抽出 */
export function extractPageLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const re = /<a\b[^>]+href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const normalized = normalizeCandidateUrl(match[1], baseUrl);
    if (normalized) links.add(normalized);
  }
  return [...links];
}

/** Instagram 埋め込みJSONから画像URLを抽出 */
export function extractInstagramEmbeddedImages(html: string): string[] {
  const urls = new Set<string>();

  const cdnRe =
    /https?:\\\/\\\/[^"\\]+(?:cdninstagram|fbcdn|instagram)\.com[^"\\]+\.(?:jpe?g|png|webp)/gi;
  let m: RegExpExecArray | null;
  while ((m = cdnRe.exec(html)) !== null) {
    const decoded = m[0].replace(/\\\//g, "/");
    urls.add(decoded);
  }

  const plainCdnRe =
    /https?:\/\/[^"'\s]+(?:cdninstagram|fbcdn|instagram)\.com[^"'\s]+\.(?:jpe?g|png|webp)/gi;
  while ((m = plainCdnRe.exec(html)) !== null) {
    urls.add(m[0]);
  }

  const scriptJsonRe = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = scriptJsonRe.exec(html)) !== null) {
    try {
      const json = m[1];
      const embedded = json.match(
        /https?:\\\/\\\/[^"\\]+(?:cdninstagram|fbcdn)\.com[^"\\]+/g
      );
      embedded?.forEach((u) => urls.add(u.replace(/\\\//g, "/")));
    } catch {
      /* skip */
    }
  }

  return [...urls];
}

/** 食べログの写真関連サブページURLを生成・発見 */
export function discoverTabelogPhotoPages(html: string, baseUrl: string): string[] {
  const pages = new Set<string>();

  try {
    const base = new URL(baseUrl);
    const path = base.pathname.replace(/\/$/, "");
    const restaurantRoot = path.replace(/\/(photo|dtlrvwlst|map|party|review)(\/.*)?$/i, "");

    const standardPaths = [
      "",
      "/photo/",
      "/dtlrvwlst/",
      "/photo/dtl_rvc/1/",
      "/photo/dtl_rvc/2/",
      "/photo/dtl_rvc/3/",
      "/photo/dtl_rvc/4/",
      "/photo/dtl_rvc/5/",
      "/photo/list/",
    ];

    for (const suffix of standardPaths) {
      pages.add(`${base.origin}${restaurantRoot}${suffix}`);
    }
  } catch {
    /* ignore */
  }

  for (const link of extractPageLinks(html, baseUrl)) {
    if (
      /tabelog\.com/i.test(link) &&
      (/\/photo/i.test(link) || /dtlrvwlst/i.test(link) || /dtl_rvc/i.test(link))
    ) {
      pages.add(link.split("#")[0]);
    }
  }

  return [...pages].slice(0, 15);
}

/** 食べログ画像URLを高解像度版に正規化 */
export function upgradeTabelogImageUrl(url: string): string {
  return url
    .replace(/\/(\d{2,3})x(\d{2,3})\//g, "/640x640/")
    .replace(/_\d{2,3}x\d{2,3}\./g, "_640x640.")
    .replace(/=s\d{2,3}/g, "=s640");
}
