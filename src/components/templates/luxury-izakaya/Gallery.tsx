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
          title="静寂に包まれる空間"
          subtitle="灯りと余白が、会話の温度をつくります"
        />
        <p className="luxury-space-lead">
          素材の香り、木の温もり、灯りの揺らぎ。
          <br className="hidden sm:inline" />
          お客様をお迎えする空間の一端をご覧ください。
        </p>
      </div>

      <StaggerContainer className="luxury-mosaic luxury-mosaic--space luxury-mosaic--overlap mt-8 px-2 sm:mt-10 sm:px-4 md:px-5 lg:mt-8 lg:px-6">
        {interiorSpaceImages.map((image, index) => (
          <StaggerItem key={image.src} className={luxurySpaceClass(index)}>
            <figure className="luxury-mosaic-cell atm-photo-frame">
              <FlexibleImageFill
                src={image.src}
                alt={image.alt}
                className="luxury-image-fill atm-photo"
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
