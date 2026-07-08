import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { izakayaGalleryClass } from "@/components/templates/izakaya-casual/izakaya-mosaic";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualGalleryImage } from "@/types/izakaya-casual";

type PhotoGalleryProps = {
  galleryImages: IzakayaCasualGalleryImage[];
};

type GalleryLayout = "featured" | "grid" | "mosaic";

function resolveGalleryLayout(count: number): GalleryLayout {
  if (count <= 3) return "featured";
  if (count <= 6) return "grid";
  return "mosaic";
}

function featuredLayoutClass(count: number): string {
  if (count === 1) return "izk-gallery-featured izk-gallery-featured--1";
  if (count === 2) return "izk-gallery-featured izk-gallery-featured--2";
  return "izk-gallery-featured izk-gallery-featured--3";
}

function featuredCellClass(index: number, count: number): string {
  if (count === 3 && index === 0) return "izk-gallery-featured-cell--hero";
  return "";
}

function galleryImageSizes(
  layout: GalleryLayout,
  count: number,
  index: number
): string {
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
  image: IzakayaCasualGalleryImage;
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
          className="izk-image-fill object-cover"
          sizes={sizes}
        />
        {image.isSample ? (
          <SampleLabel className="demo-sample-label--image" />
        ) : null}
      </figure>
      {image.caption ? (
        <figcaption
          className={`izk-gallery-caption ${captionCenter ? "izk-gallery-caption--center" : ""}`}
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
    <IzakayaSection id="gallery" wide>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 md:px-12 lg:px-16">
        <IzakayaSectionHeading
          label="Gallery"
          title="ギャラリー"
          subtitle="あつい皿と、にぎやかな夜の気配"
        />
      </div>

      <div
        className={`izk-gallery-wrap ${layout === "mosaic" ? "izk-gallery-wrap--mosaic" : "izk-gallery-wrap--grid"}`}
      >
        {layout === "featured" ? (
          <StaggerContainer className={featuredLayoutClass(count)}>
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.src}
                image={image}
                sizes={galleryImageSizes(layout, count, index)}
                cellClassName={`izk-gallery-featured-cell ${featuredCellClass(index, count)}`}
                captionCenter
              />
            ))}
          </StaggerContainer>
        ) : layout === "grid" ? (
          <StaggerContainer
            className={`izk-gallery-grid izk-gallery-grid--${count}`}
          >
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.src}
                image={image}
                sizes={galleryImageSizes(layout, count, index)}
                cellClassName="izk-gallery-grid-cell"
                captionCenter
              />
            ))}
          </StaggerContainer>
        ) : (
          <StaggerContainer className="izk-gallery-mosaic">
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.src}
                image={image}
                sizes={galleryImageSizes(layout, count, index)}
                cellClassName={`izk-gallery-cell ${izakayaGalleryClass(index)}`}
              />
            ))}
          </StaggerContainer>
        )}
      </div>
    </IzakayaSection>
  );
}
