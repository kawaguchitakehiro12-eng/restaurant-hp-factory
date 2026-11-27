"use client";

import {OptionalContactLink} from '@/components/public/OptionalContactLink';
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
      <OptionalContactLink href={phoneHref} phone className="izk-mobile-cta-link">
        電話
      </OptionalContactLink>
      <OptionalContactLink
        href={store.reservationUrl}
        className="izk-mobile-cta-link izk-mobile-cta-link--primary"
      >
        予約
      </OptionalContactLink>
      <OptionalContactLink href={store.mapEmbedUrl?"#access":undefined} className="izk-mobile-cta-link">
        地図
      </OptionalContactLink>
    </div>
  );
}
