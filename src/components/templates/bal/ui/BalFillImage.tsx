import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";

type BalFillImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** 親要素は position: relative と高さ（aspect-ratio 等）を必ず持つこと */
export function BalFillImage({
  src,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
}: BalFillImageProps) {
  return (
    <div className="bal-fill-abs" style={{ position: "absolute", inset: 0 }}>
      <FlexibleImageFill
        src={src}
        alt={alt}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
