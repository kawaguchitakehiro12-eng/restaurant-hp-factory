import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { UseCase } from "@/types/luxury-izakaya";

type UseCasesProps = {
  useCases: UseCase[];
};

export function UseCases({ useCases }: UseCasesProps) {
  return (
    <Section id="occasions" dark>
      <SectionHeading
        label="Occasions"
        title="ご利用シーン"
        subtitle="接待・会食・記念日"
        light
      />

      <StaggerContainer className="mt-14 flex flex-col gap-16 sm:mt-20 sm:gap-20">
        {useCases.map((item) => (
          <StaggerItem key={item.label}>
            <article className="flex flex-col gap-5 sm:gap-6">
              <div className="flex items-baseline gap-5">
                <span className="font-mincho text-xs tracking-[0.4em] text-gold/55">
                  {item.label}
                </span>
                <span className="h-px flex-1 bg-washi/10" aria-hidden />
              </div>
              <h3 className="font-mincho text-lg tracking-[0.2em] text-washi/90 sm:text-xl">
                {item.title}
              </h3>
              <p className="max-w-md font-mincho text-[13px] leading-[2.4] tracking-[0.08em] text-washi/40 sm:text-sm">
                {item.description}
              </p>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}
