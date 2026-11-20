import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";

type BrandImageProps = {
  src: string;
  alt: string;
  aspectClass?: string;
  caption?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function BrandImage({
  src,
  alt,
  aspectClass = "aspect-[4/5]",
  caption,
  sizes = "100vw",
  priority = false,
  className = "",
}: BrandImageProps) {
  return (
    <figure className={`flex flex-col gap-5 sm:gap-6 ${className}`}>
      <div className={`relative overflow-hidden ${aspectClass}`}>
        <FlexibleImageFill
          src={src}
          alt={alt}
          priority={priority}
          className="brand-image object-cover"
          sizes={sizes}
        />
      </div>
      {caption && (
        <figcaption className="font-mincho text-xs leading-[2] tracking-[0.15em] text-ink-muted/70 sm:text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
