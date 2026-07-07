import type { ReactNode } from "react";

type CafeSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  warm?: boolean;
  beige?: boolean;
};

export function CafeSection({
  id,
  children,
  className = "",
  narrow = false,
  wide = false,
  warm = false,
  beige = false,
}: CafeSectionProps) {
  const width = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-6xl";
  const tone = beige ? "cafe-section--beige" : warm ? "cafe-section--warm" : "";

  return (
    <section id={id} className={`cafe-section ${tone} ${className}`}>
      <div className={`mx-auto ${width} px-5 sm:px-8 md:px-12 lg:px-16`}>
        {children}
      </div>
    </section>
  );
}
