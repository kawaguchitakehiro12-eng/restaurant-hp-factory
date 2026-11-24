"use client";

import Link from "next/link";

type CafeLinkProps = {
  href: string;
  variant?: "text" | "hero" | "header";
  className?: string;
  onClick?: () => void;
  label?: string;
  sublabel?: string;
  external?: boolean;
};

export function CafeLink({
  href,
  variant = "text",
  className = "",
  onClick,
  label = "ご予約",
  sublabel,
  external = false,
}: CafeLinkProps) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  if (variant === "header") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`cafe-header-cta ${className}`}
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
        className={`cafe-link cafe-link-underline ${className}`}
        {...externalProps}
      >
        {sublabel ? <span className="cafe-link-sublabel">{sublabel}</span> : null}
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`cafe-link cafe-link-underline ${className}`}
      {...externalProps}
    >
      {label}
    </Link>
  );
}
