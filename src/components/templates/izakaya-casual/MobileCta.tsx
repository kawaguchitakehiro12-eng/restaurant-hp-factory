"use client";

import { useEffect, useState } from "react";
import type { IzakayaCasualStore } from "@/types/izakaya-casual";

type MobileCtaProps = {
  store: IzakayaCasualStore;
};

export function MobileCta({ store }: MobileCtaProps) {
  const [hidden, setHidden] = useState(false);
  const phoneHref = store.phone
    ? `tel:${store.phone.replace(/[^\d+]/g, "")}`
    : "#access";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`izk-mobile-cta ${hidden ? "izk-mobile-cta--hidden" : ""}`}
      aria-label="モバイル用ショートカット"
    >
      <a href={phoneHref} className="izk-mobile-cta-link">
        電話
      </a>
      <a
        href={store.reservationUrl}
        className="izk-mobile-cta-link izk-mobile-cta-link--primary"
      >
        予約
      </a>
      <a href="#access" className="izk-mobile-cta-link">
        地図
      </a>
    </div>
  );
}
