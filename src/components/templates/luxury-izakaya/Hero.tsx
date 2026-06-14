"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ReserveLink } from "@/components/ui/ReserveLink";
import { heroImage, store } from "@/data/luxury-izakaya";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], ["0%", "8%"]);

  return (
    <section ref={ref} className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden">
      <motion.div
        style={{ scale: imageScale, y: imageY }}
        className="absolute inset-[-5%]"
      >
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full"
        >
          <Image
            src={heroImage}
            alt="宵月の店内"
            fill
            priority
            className="cinematic-image object-cover"
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      <div className="hero-cinematic-overlay absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="film-grain absolute inset-0" />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex h-full flex-col px-6 pb-10 pt-28 sm:px-10 sm:pb-14 sm:pt-32 md:px-16 lg:px-20"
      >
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start justify-between"
        >
          <div className="flex flex-col gap-2">
            <span className="font-en text-[10px] italic tracking-[0.4em] text-gold/50 sm:text-[11px]">
              {store.location}
            </span>
            <span className="font-mincho text-[10px] tracking-[0.5em] text-washi/40">
              {store.exclusivity}
            </span>
          </div>

          <div className="hidden md:block">
            <ReserveLink href={store.reservationUrl} variant="hero" />
          </div>
        </motion.div>

        <div className="flex flex-1 items-center justify-center md:justify-end md:pr-8 lg:pr-16">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center md:items-end"
          >
            <div
              className="flex flex-col gap-5 sm:gap-7"
              style={{ writingMode: "vertical-rl" }}
            >
              {store.heroCopy.map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.9 + i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="font-mincho text-lg leading-[2.4] tracking-[0.55em] text-washi/85 sm:text-xl md:text-2xl lg:text-[1.75rem]"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="font-mincho text-[3.5rem] leading-none tracking-[0.3em] text-washi sm:text-7xl md:text-8xl lg:text-[7.5rem]">
              {store.name}
            </h1>
            <p className="mt-4 font-en text-sm italic tracking-[0.6em] text-gold/60 sm:text-base">
              {store.nameEn}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="hidden flex-col items-center gap-4 md:flex"
          >
            <span className="font-en text-[9px] tracking-[0.35em] text-gold/40 [writing-mode:vertical-rl]">
              SCROLL
            </span>
            <motion.span
              animate={{ scaleY: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              className="h-20 w-px origin-top bg-gradient-to-b from-gold/50 to-transparent"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 md:hidden"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="h-10 w-px bg-gradient-to-b from-gold/40 to-transparent"
        />
        <span className="font-en text-[8px] tracking-[0.35em] text-gold/35">SCROLL</span>
      </motion.div>
    </section>
  );
}
