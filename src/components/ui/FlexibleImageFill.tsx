"use client";
import {useState} from "react";
import Image from "next/image";
import { shouldUseNativeImg } from "@/lib/images/image-src";

type FlexibleImageFillProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  background?: boolean;
};

/** data URL / 未許可ドメイン / 許可済みリモート URL に対応した fill 画像 */
export function FlexibleImageFill({
  src,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
  background = false,
}: FlexibleImageFillProps) {
  const [failedSource,setFailedSource]=useState<string|null>(null);
  const fallback=background?"/branding/hero-placeholder.svg":"/branding/photo-unavailable.svg";
  const isPlaceholder=!src||failedSource===src||(background&&src==="/branding/site-placeholder.svg");
  const resolved=isPlaceholder?fallback:src;
  const displayAlt=background&&isPlaceholder?"":alt;
  const handleError=()=>setFailedSource(src);

  if (shouldUseNativeImg(resolved)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img onError={handleError} src={resolved} alt={displayAlt} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }

  return (
    <Image
      onError={handleError}
      src={resolved}
      alt={displayAlt}
      fill
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}
