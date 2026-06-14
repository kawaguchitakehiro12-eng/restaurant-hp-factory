import { BrandImage } from "@/components/ui/BrandImage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { MenuItem } from "@/types/luxury-izakaya";

type RecommendationsProps = {
  recommendations: MenuItem[];
};

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <Section id="recommendations">
      <SectionHeading label="Seasonal" title="おすすめ料理" />

      <StaggerContainer className="mt-14 flex flex-col gap-16 sm:mt-20 sm:gap-20 md:grid md:grid-cols-3 md:gap-10 lg:gap-12">
        {recommendations.map((item) => (
          <StaggerItem key={item.name}>
            <article className="flex flex-col gap-5">
              <BrandImage
                src={item.image}
                alt={item.name}
                aspectClass="aspect-[4/5]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="flex flex-col gap-2 px-0.5">
                <p className="font-en text-sm italic tracking-wider text-gold/70">
                  {item.price}
                </p>
                <h3 className="font-mincho text-base tracking-[0.2em] text-ink sm:text-lg">
                  {item.name}
                </h3>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.15} className="mt-14 text-center sm:mt-20">
        <p className="font-mincho text-[10px] tracking-[0.35em] text-ink-muted/45">
          仕入れにより内容が変わる場合がございます
        </p>
      </FadeIn>
    </Section>
  );
}
