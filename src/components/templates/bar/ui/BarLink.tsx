"use client";

import Link from "next/link";

type BarLinkProps = {
  href: string;
  variant?: "text" | "hero" | "header" | "gold";
  className?: string;
  onClick?: () => void;
  label?: string;
  sublabel?: string;
  external?: boolean;
};

export function BarLink({
  href,
  variant = "text",
  className = "",
  onClick,
  label = "ご予約",
  sublabel,
  external = false,
}: BarLinkProps) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  if (variant === "header") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`bar-header-cta ${className}`}
        {...externalProps}
      >
        {label}
      </Link>
    );
  }

  if (variant === "gold") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`bar-link bar-link--gold ${className}`}
        {...externalProps}
      >
        {label}
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`bar-link bar-link-underline ${className}`}
        {...externalProps}
      >
        {sublabel ? <span className="bar-link-sublabel">{sublabel}</span> : null}
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`bar-link bar-link-underline ${className}`}
      {...externalProps}
    >
      {label}
    </Link>
  );
}
