import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import { luxurySpaceClass } from "./luxury-mosaic";
import type { GalleryImage } from "@/types/luxury-izakaya";

type GalleryProps = {
  interiorSpaceImages: GalleryImage[];
};

export function Gallery({ interiorSpaceImages }: GalleryProps) {
  if (interiorSpaceImages.length === 0) return null;

  return (
    <LuxurySection id="gallery" wide bleed>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading
          label="Space"
          title="店内・空間"
          subtitle="静けさと灯りが織りなす、食の舞台"
        />
        <p className="luxury-space-lead">
          素材の香り、木の温もり、灯りの揺らぎ。
          <br className="hidden sm:inline" />
          お客様をお迎えする空間の一端をご覧ください。
        </p>
      </div>

      <StaggerContainer className="luxury-mosaic luxury-mosaic--space mt-12 px-3 sm:mt-16 sm:px-5 md:px-8">
        {interiorSpaceImages.map((image, index) => (
          <StaggerItem key={image.src}>
            <figure className={`luxury-mosaic-cell ${luxurySpaceClass(index)}`}>
              <FlexibleImageFill
                src={image.src}
                alt={image.alt}
                className="luxury-image-fill"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {image.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </LuxurySection>
  );
}
