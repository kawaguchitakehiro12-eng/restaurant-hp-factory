import { BrandImage } from "@/components/ui/BrandImage";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GalleryImage } from "@/types/luxury-izakaya";

type PhotoShowcaseProps = {
  photoShowcaseImages: GalleryImage[];
};

export function PhotoShowcase({ photoShowcaseImages }: PhotoShowcaseProps) {
  if (photoShowcaseImages.length === 0) return null;

  return (
    <Section id="photos" className="bg-brown-dark/30">
      <SectionHeading
        label="Photos"
        title="写真"
        subtitle="店舗の雰囲気"
        light
      />

      <StaggerContainer className="mt-14 grid grid-cols-2 gap-3 sm:mt-20 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {photoShowcaseImages.map((image) => (
          <StaggerItem key={image.src}>
            <div className="relative">
              <BrandImage
                src={image.src}
                alt={image.alt}
                aspectClass="aspect-[16/9]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="gap-0"
              />
              {image.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}
