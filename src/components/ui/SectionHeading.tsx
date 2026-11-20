import { FadeIn } from "./FadeIn";

type SectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <FadeIn className={`flex flex-col gap-4 sm:gap-5 ${alignClass}`}>
      <p
        className={`font-en text-[10px] italic tracking-[0.4em] uppercase ${
          light ? "text-gold-light/45" : "text-gold/65"
        }`}
      >
        {label}
      </p>
      <h2
        className={`font-mincho text-[1.625rem] leading-relaxed tracking-[0.3em] sm:text-3xl md:text-4xl ${
          light ? "text-washi" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-sm text-[13px] leading-[2.2] tracking-[0.12em] sm:text-sm ${
            light ? "text-washi/40" : "text-ink-muted/75"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
