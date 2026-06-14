import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { CafeImage } from "@/components/templates/cafe/ui/CafeImage";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeGalleryImage } from "@/types/cafe";

type PhotoGalleryProps = {
  galleryImages: CafeGalleryImage[];
};

export function PhotoGallery({ galleryImages }: PhotoGalleryProps) {
  return (
    <CafeSection id="gallery" cream>
      <CafeSectionHeading
        label="Gallery"
        title="フォトギャラリー"
        subtitle="日常に、小さな特別を"
      />

      <StaggerContainer className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:gap-10">
        {galleryImages.map((image, index) => (
          <StaggerItem
            key={image.src}
            className={index === 0 ? "sm:col-span-2" : ""}
          >
            <CafeImage
              src={image.src}
              alt={image.alt}
              caption={image.caption}
              aspectClass={
                index === 0 ? "aspect-[16/10] sm:aspect-[21/9]" : "aspect-square"
              }
              sizes={index === 0 ? "100vw" : "50vw"}
              rounded
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </CafeSection>
  );
}
