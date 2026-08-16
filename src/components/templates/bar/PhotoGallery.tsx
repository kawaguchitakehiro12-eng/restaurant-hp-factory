import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { barGalleryClass } from "@/components/templates/bar/bar-mosaic";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarGalleryImage } from "@/types/bar";

type PhotoGalleryProps = {
  galleryImages: BarGalleryImage[];
};

export function PhotoGallery({ galleryImages }: PhotoGalleryProps) {
  if (galleryImages.length === 0) return null;

  return (
    <BarSection id="gallery" tone="void" wide bleed>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
        <BarSectionHeading
          label="GALLERY"
          title="ギャラリー"
          subtitle="灯りとグラスが映す、夜の情景"
          largeEn="Night"
          align="left"
        />
      </div>

      <StaggerContainer className="bar-gallery-mosaic">
        {galleryImages.map((image, index) => (
          <StaggerItem key={image.src} className={barGalleryClass(index)}>
            <figure className="bar-gallery-cell">
              <FlexibleImageFill
                src={image.src}
                alt={image.alt}
                className="bar-image-fill object-cover"
                sizes="(max-width: 768px) 50vw, 40vw"
              />
              <div className="bar-photo-grade" aria-hidden />
              <div className="bar-photo-grain" aria-hidden />
              {image.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
            {image.caption ? (
              <figcaption className="bar-gallery-caption">{image.caption}</figcaption>
            ) : null}
          </StaggerItem>
        ))}
      </StaggerContainer>
    </BarSection>
  );
}
