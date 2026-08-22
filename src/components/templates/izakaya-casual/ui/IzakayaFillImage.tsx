import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";

type IzakayaFillImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * next/image `fill` の直接親を常に positioned にする。
 * テンプレート CSS の読み込み前でも invalid position / height:0 警告を防ぐ。
 */
export function IzakayaFillImage({
  src,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
}: IzakayaFillImageProps) {
  return (
    <div className="izk-fill-abs" style={{ position: "absolute", inset: 0 }}>
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
