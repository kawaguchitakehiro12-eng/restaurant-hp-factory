import type { ReactNode } from "react";

type BarTone = "void" | "charcoal" | "brown" | "smoke" | "walnut";

type BarSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  bleed?: boolean;
  tone?: BarTone;
  /** @deprecated use tone="charcoal" */
  elevated?: boolean;
};

export function BarSection({
  id,
  children,
  className = "",
  narrow = false,
  wide = false,
  bleed = false,
  tone,
  elevated = false,
}: BarSectionProps) {
  const width = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-6xl";
  const resolvedTone: BarTone | "" =
    tone ?? (elevated ? "charcoal" : "");
  const toneClass = resolvedTone ? `bar-section--${resolvedTone}` : "";
  const pad = bleed ? "px-0" : "px-5 sm:px-8 md:px-12 lg:px-16";

  return (
    <section id={id} className={`bar-section ${toneClass} ${className}`}>
      <div className={`mx-auto ${width} ${pad}`}>{children}</div>
    </section>
  );
}
