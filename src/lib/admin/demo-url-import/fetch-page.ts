import { parsePublicUrl, safeReadUrl } from "@/lib/admin/demo-url-import/safe-http";

export async function fetchPageHtml(url: string): Promise<string | null> {
 try { const result=await safeReadUrl(url,{limit:2_000_000,headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"SAKUPAGE-DemoImport/1.0"}});
 if(result.status<200||result.status>=300||! /text\/html|application\/xhtml/.test(result.headers.get("content-type")??""))return null;
 return result.body.toString("utf8"); } catch { return null; }
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function extractMetaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }
  return null;
}

export function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      /* skip invalid JSON-LD */
    }
  }
  return blocks;
}

export function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export function extractImageUrls(html: string, baseUrl: string): string[] {
  const urls = new Set<string>();

  const ogImage = extractMetaContent(html, "og:image");
  if (ogImage) urls.add(resolveUrl(baseUrl, ogImage));

  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRe.exec(html)) !== null) {
    const src = match[1].trim();
    if (!src || src.startsWith("data:")) continue;
    if (src.includes("icon") || src.includes("logo") || src.includes("1x1")) continue;
    urls.add(resolveUrl(baseUrl, src));
  }

  const srcsetRe = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRe.exec(html)) !== null) {
    const parts = match[1].split(",").map((p) => p.trim().split(/\s+/)[0]);
    for (const part of parts) {
      if (part && !part.startsWith("data:")) urls.add(resolveUrl(baseUrl, part));
    }
  }

  return [...urls].slice(0, 30);
}

export function isPrivateOrBlockedUrl(url: string): boolean { try { parsePublicUrl(url); return false; } catch { return true; } }

export function normalizeInputUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
