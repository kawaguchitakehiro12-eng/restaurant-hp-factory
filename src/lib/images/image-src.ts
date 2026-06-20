import { isNextImageRemoteAllowed } from "@/lib/images/remote-image-hosts";

/** next/image 非対応の data URL / blob URL */
export function isInlineImageSrc(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

/**
 * next/image ではなく通常の img を使うべきか。
 * - data / blob URL
 * - remotePatterns 未登録の外部ドメイン（ページクラッシュ防止）
 */
export function shouldUseNativeImg(src: string): boolean {
  if (!src) return true;
  if (isInlineImageSrc(src)) return true;
  if (src.startsWith("/")) return false;
  return !isNextImageRemoteAllowed(src);
}
