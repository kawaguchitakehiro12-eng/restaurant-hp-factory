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

type GalleryLayout = "featured" | "grid" | "mosaic";

function resolveGalleryLayout(count: number): GalleryLayout {
  if (count <= 3) return "featured";
  if (count <= 6) return "grid";
  return "mosaic";
}

function featuredLayoutClass(count: number): string {
  if (count === 1) return "bar-gallery-featured bar-gallery-featured--1";
  if (count === 2) return "bar-gallery-featured bar-gallery-featured--2";
  return "bar-gallery-featured bar-gallery-featured--3";
}

function featuredCellClass(index: number, count: number): string {
  if (count === 3 && index === 0) return "bar-gallery-featured-cell--hero";
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
  image: BarGalleryImage;
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
          className="bar-image-fill object-cover"
          sizes={sizes}
        />
        {image.isSample ? (
          <SampleLabel className="demo-sample-label--image" />
        ) : null}
      </figure>
      {image.caption ? (
        <figcaption
          className={`bar-gallery-caption ${captionCenter ? "bar-gallery-caption--center" : ""}`}
        >
          {image.caption}
        </figcaption>
      ) : null}
    </StaggerItem>
  );
}

export function PhotoGallery({ galleryImages }: PhotoGalleryProps) {
  if (galleryImages.length === 0) return null;

  const count = galleryImages.length;
  const layout = resolveGalleryLayout(count);

  return (
    <BarSection id="gallery" wide>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 md:px-12 lg:px-16">
        <BarSectionHeading
          label="Gallery"
          title="ギャラリー"
          subtitle="灯りとグラスが映す、夜の情景"
        />
      </div>

      <div
        className={`bar-gallery-wrap ${layout === "mosaic" ? "bar-gallery-wrap--mosaic" : "bar-gallery-wrap--grid"}`}
      >
        {layout === "featured" ? (
          <StaggerContainer className={featuredLayoutClass(count)}>
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.src}
                image={image}
                sizes={galleryImageSizes(layout, count, index)}
                cellClassName={`bar-gallery-featured-cell ${featuredCellClass(index, count)}`}
                captionCenter
              />
            ))}
          </StaggerContainer>
        ) : layout === "grid" ? (
          <StaggerContainer
            className={`bar-gallery-grid bar-gallery-grid--${count}`}
          >
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.src}
                image={image}
                sizes={galleryImageSizes(layout, count, index)}
                cellClassName="bar-gallery-grid-cell"
                captionCenter
              />
            ))}
          </StaggerContainer>
        ) : (
          <StaggerContainer className="bar-gallery-mosaic">
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.src}
                image={image}
                sizes={galleryImageSizes(layout, count, index)}
                cellClassName={`bar-gallery-cell ${barGalleryClass(index)}`}
              />
            ))}
          </StaggerContainer>
        )}
      </div>
    </BarSection>
  );
}
