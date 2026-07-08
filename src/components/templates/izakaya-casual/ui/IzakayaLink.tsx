"use client";

import Link from "next/link";

type IzakayaLinkProps = {
  href: string;
  variant?: "text" | "hero" | "header" | "lantern" | "wood" | "ink";
  className?: string;
  onClick?: () => void;
  label?: string;
  external?: boolean;
};

export function IzakayaLink({
  href,
  variant = "text",
  className = "",
  onClick,
  label = "ご予約",
  external = false,
}: IzakayaLinkProps) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  if (variant === "header") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`izk-header-cta ${className}`}
        {...externalProps}
      >
        {label}
      </Link>
    );
  }

  if (variant === "lantern") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`izk-link izk-link--lantern ${className}`}
        {...externalProps}
      >
        {label}
      </Link>
    );
  }

  if (variant === "wood") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`izk-link izk-link--wood ${className}`}
        {...externalProps}
      >
        {label}
      </Link>
    );
  }

  if (variant === "ink") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`izk-link izk-link--ink ${className}`}
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
        className={`izk-link izk-link-underline ${className}`}
        {...externalProps}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`izk-link izk-link--ink ${className}`}
      {...externalProps}
    >
      {label}
    </Link>
  );
}
