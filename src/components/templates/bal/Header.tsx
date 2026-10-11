"use client";

import { useEffect, useState } from "react";
import { balNavItems } from "@/components/templates/bal/nav";
import type { BalStore } from "@/types/bal";

type HeaderProps = {
  store: BalStore;
};

export function Header({ store }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
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
      <header className={`bal-header ${scrolled ? "bal-header--scrolled" : ""}`}>
        <div className="bal-header-inner">
          <a href="#" className="bal-logo" aria-label={`${store.name} トップへ`}>
            {store.name}
          </a>

          <nav className="bal-nav" aria-label="メインナビゲーション">
            {balNavItems.map((item) => (
              <a key={item.href} href={item.href} className="bal-nav-link">
                {item.en}
                <span>{item.ja}</span>
              </a>
            ))}
          </nav>

          <a href={store.reservationUrl} className="bal-btn bal-btn--bordeaux bal-header-cta">
            予約する
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`bal-burger ${menuOpen ? "bal-burger--open" : ""}`}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`bal-drawer ${menuOpen ? "bal-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="bal-drawer-nav" aria-label="モバイルナビゲーション">
          {balNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              {item.en}
              <span>{item.ja}</span>
            </a>
          ))}
        </nav>
        <a
          href={store.reservationUrl}
          className="bal-btn bal-btn--bordeaux bal-drawer-cta"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        >
          席を予約する
        </a>
      </div>
    </>
  );
}
