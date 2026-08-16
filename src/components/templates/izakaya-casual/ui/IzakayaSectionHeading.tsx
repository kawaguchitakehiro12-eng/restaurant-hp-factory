import { FadeIn } from "@/components/ui/FadeIn";

type IzakayaSectionHeadingProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function IzakayaSectionHeading({
  title,
  subtitle,
  kicker,
  align = "left",
  light = false,
}: IzakayaSectionHeadingProps) {
  const alignClass = align === "center" ? "izk-heading--center" : "";
  const lightClass = light ? "izk-heading--light" : "";

  return (
    <FadeIn className={`izk-heading ${alignClass} ${lightClass}`}>
      {kicker ? <p className="izk-heading-kicker">{kicker}</p> : null}
      <h2 className="izk-heading-title">{title}</h2>
      {subtitle ? <p className="izk-heading-sub">{subtitle}</p> : null}
    </FadeIn>
  );
}
