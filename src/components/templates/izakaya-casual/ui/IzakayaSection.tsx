import type { ReactNode } from "react";

type IzakayaTone = "default" | "white" | "ink" | "red" | "smoke";

type IzakayaSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** full-bleed content (no inner max-width pad) */
  bleed?: boolean;
  /** slightly constrained reading width */
  narrow?: boolean;
  tone?: IzakayaTone;
};

export function IzakayaSection({
  id,
  children,
  className = "",
  bleed = false,
  narrow = false,
  tone = "default",
}: IzakayaSectionProps) {
  const toneClass = tone !== "default" ? `izk-section--${tone}` : "";

  if (bleed) {
    return (
      <section id={id} className={`izk-section izk-section--bleed ${toneClass} ${className}`}>
        {children}
      </section>
    );
  }

  const width = narrow ? "izk-shell--narrow" : "izk-shell";

  return (
    <section id={id} className={`izk-section ${toneClass} ${className}`}>
      <div className={width}>{children}</div>
    </section>
  );
}
