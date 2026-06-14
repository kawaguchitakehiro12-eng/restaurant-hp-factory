import { FadeIn } from "@/components/ui/FadeIn";
import { CafeImage } from "@/components/templates/cafe/ui/CafeImage";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeStore } from "@/types/cafe";

type ConceptProps = {
  store: CafeStore;
  conceptImage: string;
};

export function Concept({ store, conceptImage }: ConceptProps) {
  return (
    <CafeSection id="concept">
      <CafeSectionHeading
        label="Concept"
        title="コンセプト"
        subtitle={store.tagline}
      />

      <div className="mt-12 grid items-start gap-10 sm:mt-16 md:grid-cols-2 md:gap-14 lg:gap-20">
        <FadeIn direction="left">
          <CafeImage
            src={conceptImage}
            alt="nuéeのカフェ空間"
            aspectClass="aspect-[4/5]"
            sizes="(max-width: 768px) 100vw, 50vw"
            rounded
          />
        </FadeIn>

        <FadeIn direction="right" delay={0.1} className="flex flex-col gap-8 md:pt-6">
          <p className="text-[15px] leading-[2.3] tracking-[0.04em] text-[var(--cafe-muted)] sm:text-base">
            {store.concept}
          </p>

          <ul className="flex flex-col gap-4 border-t border-[var(--cafe-cream)] pt-8">
            {store.conceptPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[13px] leading-[1.9] tracking-[0.04em] text-[var(--cafe-ink)]/75 sm:text-sm"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--cafe-accent)]" />
                {point}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </CafeSection>
  );
}
