"use client";

import { motion } from "framer-motion";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { CafeData } from "@/types/cafe";

type HeroProps = {
  data: Pick<CafeData, "store" | "heroImage" | "heroImageIsSample">;
};

export function Hero({ data }: HeroProps) {
  const { store, heroImage, heroImageIsSample } = data;

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 relative"
      >
        <FlexibleImageFill
          src={heroImage}
          alt={`${store.name}の店内`}
          priority
          className="cafe-image object-cover object-center"
          sizes="100vw"
        />
        {heroImageIsSample ? (
          <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
        ) : null}
      </motion.div>

      <div className="cafe-hero-overlay absolute inset-0" />

      <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-10 pt-20 sm:px-8 sm:pb-12 sm:pt-24 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-start justify-between"
        >
          <span
            className="text-[10px] font-light tracking-[0.3em] text-[var(--cafe-muted)]"
            style={{ fontFamily: "var(--font-cafe-en)" }}
          >
            {store.location}
          </span>
          <div className="hidden sm:flex sm:gap-6">
            <CafeLink href={store.reservationUrl} variant="hero" label="ご予約" />
            <CafeLink
              href={store.instagramUrl}
              variant="hero"
              label="Instagram"
              sublabel={store.instagramHandle}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col gap-4 sm:gap-5"
        >
          <p
            className="font-cafe-display text-[13px] italic tracking-[0.12em] text-[var(--cafe-muted)] sm:text-sm"
          >
            {store.heroMessage}
          </p>
          <h1 className="font-cafe-display text-5xl tracking-[0.06em] text-[var(--cafe-ink)] sm:text-6xl md:text-7xl">
            {store.name}
          </h1>
          <p className="text-[15px] leading-[2] tracking-[0.12em] text-[var(--cafe-ink)]/80 sm:text-base">
            {store.tagline}
          </p>
          <p
            className="text-[10px] tracking-[0.35em] text-[var(--cafe-muted)]"
            style={{ fontFamily: "var(--font-cafe-en)" }}
          >
            {store.nameEn}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex gap-6 sm:hidden"
        >
          <CafeLink href={store.reservationUrl} variant="hero" label="ご予約" />
          <CafeLink href={store.instagramUrl} variant="hero" label="Instagram" />
        </motion.div>
      </div>
    </section>
  );
}
