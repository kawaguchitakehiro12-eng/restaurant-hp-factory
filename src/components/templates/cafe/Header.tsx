"use client";

import { useEffect, useState } from "react";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import type { CafeStore } from "@/types/cafe";

const navItems = [
  { label: "コンセプト", href: "#concept" },
  { label: "メニュー", href: "#menu" },
  { label: "空間", href: "#interior" },
  { label: "ギャラリー", href: "#gallery" },
  { label: "アクセス", href: "#access" },
];

type HeaderProps = {
  store: CafeStore;
};

export function Header({ store }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
          scrolled
            ? "border-b border-[var(--cafe-cream)] bg-[var(--cafe-white)]/95 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:h-16 sm:px-8">
          <a
            href="#"
            className="font-cafe-display text-lg tracking-[0.08em] text-[var(--cafe-ink)] transition-colors hover:text-[var(--cafe-accent)] sm:text-xl"
          >
            {store.name}
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[11px] tracking-[0.15em] text-[var(--cafe-muted)] transition-colors hover:text-[var(--cafe-ink)]"
              >
                {item.label}
              </a>
            ))}
            <CafeLink href={store.instagramUrl} label="Instagram" />
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span
              className={`h-px w-5 bg-[var(--cafe-ink)] transition-all duration-300 ${
                menuOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-5 bg-[var(--cafe-ink)] transition-all duration-300 ${
                menuOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[var(--cafe-white)]/98 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-lg tracking-[0.15em] text-[var(--cafe-ink)]/80"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col items-center gap-4">
            <CafeLink
              href={store.reservationUrl}
              variant="hero"
              onClick={() => setMenuOpen(false)}
            />
            <CafeLink
              href={store.instagramUrl}
              variant="hero"
              label="Instagram"
              sublabel={store.instagramHandle}
              onClick={() => setMenuOpen(false)}
            />
          </div>
        </nav>
      </div>
    </>
  );
}
