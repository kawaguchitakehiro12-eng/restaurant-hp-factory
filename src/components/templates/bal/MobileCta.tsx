"use client";

import { useEffect, useState } from "react";
import { telHref } from "@/components/templates/bal/nav";
import type { BalStore } from "@/types/bal";

type MobileCtaProps = {
  store: BalStore;
};

export function MobileCta({ store }: MobileCtaProps) {
  const [hidden, setHidden] = useState(false);
  const tel = telHref(store.phone) || "#access";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`bal-mcta ${hidden ? "bal-mcta--hidden" : ""}`}
      aria-label="モバイル用ショートカット"
    >
      <a href={tel} className="bal-mcta-link">
        電話
      </a>
      <a href={store.reservationUrl} className="bal-mcta-link bal-mcta-link--primary">
        席を予約
      </a>
      <a href="#access" className="bal-mcta-link">
        地図
      </a>
    </nav>
  );
}
