"use client";

import Link from "next/link";

type CafeLinkProps = {
  href: string;
  variant?: "text" | "hero" | "section" | "instagram" | "mobile-bar";
  className?: string;
  onClick?: () => void;
  label?: string;
  sublabel?: string;
};

export function CafeLink({
  href,
  variant = "text",
  className = "",
  onClick,
  label = "ご予約",
  sublabel,
}: CafeLinkProps) {
  if (variant === "mobile-bar") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex flex-1 items-center justify-center gap-2 py-3.5 transition-colors active:bg-[var(--cafe-cream)] ${className}`}
      >
        <span className="text-[13px] tracking-[0.2em] text-[var(--cafe-ink)]">{label}</span>
      </Link>
    );
  }

  if (variant === "instagram") {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={`flex flex-1 items-center justify-center gap-2 border-l border-[var(--cafe-cream)] py-3.5 transition-colors active:bg-[var(--cafe-cream)] ${className}`}
      >
        <span
          className="text-[13px] tracking-[0.15em] text-[var(--cafe-ink)]"
          style={{ fontFamily: "var(--font-cafe-en)" }}
        >
          Instagram
        </span>
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group inline-flex flex-col items-start gap-1 ${className}`}
      >
        {sublabel && (
          <span className="text-[10px] tracking-[0.25em] text-[var(--cafe-muted)]">
            {sublabel}
          </span>
        )}
        <span className="relative text-[13px] tracking-[0.2em] text-[var(--cafe-ink)] transition-colors group-hover:text-[var(--cafe-accent)]">
          {label}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--cafe-accent)] transition-all duration-400 group-hover:w-full" />
        </span>
      </Link>
    );
  }

  if (variant === "section") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group flex flex-col items-center gap-4 py-6 ${className}`}
      >
        <span className="h-px w-10 bg-[var(--cafe-accent)]/30 transition-all group-hover:w-16 group-hover:bg-[var(--cafe-accent)]/60" />
        <span className="text-base tracking-[0.25em] text-[var(--cafe-ink)] transition-colors group-hover:text-[var(--cafe-accent)] sm:text-lg">
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] tracking-[0.15em] text-[var(--cafe-muted)]">
            {sublabel}
          </span>
        )}
        <span className="h-px w-10 bg-[var(--cafe-accent)]/30 transition-all group-hover:w-16 group-hover:bg-[var(--cafe-accent)]/60" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative text-[11px] tracking-[0.2em] text-[var(--cafe-ink)]/70 transition-colors hover:text-[var(--cafe-accent)] ${className}`}
    >
      {label}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--cafe-accent)]/60 transition-all duration-400 group-hover:w-full" />
    </Link>
  );
}
