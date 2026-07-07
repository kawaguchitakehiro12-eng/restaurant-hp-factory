import { FadeIn } from "@/components/ui/FadeIn";

type CafeSectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function CafeSectionHeading({
  label,
  title,
  subtitle,
  align = "center",
}: CafeSectionHeadingProps) {
  const alignClass =
    align === "center" ? "cafe-heading--center" : "items-start text-left";

  return (
    <FadeIn className={`cafe-heading ${alignClass}`}>
      <p className="cafe-heading-label">{label}</p>
      <h2 className="cafe-heading-title">{title}</h2>
      {subtitle ? <p className="cafe-heading-sub">{subtitle}</p> : null}
    </FadeIn>
  );
}
