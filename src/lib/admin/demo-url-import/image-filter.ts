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

export function sortByImageSize(a: ImageMeta, b: ImageMeta): number {
  const scoreA = a.byteSize || a.width * a.height || estimatePixelsFromUrl(a.url);
  const scoreB = b.byteSize || b.width * b.height || estimatePixelsFromUrl(b.url);
  return scoreB - scoreA;
}

export { MIN_BYTES, MIN_WIDTH };
