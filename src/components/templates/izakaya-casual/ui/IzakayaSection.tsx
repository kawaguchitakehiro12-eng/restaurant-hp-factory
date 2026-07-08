import type { ReactNode } from "react";

type IzakayaSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  tone?: "default" | "paper" | "wood" | "board";
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
    tone === "paper"
      ? "izk-section--paper"
      : tone === "wood"
        ? "izk-section--wood"
        : tone === "board"
          ? "izk-section--board"
          : "";

  return (
    <section id={id} className={`izk-section ${toneClass} ${className}`}>
      <div className={`mx-auto ${width} px-5 sm:px-8 md:px-12 lg:px-16`}>
        {children}
      </div>
    </section>
  );
}
