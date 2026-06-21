"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";
import {
  heroObjectPositionClass,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";

type HeroProps = {
  data: Pick<
    LuxuryIzakayaData,
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
  const heroObjectPosition = normalizeHeroObjectPosition(data.heroObjectPosition);
  const fitClass = heroFit === "contain" ? "object-contain" : "object-cover";
  const positionClass = heroObjectPositionClass(heroObjectPosition);
  const verticalLine = store.heroCopy[0] ?? "";

  return (
    <section className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 0.1, 0.25, 1] }}
          className="relative h-full w-full"
        >
          <FlexibleImageFill
            src={heroImage}
            alt={`${store.name}の店内`}
            priority
            className={`luxury-hero-image ${fitClass} ${positionClass}${heroFit === "contain" ? " bg-ink" : ""}`}
            sizes="100vw"
          />
          {heroImageIsSample ? (
            <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
          ) : null}
        </motion.div>
      </div>

      <div className="hero-overlay absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />

      {verticalLine ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="luxury-hero-vertical"
          aria-hidden
        >
          <p>{verticalLine}</p>
        </motion.div>
      ) : null}

      <div className="luxury-hero-inner">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="flex flex-col items-center"
        >
          <h1 className="luxury-hero-name">{store.name}</h1>
          <p className="luxury-hero-name-en">{store.nameEn}</p>
          {store.tagline ? (
            <p className="luxury-hero-tagline">{store.tagline}</p>
          ) : null}
          <Link href={store.reservationUrl} className="luxury-hero-cta">
            御予約
          </Link>
        </motion.div>
      </div>

      <div className="luxury-hero-scroll" aria-hidden>
        <span>Scroll</span>
        <span />
      </div>
    </section>
  );
}
