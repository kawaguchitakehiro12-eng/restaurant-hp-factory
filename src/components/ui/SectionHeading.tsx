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
    <FadeIn zoom className={`flex flex-col gap-6 ${alignClass}`}>
      <p
        className={`font-en text-[10px] italic tracking-[0.45em] uppercase ${
          light ? "text-gold-light/50" : "text-gold/70"
        }`}
      >
        {label}
      </p>
      <h2
        className={`font-mincho text-3xl leading-relaxed tracking-[0.35em] sm:text-4xl md:text-5xl ${
          light ? "text-washi" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-md text-sm leading-[2.2] tracking-[0.15em] ${
            light ? "text-washi/45" : "text-ink-muted/80"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
