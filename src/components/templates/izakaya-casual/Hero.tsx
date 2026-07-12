"use client";

import { motion } from "framer-motion";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { IzakayaCasualData } from "@/types/izakaya-casual";
import {
  heroObjectPositionClass,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";

type HeroProps = {
  data: Pick<
    IzakayaCasualData,
    | "store"
    | "heroImage"
    | "heroImageIsSample"
    | "heroImageFit"
    | "heroObjectPosition"
  >;
};

export function Hero({ data }: HeroProps) {
  const { store, heroImage, heroImageIsSample } = data;
  const heroFit = normalizeHeroFit(data.heroImageFit);
  const heroObjectPosition = normalizeHeroObjectPosition(
    data.heroObjectPosition
  );
  const fitClass = heroFit === "contain" ? "object-contain" : "object-cover";
  const positionClass = heroObjectPositionClass(heroObjectPosition);
  const catchCopy = store.tagline || "今日も旨い酒と飯を。";

  return (
    <section className="izk-hero">
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 0.1, 0.25, 1] }}
        className="izk-hero-media"
      >
        <FlexibleImageFill
          src={heroImage}
          alt={`${store.name}の料理・店内`}
          priority
          className={`izk-image-fill izk-image-fill--hero ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-[var(--izk-washi)]" : ""}`}
          sizes="100vw"
        />
        {heroImageIsSample ? (
          <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
        ) : null}
      </motion.div>

      <div className="izk-hero-overlay" aria-hidden />

      <div className="izk-hero-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
          className="izk-hero-copy"
        >
          {store.location ? (
            <p className="izk-hero-location">{store.location}</p>
          ) : null}
          <p className="izk-hero-catch">{catchCopy}</p>
          <h1 className="izk-hero-name">{store.name}</h1>
        </motion.div>
      </div>
    </section>
  );
}
