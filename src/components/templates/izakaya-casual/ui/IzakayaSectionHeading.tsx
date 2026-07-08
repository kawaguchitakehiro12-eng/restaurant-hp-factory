import { FadeIn } from "@/components/ui/FadeIn";

type IzakayaSectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function IzakayaSectionHeading({
  label,
  title,
  subtitle,
  align = "center",
}: IzakayaSectionHeadingProps) {
  const alignClass =
    align === "center" ? "izk-heading--center" : "items-start text-left";

  return (
    <FadeIn className={`izk-heading ${alignClass}`}>
      <p className="izk-heading-label">{label}</p>
      <h2 className="izk-heading-title">{title}</h2>
      {subtitle ? <p className="izk-heading-sub">{subtitle}</p> : null}
    </FadeIn>
  );
}
