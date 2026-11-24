import { FadeIn } from "@/components/ui/FadeIn";

type LuxurySectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function LuxurySectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  light = false,
}: LuxurySectionHeadingProps) {
  const alignClass = align === "center" ? "luxury-heading--center" : "luxury-heading--left";

  return (
    <FadeIn className={`luxury-heading ${alignClass} ${light ? "luxury-heading--light" : ""}`}>
      <p className="luxury-heading-label">{label}</p>
      <h2 className="luxury-heading-title">{title}</h2>
      {subtitle ? <p className="luxury-heading-subtitle">{subtitle}</p> : null}
    </FadeIn>
  );
}
