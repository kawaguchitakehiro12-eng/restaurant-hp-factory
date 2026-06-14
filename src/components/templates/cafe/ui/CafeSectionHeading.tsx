import { FadeIn } from "@/components/ui/FadeIn";

type CafeSectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function CafeSectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  light = false,
}: CafeSectionHeadingProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <FadeIn className={`flex flex-col gap-3 sm:gap-4 ${alignClass}`}>
      <p
        className={`font-cafe-en text-[10px] font-light tracking-[0.35em] uppercase ${
          light ? "text-white/50" : "text-[var(--cafe-accent)]"
        }`}
      >
        {label}
      </p>
      <h2
        className={`font-cafe-display text-2xl tracking-[0.08em] sm:text-3xl md:text-4xl ${
          light ? "text-white" : "text-[var(--cafe-ink)]"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-sm text-[13px] leading-[2.1] tracking-[0.04em] sm:text-sm ${
            light ? "text-white/55" : "text-[var(--cafe-muted)]"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
