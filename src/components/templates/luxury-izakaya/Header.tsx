"use client";

import { useEffect, useState } from "react";
import { ReserveLink } from "@/components/ui/ReserveLink";
import type { StoreInfo } from "@/types/luxury-izakaya";

const baseNavItems = [
  { label: "紹介", href: "#about" },
  { label: "用途", href: "#occasions" },
  { label: "こだわり", href: "#commitment" },
  { label: "料理", href: "#recommendations" },
  { label: "空間", href: "#gallery" },
];

type HeaderProps = {
  store: StoreInfo;
  showPhotoShowcase?: boolean;
};

export function Header({ store, showPhotoShowcase = false }: HeaderProps) {
  const navItems = showPhotoShowcase
    ? [...baseNavItems, { label: "写真", href: "#photos" }]
    : baseNavItems;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-ink/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:h-16 sm:px-8 md:px-12">
          <a href="#" className="font-mincho text-base tracking-[0.3em] text-washi/90 transition-colors hover:text-gold sm:text-lg">
            {store.name}
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-mincho text-[11px] tracking-[0.25em] text-washi/50 transition-colors hover:text-gold/80"
              >
                {item.label}
              </a>
            ))}
            <ReserveLink href={store.reservationUrl} />
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span
              className={`h-px w-5 bg-washi/80 transition-all duration-300 ${
                menuOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-5 bg-washi/80 transition-all duration-300 ${
                menuOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-ink/96 backdrop-blur-lg transition-opacity duration-400 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-9">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-mincho text-xl tracking-[0.35em] text-washi/75"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4">
            <ReserveLink
              href={store.reservationUrl}
              variant="hero"
              onClick={() => setMenuOpen(false)}
            />
          </div>
        </nav>
      </div>
    </>
  );
}
