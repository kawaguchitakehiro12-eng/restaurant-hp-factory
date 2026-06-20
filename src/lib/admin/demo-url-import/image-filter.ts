const MIN_BYTES = 1024;
const MIN_WIDTH = 300;

const EXCLUDE_URL_PATTERNS = [
  /\.svg(\?|$)/i,
  /data:image/i,
  /favicon/i,
  /\/icons?\//i,
  /\bicon[-_./]/i,
  /\blogo[-_./]/i,
  /\/logos?\//i,
  /sprite/i,
  /pixel/i,
  /spacer/i,
  /blank\.gif/i,
  /1x1\.(?:gif|png)/i,
  /tracking/i,
  /analytics/i,
  /doubleclick/i,
  /googlesyndication/i,
  /advertisement/i,
  /\/ads?\//i,
  /banner-ad/i,
  /emoji/i,
  /badge/i,
  /button/i,
  /arrow/i,
  /loading/i,
  /spinner/i,
  /placeholder/i,
  /noimage/i,
  /no-image/i,
  /default.*\.(?:gif|png)/i,
];

export type ImageMeta = {
  url: string;
  byteSize: number;
  width: number;
  height: number;
};

export function normalizeImageUrlForDedup(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href;
  } catch {
    return url;
  }
}

export function shouldExcludeByUrl(url: string): boolean {
  if (EXCLUDE_URL_PATTERNS.some((p) => p.test(url))) return true;
  if (url.endsWith(".svg") || url.includes(".svg?")) return true;
  return false;
}

/** URLパスから推定ピクセル数（ソート用） */
export function estimatePixelsFromUrl(url: string): number {
  const dim = url.match(/(\d{3,4})x(\d{3,4})/i);
  if (dim) return parseInt(dim[1], 10) * parseInt(dim[2], 10);

  const wOnly = url.match(/(?:[/_-]|=w|^)(\d{3,4})(?:[/_-]|$)/i);
  if (wOnly) {
    const w = parseInt(wOnly[1], 10);
    return w * w;
  }

  if (/1280|1200|1024|960|800|640|600/.test(url)) {
    const m = url.match(/1280|1200|1024|960|800|640|600/);
    if (m) {
      const s = parseInt(m[0], 10);
      return s * s;
    }
  }

  return 0;
}

export function passesSizeFilter(meta: ImageMeta): boolean {
  if (meta.byteSize > 0 && meta.byteSize < MIN_BYTES) return false;
  if (meta.width > 0 && meta.width < MIN_WIDTH) return false;
  if (meta.width === 0 && meta.byteSize === 0) {
    const est = estimatePixelsFromUrl(meta.url);
    if (est > 0 && Math.sqrt(est) < MIN_WIDTH) return false;
  }
  return true;
}

const PROBE_TIMEOUT_MS = 6000;
const PROBE_CONCURRENCY = 24;

export async function probeImageMeta(url: string): Promise<ImageMeta> {
  const fallback: ImageMeta = {
    url,
    byteSize: 0,
    width: 0,
    height: 0,
  };

  if (shouldExcludeByUrl(url)) return fallback;

  try {
    const headRes = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: { Accept: "image/*" },
      redirect: "follow",
    });

    const contentLength = parseInt(headRes.headers.get("content-length") ?? "0", 10);
    const contentType = headRes.headers.get("content-type") ?? "";

    if (contentType.includes("svg")) {
      return { ...fallback, byteSize: contentLength };
    }

    if (contentLength > 0 && contentLength < MIN_BYTES) {
      return { url, byteSize: contentLength, width: 0, height: 0 };
    }

    const partial = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: { Range: "bytes=0-65535", Accept: "image/*" },
      redirect: "follow",
    });

    const buffer = new Uint8Array(await partial.arrayBuffer());
    const dims = readImageDimensions(buffer);
    const byteSize =
      contentLength > 0 ? contentLength : parseInt(partial.headers.get("content-length") ?? "0", 10);

    return {
      url,
      byteSize: byteSize || buffer.length,
      width: dims.width,
      height: dims.height,
    };
  } catch {
    const est = estimatePixelsFromUrl(url);
    const side = est > 0 ? Math.round(Math.sqrt(est)) : 0;
    return { url, byteSize: 0, width: side, height: side };
  }
}

export async function probeImagesBatch(urls: string[]): Promise<Map<string, ImageMeta>> {
  const result = new Map<string, ImageMeta>();
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const meta = await probeImageMeta(url);
      result.set(url, meta);
    }
  }

  const workers = Array.from({ length: Math.min(PROBE_CONCURRENCY, urls.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return result;
}

function readImageDimensions(buffer: Uint8Array): { width: number; height: number } {
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
    const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
    return { width: width >>> 0, height: height >>> 0 };
  }

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2;
    while (i < buffer.length - 8) {
      if (buffer[i] !== 0xff) break;
      const marker = buffer[i + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        const height = (buffer[i + 5] << 8) | buffer[i + 6];
        const width = (buffer[i + 7] << 8) | buffer[i + 8];
        return { width, height };
      }
      const len = (buffer[i + 2] << 8) | buffer[i + 3];
      i += 2 + len;
    }
  }

  if (
    buffer.length >= 30 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38) {
      const width = ((buffer[26] | (buffer[27] << 8)) & 0x3fff) + 1;
      const height = ((buffer[28] | (buffer[29] << 8)) & 0x3fff) + 1;
      return { width, height };
    }
  }

  return { width: 0, height: 0 };
}

export function sortByImageSize(a: ImageMeta, b: ImageMeta): number {
  const scoreA = a.byteSize || a.width * a.height || estimatePixelsFromUrl(a.url);
  const scoreB = b.byteSize || b.width * b.height || estimatePixelsFromUrl(b.url);
  return scoreB - scoreA;
}

export { MIN_BYTES, MIN_WIDTH };
