"use client";

import { motion } from "framer-motion";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { BarLink } from "@/components/templates/bar/ui/BarLink";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { BarData } from "@/types/bar";
import {
  heroObjectPositionClass,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";

type HeroProps = {
  data: Pick<
    BarData,
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
  const hours = store.hours.dinner;

  return (
    <section className="bar-hero">
      <div className="bar-hero-panel">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="bar-hero-copy-block"
        >
          <p className="bar-hero-location">{store.location}</p>
          <h1 className="bar-hero-name">{store.name}</h1>
          <p className="bar-hero-name-en">{store.nameEn}</p>

          {store.heroCopy.length > 0 ? (
            <div className="bar-hero-copy">
              {store.heroCopy.map((line) => (
                <p key={line} className="bar-hero-copy-line">
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          <p className="bar-hero-tagline">{store.tagline}</p>

          {hours ? (
            <p className="bar-hero-hours">
              <span>OPEN</span>
              <span aria-hidden>—</span>
              <span>{hours}</span>
            </p>
          ) : null}

          <div className="bar-hero-actions">
            <BarLink
              href={store.reservationUrl}
              variant="gold"
              label="席のご予約"
            />
            {store.instagramUrl ? (
              <BarLink
                href={store.instagramUrl}
                variant="hero"
                label="Instagram"
                external
              />
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="bar-hero-media-wrap">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 0.1, 0.25, 1] }}
          className="bar-hero-media"
        >
          <FlexibleImageFill
            src={heroImage}
            alt={`${store.name}のバー`}
            priority
            className={`bar-image-fill bar-image-fill--hero ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-[var(--bar-brown)]" : ""}`}
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          {heroImageIsSample ? (
            <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
          ) : null}
          <div className="bar-hero-media-grade" aria-hidden />
          <div className="bar-hero-media-grain" aria-hidden />
          <div className="bar-hero-media-glow" aria-hidden />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="bar-hero-scroll"
        aria-hidden
      >
        <span>Scroll</span>
        <div className="bar-hero-scroll-line" />
      </motion.div>
    </section>
  );
}
