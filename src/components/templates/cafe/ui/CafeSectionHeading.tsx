import { FadeIn } from "@/components/ui/FadeIn";

type CafeSectionHeadingProps = {
  label: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  largeEn?: string;
};

export function CafeSectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  largeEn,
}: CafeSectionHeadingProps) {
  const alignClass =
    align === "center"
      ? "cafe-heading--center"
      : align === "right"
        ? "cafe-heading--right"
        : "cafe-heading--left";

  return (
    <FadeIn className={`cafe-heading ${alignClass}`}>
      {largeEn ? <p className="cafe-heading-en-large" aria-hidden>{largeEn}</p> : null}
      <p className="cafe-heading-label">{label}</p>
      {title ? <h2 className="cafe-heading-title">{title}</h2> : null}
      {subtitle ? <p className="cafe-heading-sub">{subtitle}</p> : null}
    </FadeIn>
  );
}
