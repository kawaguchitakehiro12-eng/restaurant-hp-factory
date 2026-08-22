import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaFillImage } from "@/components/templates/izakaya-casual/ui/IzakayaFillImage";
import {
  guessIzkPhotoFocus,
  izkPhotoFocusClass,
} from "@/components/templates/izakaya-casual/utils/izkPhotoFocus";
import type { IzakayaCasualGalleryImage } from "@/types/izakaya-casual";

type PhotoGalleryProps = {
  galleryImages: IzakayaCasualGalleryImage[];
};

/** Light moments group — compact frames, not specialty-scale */
export function PhotoGallery({ galleryImages }: PhotoGalleryProps) {
  if (galleryImages.length === 0) return null;

  const frames = galleryImages.slice(0, 4);
  const [hero, ...rest] = frames;

  return (
    <IzakayaSection id="gallery" bleed tone="white" className="izk-moments">
      <div className="izk-shell">
        <FadeIn className="izk-moments-head">
          <p className="izk-moments-kicker">MOMENTS</p>
          <h2 className="izk-moments-title">店の空気、ひと息。</h2>
        </FadeIn>
      </div>

      <div className="izk-moments-strip">
        <FadeIn className="izk-moments-cell izk-moments-cell--wide">
          <figure
            className="izk-moments-figure"
            style={{ position: "relative", aspectRatio: "16 / 10" }}
          >
            <IzakayaFillImage
              src={hero.src}
              alt={hero.alt}
              className={`izk-image-fill object-cover ${izkPhotoFocusClass(guessIzkPhotoFocus(hero.alt))}`}
              sizes="(max-width: 800px) 90vw, 42rem"
            />
            <div className="izk-photo-grade" aria-hidden />
            {hero.isSample ? (
              <SampleLabel className="demo-sample-label--image" />
            ) : null}
          </figure>
        </FadeIn>

        {rest.length > 0 ? (
          <div className="izk-moments-side">
            {rest.map((image, index) => (
              <FadeIn
                key={image.src}
                delay={0.04 + index * 0.04}
                className="izk-moments-cell"
              >
                <figure
                  className="izk-moments-figure"
                  style={{ position: "relative", aspectRatio: "3 / 2" }}
                >
                  <IzakayaFillImage
                    src={image.src}
                    alt={image.alt}
                    className={`izk-image-fill object-cover ${izkPhotoFocusClass(guessIzkPhotoFocus(image.alt))}`}
                    sizes="(max-width: 800px) 45vw, 14rem"
                  />
                  <div className="izk-photo-grade" aria-hidden />
                  {image.isSample ? (
                    <SampleLabel className="demo-sample-label--image" />
                  ) : null}
                </figure>
              </FadeIn>
            ))}
          </div>
        ) : null}
      </div>
    </IzakayaSection>
  );
}
