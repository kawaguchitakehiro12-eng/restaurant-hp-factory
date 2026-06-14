"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  sizes?: string;
  priority?: boolean;
  scaleRange?: [number, number];
  yRange?: [string, string];
};

export function ParallaxImage({
  src,
  alt,
  className = "",
  aspectClass = "aspect-[4/5]",
  sizes = "100vw",
  priority = false,
  scaleRange = [1.08, 1],
  yRange = ["-6%", "6%"],
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const y = useTransform(scrollYProgress, [0, 1], yRange);

  return (
    <div ref={ref} className={`relative overflow-hidden ${aspectClass} ${className}`}>
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="cinematic-image object-cover"
          sizes={sizes}
        />
      </motion.div>
      <div className="image-warm-overlay absolute inset-0" aria-hidden />
      <div className="absolute inset-0 ring-1 ring-inset ring-gold/10" />
    </div>
  );
}
