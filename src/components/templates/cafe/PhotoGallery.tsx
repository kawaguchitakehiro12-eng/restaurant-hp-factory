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

type GalleryLayout = "featured" | "grid" | "mosaic";

function resolveGalleryLayout(count: number): GalleryLayout {
  if (count <= 3) return "featured";
  if (count <= 6) return "grid";
  return "mosaic";
}

function featuredLayoutClass(count: number): string {
  if (count === 1) return "cafe-gallery-featured cafe-gallery-featured--1";
  if (count === 2) return "cafe-gallery-featured cafe-gallery-featured--2";
  return "cafe-gallery-featured cafe-gallery-featured--3";
}

function featuredCellClass(index: number, count: number): string {
  if (count === 3 && index === 0) return "cafe-gallery-featured-cell--hero";
  return "";
}

function galleryImageSizes(layout: GalleryLayout, count: number, index: number): string {
  if (layout === "mosaic") return "(max-width: 768px) 50vw, 33vw";
  if (layout === "grid") return "(max-width: 768px) 50vw, 18rem";
  if (count === 1) return "(max-width: 768px) 100vw, 56rem";
  if (count === 2) return "(max-width: 768px) 100vw, 24rem";
  if (count === 3 && index === 0) return "(max-width: 768px) 100vw, 56rem";
  return "(max-width: 768px) 50vw, 24rem";
}

function GalleryImage({
  image,
  sizes,
  cellClassName,
  captionCenter = false,
}: {
  image: CafeGalleryImage;
  sizes: string;
  cellClassName: string;
  captionCenter?: boolean;
}) {
  return (
    <StaggerItem>
      <figure className={cellClassName}>
        <FlexibleImageFill
          src={image.src}
          alt={image.alt}
          className="cafe-image-fill object-cover"
          sizes={sizes}
        />
        {image.isSample ? (
          <SampleLabel className="demo-sample-label--image" />
        ) : null}
      </figure>
      {image.caption ? (
        <figcaption
          className={`cafe-gallery-caption ${captionCenter ? "cafe-gallery-caption--center" : ""}`}
        >
          {image.caption}
        </figcaption>
      ) : null}
    </StaggerItem>
  );
}

export function PhotoGallery({ galleryImages, interior }: PhotoGalleryProps) {
  if (galleryImages.length === 0 && !interior.image) return null;

  const count = galleryImages.length;
  const layout = resolveGalleryLayout(count);

  return (
    <CafeSection id="gallery" wide>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 md:px-12 lg:px-16">
        <CafeSectionHeading
          label="Gallery"
          title="ギャラリー"
          subtitle="日常に、小さな特別を"
        />

        {interior.image ? (
          <div className="cafe-gallery-intro">
            <FadeIn direction="left">
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

            <FadeIn direction="right" delay={0.08} className="cafe-gallery-intro-text">
              <h3 className="cafe-gallery-intro-title">{interior.title}</h3>
              <p className="cafe-gallery-intro-desc">{interior.description}</p>
              <div className="cafe-gallery-features">
                {interior.features.map((feature) => (
                  <p key={feature} className="cafe-gallery-feature">
                    — {feature}
                  </p>
                ))}
              </div>
            </FadeIn>
          </div>
        ) : null}
      </div>

      {count > 0 ? (
        <div
          className={`cafe-gallery-wrap ${layout === "mosaic" ? "cafe-gallery-wrap--mosaic" : "cafe-gallery-wrap--grid"}`}
        >
          {layout === "featured" ? (
            <StaggerContainer className={featuredLayoutClass(count)}>
              {galleryImages.map((image, index) => (
                <GalleryImage
                  key={image.src}
                  image={image}
                  sizes={galleryImageSizes(layout, count, index)}
                  cellClassName={`cafe-gallery-featured-cell ${featuredCellClass(index, count)}`}
                  captionCenter
                />
              ))}
            </StaggerContainer>
          ) : layout === "grid" ? (
            <StaggerContainer
              className={`cafe-gallery-grid cafe-gallery-grid--${count}`}
            >
              {galleryImages.map((image, index) => (
                <GalleryImage
                  key={image.src}
                  image={image}
                  sizes={galleryImageSizes(layout, count, index)}
                  cellClassName="cafe-gallery-grid-cell"
                  captionCenter
                />
              ))}
            </StaggerContainer>
          ) : (
            <StaggerContainer className="cafe-gallery-mosaic">
              {galleryImages.map((image, index) => (
                <GalleryImage
                  key={image.src}
                  image={image}
                  sizes={galleryImageSizes(layout, count, index)}
                  cellClassName={`cafe-gallery-cell ${cafeGalleryClass(index)}`}
                />
              ))}
            </StaggerContainer>
          )}
        </div>
      ) : null}
    </CafeSection>
  );
}
