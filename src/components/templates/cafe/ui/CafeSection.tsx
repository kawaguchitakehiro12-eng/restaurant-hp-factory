import type { ReactNode } from "react";

type CafeSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  cream?: boolean;
};

export function CafeSection({
  id,
  children,
  className = "",
  narrow = false,
  cream = false,
}: CafeSectionProps) {
  const width = narrow ? "max-w-3xl" : "max-w-5xl";

  return (
    <section
      id={id}
      className={`cafe-section ${cream ? "bg-[var(--cafe-cream)]" : ""} ${className}`}
    >
      <div className={`mx-auto ${width} px-5 sm:px-8 md:px-12`}>{children}</div>
    </section>
  );
}
