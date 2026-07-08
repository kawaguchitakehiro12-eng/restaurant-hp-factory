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

  return (
    <section className="bar-hero">
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 0.1, 0.25, 1] }}
        className="bar-hero-media"
      >
        <FlexibleImageFill
          src={heroImage}
          alt={`${store.name}のバー`}
          priority
          className={`bar-image-fill ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-[var(--bar-brown)]" : ""}`}
          sizes="100vw"
        />
        {heroImageIsSample ? (
          <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
        ) : null}
      </motion.div>

      <div className="bar-hero-overlay" aria-hidden />
      <div className="bar-hero-veil" aria-hidden />
      <div className="bar-hero-accent" aria-hidden />

      <div className="bar-hero-content">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
          className="bar-hero-top"
        >
          <span className="bar-hero-location">{store.location}</span>
          <div className="bar-hero-actions">
            <BarLink href={store.reservationUrl} variant="hero" label="ご予約" />
            <BarLink
              href={store.instagramUrl}
              variant="hero"
              label="Instagram"
              external
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.5 }}
          className="bar-hero-bottom"
        >
          {store.heroCopy.length > 0 ? (
            <div className="bar-hero-copy">
              {store.heroCopy.map((line) => (
                <p key={line} className="bar-hero-copy-line">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
          <h1 className="bar-hero-name">{store.name}</h1>
          <p className="bar-hero-tagline">{store.tagline}</p>
          <p className="bar-hero-name-en">{store.nameEn}</p>
          <div className="bar-hero-reserve">
            <BarLink
              href={store.reservationUrl}
              variant="gold"
              label="席のご予約"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="bar-hero-scroll"
        aria-hidden
      >
        <span>Scroll</span>
        <div className="bar-hero-scroll-line" />
      </motion.div>
    </section>
  );
}
