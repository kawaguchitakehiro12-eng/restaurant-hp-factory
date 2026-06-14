"use client";

import Link from "next/link";

type ReserveLinkProps = {
  href: string;
  variant?: "inline" | "hero" | "section";
  className?: string;
  onClick?: () => void;
};

export function ReserveLink({
  href,
  variant = "inline",
  className = "",
  onClick,
}: ReserveLinkProps) {
  if (variant === "hero") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group inline-flex flex-col items-start gap-3 ${className}`}
      >
        <span className="font-mincho text-[10px] tracking-[0.5em] text-gold/50">
          完全予約制
        </span>
        <span className="relative font-mincho text-sm tracking-[0.4em] text-washi/80 transition-colors duration-500 group-hover:text-gold">
          御予約
          <span className="absolute -bottom-2 left-0 h-px w-0 bg-gold/60 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
        </span>
      </Link>
    );
  }

  if (variant === "section") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group flex flex-col items-center gap-6 py-8 ${className}`}
      >
        <span className="h-px w-16 bg-gold/30 transition-all duration-700 group-hover:w-24 group-hover:bg-gold/60" />
        <span className="font-mincho text-lg tracking-[0.5em] text-ink transition-colors duration-500 group-hover:text-gold sm:text-xl">
          御予約のお問い合わせ
        </span>
        <span className="font-mincho text-xs tracking-[0.3em] text-ink-muted/60">
          ご紹介・完全予約制
        </span>
        <span className="h-px w-16 bg-gold/30 transition-all duration-700 group-hover:w-24 group-hover:bg-gold/60" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative font-mincho text-xs tracking-[0.35em] text-gold/80 transition-colors duration-500 hover:text-gold ${className}`}
    >
      御予約
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold/60 transition-all duration-500 group-hover:w-full" />
    </Link>
  );
}
