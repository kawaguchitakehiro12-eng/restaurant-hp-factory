"use client";

import { useEffect, useState } from "react";
import { BarLink } from "@/components/templates/bar/ui/BarLink";
import type { BarStore } from "@/types/bar";

const navItems = [
  { label: "Concept", href: "#concept" },
  { label: "Drinks", href: "#drinks" },
  { label: "Food", href: "#food" },
  { label: "Space", href: "#space" },
  { label: "Gallery", href: "#gallery" },
  { label: "News", href: "#news" },
  { label: "Access", href: "#access" },
];

type HeaderProps = {
  store: BarStore;
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
        className={`bar-header ${scrolled ? "bar-header--scrolled" : ""}`}
      >
        <div className="bar-header-inner">
          <a href="#" className="bar-header-logo">
            {store.name}
          </a>

          <nav className="bar-header-nav" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="bar-header-link">
                {item.label}
              </a>
            ))}
            <BarLink
              href={store.reservationUrl}
              variant="header"
              label="Reserve"
            />
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`bar-menu-btn ${menuOpen ? "bar-menu-btn--open" : ""}`}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`bar-mobile-menu lg:hidden ${menuOpen ? "" : "bar-mobile-menu--closed"}`}
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
        <BarLink
          href={store.reservationUrl}
          variant="gold"
          label="ご予約"
          onClick={() => setMenuOpen(false)}
        />
        <BarLink
          href={store.instagramUrl}
          variant="hero"
          label="Instagram"
          external
          onClick={() => setMenuOpen(false)}
        />
      </div>
    </>
  );
}
