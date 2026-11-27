import { FadeIn } from "@/components/ui/FadeIn";

type BarSectionHeadingProps = {
  label: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  largeEn?: string;
};

export function BarSectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  largeEn,
}: BarSectionHeadingProps) {
  const alignClass =
    align === "center" ? "bar-heading--center" : "bar-heading--left";

  return (
    <FadeIn className={`bar-heading ${alignClass}`}>
      {largeEn ? (
        <p className="bar-heading-en-large" aria-hidden>
          {largeEn}
        </p>
      ) : null}
      <p className="bar-heading-label">{label}</p>
      {title ? <h2 className="bar-heading-title">{title}</h2> : null}
      {subtitle ? <p className="bar-heading-sub">{subtitle}</p> : null}
    </FadeIn>
  );
}
