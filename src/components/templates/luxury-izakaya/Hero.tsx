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

function pickHeroLines(store: LuxuryIzakayaData["store"]) {
  const copies = (store.heroCopy ?? []).map((s) => s.trim()).filter(Boolean);
  const catchLine =
    store.tagline?.trim() || copies[0] || "四季の料理と、選び抜いた一献。";
  const featureLine =
    store.exclusivity?.trim() ||
    store.seats?.trim() ||
    "静寂と灯りがつくる、大人のための和空間。";

  // サブコピーは句読点で分割されていることが多いので、読める一文に組む
  const remaining = copies.filter((line) => line !== catchLine);
  let inviteLine =
    remaining.length >= 2
      ? remaining.slice(0, 2).join("")
      : remaining[0] && !remaining[0].endsWith("、")
        ? remaining[0]
        : "";

  if (!inviteLine || inviteLine.endsWith("、") || inviteLine.length < 8) {
    inviteLine = "一期一会のおもてなしを、御予約で。";
  }

  return { catchLine, featureLine, inviteLine };
}

export function Hero({ data }: HeroProps) {
  const { store, heroImage, heroImageIsSample } = data;
  const heroFit = normalizeHeroFit(data.heroImageFit);
  const heroObjectPosition = normalizeHeroObjectPosition(data.heroObjectPosition);
  const fitClass = heroFit === "contain" ? "object-contain" : "object-cover";
  const positionClass = heroObjectPositionClass(heroObjectPosition);
  const verticalLine = store.heroCopy[0] ?? "";
  const { catchLine, featureLine, inviteLine } = pickHeroLines(store);

  return (
    <section className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 0.1, 0.25, 1] }}
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
          transition={{ duration: 1.2, delay: 0.9 }}
          className="luxury-hero-vertical"
          aria-hidden
        >
          <p>{verticalLine}</p>
        </motion.div>
      ) : null}

      <div className="luxury-hero-inner">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.3 }}
          className="luxury-hero-copy"
        >
          <h1 className="luxury-hero-name">{store.name}</h1>
          <p className="luxury-hero-name-en">{store.nameEn}</p>

          <div className="luxury-hero-story">
            <p className="luxury-hero-catch">{catchLine}</p>
            <p className="luxury-hero-feature">{featureLine}</p>
            <p className="luxury-hero-invite">{inviteLine}</p>
          </div>

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
