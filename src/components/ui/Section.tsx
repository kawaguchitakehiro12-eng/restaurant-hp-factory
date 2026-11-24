import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  narrow?: boolean;
};

export function Section({ id, children, className = "", dark = false, narrow = false }: SectionProps) {
  const width = narrow ? "max-w-3xl" : "max-w-5xl";

  return (
    <section
      id={id}
      className={`section-luxury ${dark ? "bg-ink" : ""} ${className}`}
    >
      <div className={`mx-auto ${width} px-5 sm:px-8 md:px-12 lg:px-16`}>
        {children}
      </div>
    </section>
  );
}
