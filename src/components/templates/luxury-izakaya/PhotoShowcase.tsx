"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import { LuxurySection } from "./LuxurySection";
import { luxuryGalleryClass } from "./luxury-mosaic";
import type { GalleryImage } from "@/types/luxury-izakaya";

type PhotoShowcaseProps = {
  photoShowcaseImages: GalleryImage[];
};

const PREVIEW_COUNT = 9;

export function PhotoShowcase({ photoShowcaseImages }: PhotoShowcaseProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setLightboxSrc(null);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxSrc) setLightboxSrc(null);
        else closeModal();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, lightboxSrc, closeModal]);

  if (photoShowcaseImages.length === 0) return null;

  const previewImages = photoShowcaseImages.slice(0, PREVIEW_COUNT);
  const hasMore = photoShowcaseImages.length > PREVIEW_COUNT;

  return (
    <>
      <LuxurySection id="photos" className="bg-brown-dark/40" wide bleed>
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
          <LuxurySectionHeading
            label="Gallery"
            title="写真"
            subtitle="店舗の雰囲気"
            light
          />
        </div>

        <StaggerContainer className="luxury-mosaic luxury-mosaic--gallery mt-12 px-3 sm:mt-16 sm:px-5 md:px-8">
          {previewImages.map((image, index) => (
            <StaggerItem key={image.src}>
              <figure className={`luxury-mosaic-cell ${luxuryGalleryClass(index)}`}>
                <FlexibleImageFill
                  src={image.src}
                  alt={image.alt}
                  className="luxury-image-fill"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {image.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {hasMore ? (
          <div className="mt-12 flex justify-center sm:mt-16">
            <button
              type="button"
              className="luxury-photo-grid-btn"
              onClick={() => setModalOpen(true)}
            >
              <span>もっと見る</span>
              <span aria-hidden>—</span>
              <span className="font-en text-[10px] italic tracking-[0.2em] opacity-60">
                {photoShowcaseImages.length} Photos
              </span>
            </button>
          </div>
        ) : null}
      </LuxurySection>

      {modalOpen ? (
        <div
          className="luxury-photo-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="写真ギャラリー"
          onClick={(e) => {
            if (e.target === e.currentTarget && !lightboxSrc) closeModal();
          }}
        >
          <div className="luxury-photo-modal-panel">
            <button
              type="button"
              className="luxury-photo-modal-close"
              onClick={closeModal}
              aria-label="閉じる"
            >
              ×
            </button>
            <LuxurySectionHeading label="Gallery" title="写真一覧" light align="center" />
            <div className="luxury-photo-modal-grid">
              {photoShowcaseImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  className={`luxury-photo-modal-item ${luxuryGalleryClass(index)}`}
                  onClick={() => setLightboxSrc(image.src)}
                  aria-label={image.alt}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="luxury-image-fill"
                    sizes="33vw"
                  />
                  {image.isSample ? (
                    <SampleLabel className="demo-sample-label--image" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {lightboxSrc ? (
        <div
          className="luxury-photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="写真拡大"
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt="" />
        </div>
      ) : null}
    </>
  );
}
