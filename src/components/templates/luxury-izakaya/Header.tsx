"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreInfo } from "@/types/luxury-izakaya";

const baseNavItems = [
  { label: "紹介", href: "#about" },
  { label: "こだわり", href: "#commitment" },
  { label: "料理", href: "#recommendations" },
  { label: "空間", href: "#gallery" },
  { label: "情報", href: "#info" },
];

type HeaderProps = {
  store: StoreInfo;
  showPhotoShowcase?: boolean;
};

export function Header({ store, showPhotoShowcase = false }: HeaderProps) {
  const navItems = showPhotoShowcase
    ? [...baseNavItems.slice(0, 4), { label: "写真", href: "#photos" }, ...baseNavItems.slice(4)]
    : baseNavItems;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
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
        className={`luxury-header ${scrolled ? "luxury-header--scrolled" : ""}`}
      >
        <div className="luxury-header-inner">
          <a href="#" className="luxury-header-logo">
            {store.name}
          </a>

          <nav className="luxury-header-nav" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="luxury-header-link">
                {item.label}
              </a>
            ))}
            <Link href={store.reservationUrl} className="luxury-header-reserve">
              御予約
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`luxury-menu-btn ${menuOpen ? "luxury-menu-btn--open" : ""}`}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`luxury-mobile-menu lg:hidden ${menuOpen ? "" : "luxury-mobile-menu--closed"}`}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className="luxury-mobile-menu-link"
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
