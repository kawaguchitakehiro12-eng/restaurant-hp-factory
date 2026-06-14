"use client";

import Link from "next/link";

type ReserveLinkProps = {
  href: string;
  variant?: "inline" | "hero" | "section" | "mobile-bar";
  className?: string;
  onClick?: () => void;
  label?: string;
  sublabel?: string;
};

export function ReserveLink({
  href,
  variant = "inline",
  className = "",
  onClick,
  label = "御予約",
  sublabel = "完全予約制",
}: ReserveLinkProps) {
  if (variant === "mobile-bar") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group flex h-[3.25rem] items-center justify-center gap-4 bg-ink/96 backdrop-blur-sm ${className}`}
      >
        <span className="font-mincho text-sm tracking-[0.4em] text-washi/90 transition-colors group-active:text-gold">
          {label}
        </span>
        <span className="h-3 w-px bg-gold/30" aria-hidden />
        <span className="font-en text-[10px] italic tracking-[0.3em] text-gold/50">
          Reserve
        </span>
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group inline-flex flex-col items-start gap-2 ${className}`}
      >
        <span className="font-mincho text-[10px] tracking-[0.45em] text-gold/45">
          {sublabel}
        </span>
        <span className="relative font-mincho text-sm tracking-[0.35em] text-washi/85 transition-colors duration-300 group-hover:text-gold">
          {label}
          <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold/50 transition-all duration-500 group-hover:w-full" />
        </span>
      </Link>
    );
  }

  if (variant === "section") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group flex flex-col items-center gap-5 py-6 sm:gap-6 sm:py-8 ${className}`}
      >
        <span className="h-px w-12 bg-gold/25 transition-all duration-500 group-hover:w-20 group-hover:bg-gold/50" />
        <span className="font-mincho text-base tracking-[0.45em] text-ink transition-colors duration-300 group-hover:text-gold sm:text-lg">
          御予約のお問い合わせ
        </span>
        <span className="font-mincho text-[11px] tracking-[0.25em] text-ink-muted/55">
          ご紹介・完全予約制
        </span>
        <span className="h-px w-12 bg-gold/25 transition-all duration-500 group-hover:w-20 group-hover:bg-gold/50" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative font-mincho text-[11px] tracking-[0.3em] text-gold/75 transition-colors duration-300 hover:text-gold ${className}`}
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold/50 transition-all duration-500 group-hover:w-full" />
    </Link>
  );
}
