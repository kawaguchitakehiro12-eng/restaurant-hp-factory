import Image from "next/image";
import { isInlineImageSrc } from "@/lib/images/image-src";

type FlexibleImageFillProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** data URL と remote URL の両方に対応した fill 画像 */
export function FlexibleImageFill({
  src,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
}: FlexibleImageFillProps) {
  if (!src) return null;

  if (isInlineImageSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}
