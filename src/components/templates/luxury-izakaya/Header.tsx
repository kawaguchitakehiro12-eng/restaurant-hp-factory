"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { ReserveLink } from "@/components/ui/ReserveLink";
import { store } from "@/data/luxury-izakaya";

const navItems = [
  { label: "紹介", href: "#about" },
  { label: "こだわり", href: "#commitment" },
  { label: "料理", href: "#recommendations" },
  { label: "コース", href: "#courses" },
  { label: "空間", href: "#gallery" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 200],
    ["rgba(8, 8, 7, 0)", "rgba(8, 8, 7, 0.88)"]
  );

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
      <motion.header
        style={{ backgroundColor: headerBg }}
        className={`fixed inset-x-0 top-0 z-50 transition-[backdrop-filter] duration-700 ${
          scrolled ? "backdrop-blur-lg" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:h-[4.5rem] sm:px-10 md:px-16">
          <a href="#" className="group flex flex-col gap-0.5">
            <span className="font-mincho text-base tracking-[0.35em] text-washi/90 transition-colors duration-500 group-hover:text-gold sm:text-lg">
              {store.name}
            </span>
          </a>

          <nav className="hidden items-center gap-10 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-mincho text-[11px] tracking-[0.3em] text-washi/50 transition-colors duration-500 hover:text-gold/80"
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
              className={`h-px w-5 bg-washi/80 transition-all duration-500 ${
                menuOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-5 bg-washi/80 transition-all duration-500 ${
                menuOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </motion.header>

      <motion.div
        initial={false}
        animate={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-40 bg-ink/96 backdrop-blur-2xl lg:hidden"
      >
        <nav className="flex h-full flex-col items-center justify-center gap-10">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, y: 24 }}
              animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: menuOpen ? i * 0.08 : 0, duration: 0.5 }}
              className="font-mincho text-2xl tracking-[0.4em] text-washi/70"
            >
              {item.label}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ delay: menuOpen ? 0.5 : 0, duration: 0.5 }}
            className="mt-6"
          >
            <ReserveLink
              href={store.reservationUrl}
              variant="hero"
              onClick={() => setMenuOpen(false)}
            />
          </motion.div>
        </nav>
      </motion.div>
    </>
  );
}
