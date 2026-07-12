import type { ReactNode } from "react";

type IzakayaSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  tone?: "default" | "warm" | "wood" | "enji" | "charcoal";
};

export function IzakayaSection({
  id,
  children,
  className = "",
  narrow = false,
  wide = false,
  tone = "default",
}: IzakayaSectionProps) {
  const width = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-6xl";
  const toneClass =
    tone === "warm"
      ? "izk-section--warm"
      : tone === "wood"
        ? "izk-section--wood"
        : tone === "enji"
          ? "izk-section--enji"
          : tone === "charcoal"
            ? "izk-section--charcoal"
            : "";

  return (
    <section id={id} className={`izk-section ${toneClass} ${className}`}>
      <div className={`mx-auto ${width} px-5 sm:px-8 md:px-12 lg:px-16`}>
        {children}
      </div>
    </section>
  );
}
