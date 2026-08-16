"use client";

import { useEffect, useState } from "react";
import { IzakayaLink } from "@/components/templates/izakaya-casual/ui/IzakayaLink";
import type { IzakayaCasualStore } from "@/types/izakaya-casual";

const navItems = [
  { label: "名物", href: "#specialty" },
  { label: "メニュー", href: "#menu" },
  { label: "宴会", href: "#banquet" },
  { label: "店内", href: "#space" },
  { label: "アクセス", href: "#access" },
];

type HeaderProps = {
  store: IzakayaCasualStore;
};

export function Header({ store }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
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
      <header className={`izk-header ${scrolled ? "izk-header--scrolled" : ""}`}>
        <div className="izk-header-inner">
          <a href="#" className="izk-header-logo">
            {store.name}
          </a>

          <nav className="izk-header-nav" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="izk-header-link">
                {item.label}
              </a>
            ))}
            <IzakayaLink
              href={store.reservationUrl}
              variant="header"
              label="予約"
            />
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`izk-menu-btn ${menuOpen ? "izk-menu-btn--open" : ""}`}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`izk-mobile-menu ${menuOpen ? "" : "izk-mobile-menu--closed"}`}
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
        <IzakayaLink
          href={store.reservationUrl}
          variant="lantern"
          label="席を予約する"
          onClick={() => setMenuOpen(false)}
        />
      </div>
    </>
  );
}
