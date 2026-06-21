import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { UseCase } from "@/types/luxury-izakaya";

type UseCasesProps = {
  useCases: UseCase[];
};

export function UseCases({ useCases }: UseCasesProps) {
  return (
    <LuxurySection id="occasions" dark wide>
      <LuxurySectionHeading
        label="Occasions"
        title="ご利用シーン"
        subtitle="接待・会食・記念日"
        light
      />

      <StaggerContainer className="mt-16 flex max-w-3xl flex-col gap-0 sm:mt-24">
        {useCases.map((item) => (
          <StaggerItem key={item.label}>
            <article className="luxury-occasion-item">
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
