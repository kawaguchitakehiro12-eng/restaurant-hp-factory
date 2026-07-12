import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { IzakayaCasualGalleryImage } from "@/types/izakaya-casual";

type PhotoGalleryProps = {
  galleryImages: IzakayaCasualGalleryImage[];
};

export function PhotoGallery({ galleryImages }: PhotoGalleryProps) {
  if (galleryImages.length === 0) return null;

  return (
    <section id="gallery" className="izk-section izk-section--gallery">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
        <p className="izk-gallery-kicker">Photo</p>
      </div>

      <StaggerContainer className="izk-insta-grid">
        {galleryImages.map((image) => (
          <StaggerItem key={image.src}>
            <figure className="izk-insta-cell">
              <FlexibleImageFill
                src={image.src}
                alt={image.alt}
                className="izk-image-fill object-cover"
                sizes="(max-width: 640px) 33vw, 280px"
              />
              {image.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
