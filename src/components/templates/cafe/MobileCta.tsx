"use client";

import { useEffect, useState } from "react";
import type { CafeStore } from "@/types/cafe";

type MobileCtaProps = {
  store: CafeStore;
};

export function MobileCta({ store }: MobileCtaProps) {
  const [hidden, setHidden] = useState(false);
  const phoneHref = `tel:${store.phone.replace(/[^\d+-]/g, "")}`;

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`cafe-mobile-cta ${hidden ? "cafe-mobile-cta--hidden" : ""}`}
      aria-label="モバイルクイックアクション"
    >
      <a href={phoneHref} className="cafe-mobile-cta-link">
        <span className="cafe-mobile-cta-kicker">Call</span>
        <span>電話</span>
      </a>
      <a href={store.reservationUrl} className="cafe-mobile-cta-link cafe-mobile-cta-link--primary">
        <span className="cafe-mobile-cta-kicker">Reserve</span>
        <span>予約</span>
      </a>
      <a href="#map" className="cafe-mobile-cta-link">
        <span className="cafe-mobile-cta-kicker">Access</span>
        <span>アクセス</span>
      </a>
    </nav>
  );
}
