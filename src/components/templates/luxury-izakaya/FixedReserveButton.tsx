"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReserveLink } from "@/components/ui/ReserveLink";
import { store } from "@/data/luxury-izakaya";

export function FixedReserveButton() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [400, 700], [0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-10 right-8 z-50 hidden lg:block"
    >
      <ReserveLink
        href={store.reservationUrl}
        variant="hero"
        className="items-end"
      />
    </motion.div>
  );
}

export function MobileReserveBar() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [500, 800], [0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-8 right-5 z-50 lg:hidden"
    >
      <ReserveLink
        href={store.reservationUrl}
        variant="hero"
        className="items-end"
      />
    </motion.div>
  );
}
