import { FadeIn } from "@/components/ui/FadeIn";

type BarSectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function BarSectionHeading({
  label,
  title,
  subtitle,
  align = "center",
}: BarSectionHeadingProps) {
  const alignClass =
    align === "center" ? "bar-heading--center" : "items-start text-left";

  return (
    <FadeIn className={`bar-heading ${alignClass}`}>
      <p className="bar-heading-label">{label}</p>
      <h2 className="bar-heading-title">{title}</h2>
      {subtitle ? <p className="bar-heading-sub">{subtitle}</p> : null}
    </FadeIn>
  );
}
