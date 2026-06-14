import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { CafeImage } from "@/components/templates/cafe/ui/CafeImage";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeInterior } from "@/types/cafe";

type InteriorProps = {
  interior: CafeInterior;
};

export function Interior({ interior }: InteriorProps) {
  return (
    <CafeSection id="interior">
      <CafeSectionHeading
        label="Space"
        title="店内空間"
        subtitle={interior.title}
      />

      <div className="mt-12 sm:mt-16">
        <FadeIn>
          <CafeImage
            src={interior.image}
            alt={interior.title}
            aspectClass="aspect-[16/10] sm:aspect-[21/9]"
            sizes="100vw"
          />
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10 max-w-lg sm:mt-12">
          <p className="text-[15px] leading-[2.3] tracking-[0.04em] text-[var(--cafe-muted)] sm:text-base">
            {interior.description}
          </p>
        </FadeIn>

        <StaggerContainer className="mt-8 flex flex-col gap-3 sm:mt-10">
          {interior.features.map((feature) => (
            <StaggerItem key={feature}>
              <p className="flex items-center gap-3 text-[13px] tracking-[0.06em] text-[var(--cafe-ink)]/70 sm:text-sm">
                <span className="h-px w-6 bg-[var(--cafe-accent)]/40" />
                {feature}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </CafeSection>
  );
}
