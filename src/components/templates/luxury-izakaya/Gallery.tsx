import { BrandImage } from "@/components/ui/BrandImage";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GalleryImage } from "@/types/luxury-izakaya";

type GalleryProps = {
  galleryImages: GalleryImage[];
};

export function Gallery({ galleryImages }: GalleryProps) {
  return (
    <Section id="gallery">
      <SectionHeading label="Space" title="店内" subtitle="灯りと木の温もり" />

      <StaggerContainer className="mt-14 flex flex-col gap-16 sm:mt-20 sm:gap-20">
        {galleryImages.map((image, index) => (
          <StaggerItem key={image.src}>
            <BrandImage
              src={image.src}
              alt={image.alt}
              caption={image.caption}
              aspectClass={index === 0 ? "aspect-[16/10] sm:aspect-[21/9]" : "aspect-[4/5] sm:aspect-[3/4]"}
              sizes={index === 0 ? "100vw" : "100vw"}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}
