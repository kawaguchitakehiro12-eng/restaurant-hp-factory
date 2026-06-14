"use client";

import { useEffect, useState } from "react";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import type { CafeStore } from "@/types/cafe";

type CtaBarProps = {
  store: CafeStore;
};

export function DesktopCta({ store }: CtaBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-8 right-6 z-50 hidden flex-col items-end gap-3 transition-opacity duration-400 lg:flex ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <CafeLink href={store.reservationUrl} variant="hero" label="ご予約" />
      <CafeLink
        href={store.instagramUrl}
        variant="hero"
        label="Instagram"
        sublabel={store.instagramHandle}
      />
    </div>
  );
}

export function MobileCtaBar({ store }: CtaBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-[var(--cafe-cream)] bg-[var(--cafe-white)]/98 backdrop-blur-sm transition-transform duration-400 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex">
        <CafeLink href={store.reservationUrl} variant="mobile-bar" label="ご予約" />
        <CafeLink href={store.instagramUrl} variant="instagram" />
      </div>
    </div>
  );
}
