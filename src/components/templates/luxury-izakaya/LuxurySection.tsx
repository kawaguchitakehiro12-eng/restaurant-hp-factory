import type { ReactNode } from "react";

type LuxurySectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  narrow?: boolean;
  wide?: boolean;
  bleed?: boolean;
};

export function LuxurySection({
  id,
  children,
  className = "",
  dark = false,
  narrow = false,
  wide = false,
  bleed = false,
}: LuxurySectionProps) {
  const width = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-6xl";
  const pad = bleed ? "px-0" : "px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24";

  return (
    <section
      id={id}
      className={`luxury-section ${dark ? "luxury-section--dark" : ""} ${className}`}
    >
      <div className={`mx-auto ${width} ${pad}`}>{children}</div>
    </section>
  );
}
