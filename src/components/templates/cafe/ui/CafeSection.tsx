import type { ReactNode } from "react";

type CafeTone = "ivory" | "milk" | "mist" | "sand" | "warm" | "beige";

type CafeSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  bleed?: boolean;
  tone?: CafeTone;
  /** @deprecated use tone="warm" */
  warm?: boolean;
  /** @deprecated use tone="beige" */
  beige?: boolean;
};

export function CafeSection({
  id,
  children,
  className = "",
  narrow = false,
  wide = false,
  bleed = false,
  tone,
  warm = false,
  beige = false,
}: CafeSectionProps) {
  const width = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-6xl";
  const resolvedTone: CafeTone | "" =
    tone ?? (beige ? "beige" : warm ? "warm" : "");
  const toneClass = resolvedTone ? `cafe-section--${resolvedTone}` : "";
  const pad = bleed ? "px-0" : "px-5 sm:px-8 md:px-12 lg:px-16";

  return (
    <section id={id} className={`cafe-section ${toneClass} ${className}`}>
      <div className={`mx-auto ${width} ${pad}`}>{children}</div>
    </section>
  );
}
