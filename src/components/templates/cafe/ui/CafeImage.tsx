import Image from "next/image";

type CafeImageProps = {
  src: string;
  alt: string;
  aspectClass?: string;
  caption?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  rounded?: boolean;
};

export function CafeImage({
  src,
  alt,
  aspectClass = "aspect-[4/5]",
  caption,
  sizes = "100vw",
  priority = false,
  className = "",
  rounded = false,
}: CafeImageProps) {
  return (
    <figure className={`flex flex-col gap-4 sm:gap-5 ${className}`}>
      <div
        className={`relative overflow-hidden ${aspectClass} ${rounded ? "rounded-sm" : ""}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="cafe-image object-cover"
          sizes={sizes}
        />
      </div>
      {caption && (
        <figcaption className="text-[12px] leading-[1.9] tracking-[0.06em] text-[var(--cafe-muted)] sm:text-[13px]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
