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
  const openHours = store.hours.weekday || store.hours.weekend;
  const enLine =
    store.heroMessage?.trim() || "Coffee, food and slow mornings.";

  return (
    <section className="cafe-hero">
      <div className="cafe-hero-panel">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
          className="cafe-hero-copy"
        >
          <p className="cafe-hero-location">{store.location}</p>
          <h1 className="cafe-hero-name">{store.name}</h1>
          <p className="cafe-hero-name-en">{store.nameEn}</p>

          <p className="cafe-hero-en">{enLine}</p>
          <p className="cafe-hero-tagline">{store.tagline}</p>

          {openHours ? (
            <p className="cafe-hero-hours">
              <span>OPEN</span>
              <span aria-hidden>—</span>
              <span>{openHours}</span>
            </p>
          ) : null}

          <div className="cafe-hero-actions">
            <CafeLink href={store.reservationUrl} variant="hero" label="ご予約" />
            {store.instagramUrl ? (
              <CafeLink
                href={store.instagramUrl}
                variant="hero"
                label="Instagram"
                external
              />
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="cafe-hero-media-wrap">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.35, ease: [0.22, 0.1, 0.25, 1] }}
          className="cafe-hero-media"
        >
          <FlexibleImageFill
            src={heroImage}
            alt={`${store.name}の店内`}
            priority
            className={`cafe-image-fill cafe-image-fill--hero ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-[var(--cafe-milk)]" : ""}`}
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          {heroImageIsSample ? (
            <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
          ) : null}
          <div className="cafe-hero-media-grade" aria-hidden />
          <div className="cafe-hero-media-grain" aria-hidden />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="cafe-hero-scroll"
        aria-hidden
      >
        <span>Scroll</span>
        <div className="cafe-hero-scroll-line" />
      </motion.div>
    </section>
  );
}
