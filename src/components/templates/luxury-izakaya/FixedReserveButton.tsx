"use client";

import { useEffect, useState } from "react";
import { ReserveLink } from "@/components/ui/ReserveLink";
import type { StoreInfo } from "@/types/luxury-izakaya";

type FixedReserveProps = {
  store: StoreInfo;
};

export function FixedReserveButton({ store }: FixedReserveProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-8 right-6 z-50 hidden transition-opacity duration-500 lg:block ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ReserveLink href={store.reservationUrl} variant="hero" className="items-end" />
    </div>
  );
}

export function MobileReserveBar({ store }: FixedReserveProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-gold/15 transition-transform duration-500 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <ReserveLink href={store.reservationUrl} variant="mobile-bar" />
    </div>
  );
}
