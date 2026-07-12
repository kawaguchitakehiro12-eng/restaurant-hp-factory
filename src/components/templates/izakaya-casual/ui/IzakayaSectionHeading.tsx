import { FadeIn } from "@/components/ui/FadeIn";

type IzakayaSectionHeadingProps = {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
  /** plain = タイトルのみ / minimal = タイトル+補足 / default = ラベル付き */
  variant?: "default" | "minimal" | "plain";
};

export function IzakayaSectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  light = false,
  variant = "default",
}: IzakayaSectionHeadingProps) {
  const alignClass =
    align === "center" ? "izk-heading--center" : "items-start text-left";
  const lightClass = light ? "izk-heading--light" : "";
  const variantClass =
    variant === "plain"
      ? "izk-heading--plain"
      : variant === "minimal"
        ? "izk-heading--minimal"
        : "";

  return (
    <FadeIn className={`izk-heading ${alignClass} ${lightClass} ${variantClass}`}>
      {variant === "default" && label ? (
        <p className="izk-heading-label">{label}</p>
      ) : null}
      <h2 className="izk-heading-title">{title}</h2>
      {subtitle && variant !== "plain" ? (
        <p className="izk-heading-sub">{subtitle}</p>
      ) : null}
    </FadeIn>
  );
}
