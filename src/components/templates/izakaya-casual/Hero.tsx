"use client";

import { motion } from "framer-motion";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { IzakayaLink } from "@/components/templates/izakaya-casual/ui/IzakayaLink";
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
  const telHref = store.phone
    ? `tel:${store.phone.replace(/[^\d+]/g, "")}`
    : "";

  return (
    <section className="izk-hero">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.35, ease: [0.22, 0.1, 0.25, 1] }}
        className="izk-hero-media"
      >
        <FlexibleImageFill
          src={heroImage}
          alt={`${store.name}の店内`}
          priority
          className={`izk-image-fill ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-[var(--izk-wood-deep)]" : ""}`}
          sizes="100vw"
        />
        {heroImageIsSample ? (
          <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
        ) : null}
      </motion.div>

      <div className="izk-hero-overlay" aria-hidden />
      <div className="izk-hero-veil" aria-hidden />
      <div className="izk-hero-lantern" aria-hidden />

      <div className="izk-hero-content">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="izk-hero-top"
        >
          <span className="izk-hero-location">{store.location}</span>
          <div className="izk-hero-actions">
            <IzakayaLink
              href={store.reservationUrl}
              variant="hero"
              label="ご予約"
            />
            {telHref ? (
              <IzakayaLink href={telHref} variant="hero" label="電話" />
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="izk-hero-bottom"
        >
          {store.heroMessage ? (
            <p className="izk-hero-message">{store.heroMessage}</p>
          ) : null}
          <h1 className="izk-hero-name">{store.name}</h1>
          <p className="izk-hero-tagline">{store.tagline}</p>
          {store.nameEn ? (
            <p className="izk-hero-name-en">{store.nameEn}</p>
          ) : null}
          <div className="izk-hero-ctas">
            <IzakayaLink
              href={store.reservationUrl}
              variant="lantern"
              label="ご予約"
            />
            {telHref ? (
              <IzakayaLink href={telHref} variant="wood" label="電話する" />
            ) : null}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="izk-hero-scroll"
        aria-hidden
      >
        <span>Scroll</span>
        <div className="izk-hero-scroll-line" />
      </motion.div>
    </section>
  );
}
