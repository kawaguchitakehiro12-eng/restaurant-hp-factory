"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoreInfo } from "@/types/luxury-izakaya";

type FixedReserveProps = {
  store: StoreInfo;
};

/** Desktop floating reserve — hairline, no heavy chrome */
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
      <Link
        href={store.reservationUrl}
        className="inline-flex border border-[rgba(196,169,98,0.4)] bg-[rgba(10,9,8,0.88)] px-6 py-3 font-mincho text-xs tracking-[0.32em] text-[rgba(196,169,98,0.9)] backdrop-blur-md transition hover:border-[rgba(196,169,98,0.7)]"
      >
        御予約
      </Link>
    </div>
  );
}

/** Mobile: phone / reserve / access — quiet luxury bar */
export function MobileReserveBar({ store }: FixedReserveProps) {
  const [visible, setVisible] = useState(false);
  const phoneHref = store.phone ? `tel:${store.phone.replace(/[^\d+]/g, "")}` : undefined;

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 360);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`luxury-mobile-cta ${visible ? "" : "luxury-mobile-cta--hidden"}`}
      aria-label="クイックアクション"
    >
      {phoneHref ? (
        <a href={phoneHref} className="luxury-mobile-cta-link">
          <span className="luxury-mobile-cta-kicker">Call</span>
          <span>電話</span>
        </a>
      ) : (
        <span className="luxury-mobile-cta-link opacity-40">
          <span className="luxury-mobile-cta-kicker">Call</span>
          <span>電話</span>
        </span>
      )}

      <Link href={store.reservationUrl} className="luxury-mobile-cta-link luxury-mobile-cta-link--primary">
        <span className="luxury-mobile-cta-kicker">Reserve</span>
        <span>予約</span>
      </Link>

      <a href="#map" className="luxury-mobile-cta-link">
        <span className="luxury-mobile-cta-kicker">Access</span>
        <span>案内</span>
      </a>
    </nav>
  );
}
