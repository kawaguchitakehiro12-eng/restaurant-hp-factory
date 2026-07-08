import type { ReactNode } from "react";

type BarSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  elevated?: boolean;
};

export function BarSection({
  id,
  children,
  className = "",
  narrow = false,
  wide = false,
  elevated = false,
}: BarSectionProps) {
  const width = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-6xl";
  const tone = elevated ? "bar-section--elevated" : "";

  return (
    <section id={id} className={`bar-section ${tone} ${className}`}>
      <div className={`mx-auto ${width} px-5 sm:px-8 md:px-12 lg:px-16`}>
        {children}
      </div>
    </section>
  );
}
