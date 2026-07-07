"use client";

import { useEffect, useState } from "react";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import type { CafeStore } from "@/types/cafe";

const navItems = [
  { label: "Concept", href: "#concept" },
  { label: "Menu", href: "#menu" },
  { label: "Food", href: "#food" },
  { label: "Drink", href: "#drink" },
  { label: "Gallery", href: "#gallery" },
  { label: "News", href: "#news" },
  { label: "Info", href: "#info" },
];

type HeaderProps = {
  store: CafeStore;
};

export function Header({ store }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 48);
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
        className={`cafe-header ${scrolled ? "cafe-header--scrolled" : ""}`}
      >
        <div className="cafe-header-inner">
          <a href="#" className="cafe-header-logo">
            {store.name}
          </a>

          <nav className="cafe-header-nav" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="cafe-header-link">
                {item.label}
              </a>
            ))}
            <CafeLink
              href={store.instagramUrl}
              variant="header"
              label="Instagram"
              external
            />
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`cafe-menu-btn ${menuOpen ? "cafe-menu-btn--open" : ""}`}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`cafe-mobile-menu lg:hidden ${menuOpen ? "" : "cafe-mobile-menu--closed"}`}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <CafeLink
          href={store.reservationUrl}
          variant="hero"
          label="ご予約"
          onClick={() => setMenuOpen(false)}
        />
        <CafeLink
          href={store.instagramUrl}
          variant="hero"
          label="Instagram"
          sublabel={store.instagramHandle}
          external
          onClick={() => setMenuOpen(false)}
        />
      </div>
    </>
  );
}
