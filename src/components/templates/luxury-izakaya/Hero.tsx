"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ReserveLink } from "@/components/ui/ReserveLink";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";

type HeroProps = {
  data: Pick<LuxuryIzakayaData, "store" | "heroImage">;
};

export function Hero({ data }: HeroProps) {
  const { store, heroImage } = data;

  return (
    <section className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative h-full w-full"
        >
          <Image
            src={heroImage}
            alt={`${store.name}の店内`}
            fill
            priority
            className="brand-image object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </div>

      <div className="hero-overlay absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />

      <div className="relative z-10 flex h-full flex-col px-5 pb-8 pt-24 sm:px-8 sm:pb-10 sm:pt-28 md:px-12 md:pb-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-start justify-between"
        >
          <div className="flex flex-col gap-1.5">
            <span className="font-en text-[10px] italic tracking-[0.35em] text-gold/55">
              {store.location}
            </span>
            <span className="font-mincho text-[10px] tracking-[0.4em] text-washi/45">
              {store.exclusivity}
            </span>
          </div>
          <div className="hidden sm:block">
            <ReserveLink href={store.reservationUrl} variant="hero" />
          </div>
        </motion.div>

        <div className="flex flex-1 items-center justify-end pt-6 sm:pt-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex"
            style={{ writingMode: "vertical-rl" }}
          >
            <div className="flex flex-col gap-4 sm:gap-6">
              {store.heroCopy.map((line) => (
                <p
                  key={line}
                  className="font-mincho text-[15px] leading-[2.2] tracking-[0.45em] text-washi/90 sm:text-lg md:text-xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-end justify-between gap-4"
        >
          <div>
            <h1 className="font-mincho text-[2.75rem] leading-none tracking-[0.28em] text-washi sm:text-6xl md:text-7xl lg:text-8xl">
              {store.name}
            </h1>
            <p className="mt-3 font-en text-xs italic tracking-[0.5em] text-gold/55 sm:mt-4 sm:text-sm">
              {store.nameEn}
            </p>
          </div>

          <div className="mb-1 hidden flex-col items-center gap-3 md:flex">
            <span className="font-en text-[8px] tracking-[0.3em] text-gold/35 [writing-mode:vertical-rl]">
              SCROLL
            </span>
            <span className="h-12 w-px bg-gradient-to-b from-gold/35 to-transparent" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 sm:hidden"
        >
          <ReserveLink href={store.reservationUrl} variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
