"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { galleryImages } from "@/data/luxury-izakaya";

function GalleryItem({
  image,
  index,
  onClick,
}: {
  image: (typeof galleryImages)[0];
  index: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.05]);

  const isHero = index === 0;

  return (
    <FadeIn delay={index * 0.1} zoom className={isHero ? "md:col-span-2" : ""}>
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`group relative block w-full overflow-hidden ${
          isHero ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[4/5]"
        }`}
      >
        <motion.div style={{ scale }} className="absolute inset-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="cinematic-image object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]"
            sizes={isHero ? "100vw" : "50vw"}
          />
        </motion.div>
        <div className="image-warm-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/15" />
      </button>
    </FadeIn>
  );
}

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="section-luxury">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16">
        <SectionHeading label="Space" title="店内" subtitle="灯りと木の温もり" />

        <div className="mt-20 grid grid-cols-1 gap-5 sm:mt-28 sm:gap-6 md:grid-cols-2">
          {galleryImages.map((image, index) => (
            <GalleryItem
              key={image.src}
              image={image}
              index={index}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/92 p-6 backdrop-blur-md"
            onClick={() => setActiveIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/3] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={galleryImages[activeIndex].src}
                alt={galleryImages[activeIndex].alt}
                fill
                className="cinematic-image object-contain"
                sizes="90vw"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-6 top-6 font-en text-[10px] italic tracking-[0.4em] text-washi/40 transition-colors hover:text-washi/70"
              aria-label="閉じる"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
