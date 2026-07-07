"use client";

import { motion } from "framer-motion";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { CafeData } from "@/types/cafe";
import {
  heroObjectPositionClass,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";

type HeroProps = {
  data: Pick<
    CafeData,
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

  return (
    <section className="cafe-hero">
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 0.1, 0.25, 1] }}
        className="cafe-hero-media"
      >
        <FlexibleImageFill
          src={heroImage}
          alt={`${store.name}の店内`}
          priority
          className={`cafe-image-fill ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-[var(--cafe-warm)]" : ""}`}
          sizes="100vw"
        />
        {heroImageIsSample ? (
          <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
        ) : null}
      </motion.div>

      <div className="cafe-hero-overlay" aria-hidden />
      <div className="cafe-hero-veil" aria-hidden />

      <div className="cafe-hero-content">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="cafe-hero-top"
        >
          <span className="cafe-hero-location">{store.location}</span>
          <div className="cafe-hero-actions">
            <CafeLink href={store.reservationUrl} variant="hero" label="ご予約" />
            <CafeLink
              href={store.instagramUrl}
              variant="hero"
              label="Instagram"
              sublabel={store.instagramHandle}
              external
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="cafe-hero-bottom"
        >
          {store.heroMessage ? (
            <p className="cafe-hero-message">{store.heroMessage}</p>
          ) : null}
          <h1 className="cafe-hero-name">{store.name}</h1>
          <p className="cafe-hero-tagline">{store.tagline}</p>
          <p className="cafe-hero-name-en">{store.nameEn}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="cafe-hero-scroll"
        aria-hidden
      >
        <span>Scroll</span>
        <div className="cafe-hero-scroll-line" />
      </motion.div>
    </section>
  );
}
