"use client";

import {OptionalContactLink} from '@/components/public/OptionalContactLink';
import { useEffect, useState } from "react";
import type { BarStore } from "@/types/bar";

type MobileCtaProps = {
  store: BarStore;
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
      className={`bar-mobile-cta ${hidden ? "bar-mobile-cta--hidden" : ""}`}
      aria-label="モバイルクイックアクション"
    >
      <OptionalContactLink href={phoneHref} phone className="bar-mobile-cta-link">
        <span className="bar-mobile-cta-kicker">Call</span>
        <span>電話</span>
      </OptionalContactLink>
      <OptionalContactLink
        href={store.reservationUrl}
        className="bar-mobile-cta-link bar-mobile-cta-link--primary"
      >
        <span className="bar-mobile-cta-kicker">Reserve</span>
        <span>予約</span>
      </OptionalContactLink>
      <OptionalContactLink href={store.mapEmbedUrl?"#access":undefined} className="bar-mobile-cta-link">
        <span className="bar-mobile-cta-kicker">Access</span>
        <span>案内</span>
      </OptionalContactLink>
    </nav>
  );
}
