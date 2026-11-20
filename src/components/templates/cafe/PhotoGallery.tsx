import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { cafeGalleryClass } from "@/components/templates/cafe/cafe-mosaic";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeGalleryImage, CafeInterior } from "@/types/cafe";

type PhotoGalleryProps = {
  galleryImages: CafeGalleryImage[];
  interior: CafeInterior;
};

export function PhotoGallery({ galleryImages, interior }: PhotoGalleryProps) {
  if (galleryImages.length === 0 && !interior.image) return null;

  return (
    <CafeSection id="gallery" tone="ivory" wide bleed>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
        <CafeSectionHeading
          label="GALLERY"
          title="ギャラリー"
          subtitle="日常に、小さな特別を"
          largeEn="Moments"
          align="left"
        />

        {interior.image ? (
          <div className="cafe-gallery-intro">
            <FadeIn className="cafe-gallery-intro-text" direction="up">
              <p className="cafe-gallery-intro-kicker">INTERIOR</p>
              <h3 className="cafe-gallery-intro-title">{interior.title}</h3>
              <p className="cafe-gallery-intro-desc">{interior.description}</p>
              <div className="cafe-gallery-features">
                {interior.features.map((feature) => (
                  <p key={feature} className="cafe-gallery-feature">
                    {feature}
                  </p>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.08} direction="up">
              <figure className="cafe-gallery-intro-photo">
                <FlexibleImageFill
                  src={interior.image}
                  alt={interior.title}
                  className="cafe-image-fill object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                {interior.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>
            </FadeIn>
          </div>
        ) : null}
      </div>

      {galleryImages.length > 0 ? (
        <StaggerContainer className="cafe-gallery-mosaic">
          {galleryImages.map((image, index) => (
            <StaggerItem key={image.src} className={cafeGalleryClass(index)}>
              <figure className="cafe-gallery-cell">
                <FlexibleImageFill
                  src={image.src}
                  alt={image.alt}
                  className="cafe-image-fill object-cover"
                  sizes="(max-width: 768px) 50vw, 40vw"
                />
                {image.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>
              {image.caption ? (
                <figcaption className="cafe-gallery-caption">{image.caption}</figcaption>
              ) : null}
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : null}
    </CafeSection>
  );
}
