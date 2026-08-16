import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { UseCase } from "@/types/luxury-izakaya";

type UseCasesProps = {
  useCases: UseCase[];
};

export function UseCases({ useCases }: UseCasesProps) {
  return (
    <LuxurySection id="occasions" wide className="luxury-section--mist">
      <LuxurySectionHeading
        label="Occasions"
        title="特別な夜のために"
        subtitle="接待・会食・記念日 — 余白のある時間を"
        align="left"
      />

      <StaggerContainer className="luxury-occasion-list">
        {useCases.map((item) => (
          <StaggerItem key={item.label}>
            <article className="luxury-occasion-item luxury-occasion-item--light">
              <span className="luxury-occasion-label">{item.label}</span>
              <h3 className="luxury-occasion-title">{item.title}</h3>
              <p className="luxury-occasion-desc">{item.description}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </LuxurySection>
  );
}
