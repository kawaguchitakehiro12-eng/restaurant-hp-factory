"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
};

const directionOffset = {
  up: { y: 12 },
  down: { y: -12 },
  left: { x: 12 },
  right: { x: -12 },
  none: {},
};

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.85,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 上端に張り付いた見出しが opacity:0 のまま残らないよう、上方向は縮めない
  const isInView = useInView(ref, {
    once,
    margin: "0px 0px -10% 0px",
    amount: 0.12,
  });

  const variants: Variants = {
    hidden: { opacity: 0, ...directionOffset[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.22, 0.12, 0.25, 1] },
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
  staggerDelay = 0.12,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -10% 0px",
    amount: 0.08,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 0.12, 0.25, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
