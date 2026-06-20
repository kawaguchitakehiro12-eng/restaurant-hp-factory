/** next/image 非対応の data URL / blob URL */
export function isInlineImageSrc(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}
