"use client";

import { motion, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
  zoom?: boolean;
};

const directionOffset = {
  up: { y: 48 },
  down: { y: -48 },
  left: { x: 48 },
  right: { x: -48 },
  none: {},
};

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 1.1,
  once = true,
  zoom = false,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: zoom ? 1.06 : 1,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.18,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  zoom = false,
}: {
  children: ReactNode;
  className?: string;
  zoom?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: zoom ? 1.05 : 1 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxText({
  children,
  className = "",
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40 * speed, -40 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
