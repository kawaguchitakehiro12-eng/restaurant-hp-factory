import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import { luxuryDishPhotoClass } from "./luxury-mosaic";
import type { MenuItem } from "@/types/luxury-izakaya";

type RecommendationsProps = {
  recommendations: MenuItem[];
};

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <LuxurySection id="recommendations" wide bleed>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading label="Seasonal" title="おすすめ料理" />
      </div>

      <StaggerContainer className="luxury-dish-showcase mt-12 sm:mt-16">
        {recommendations.map((item, index) => {
          const isReversed = index % 2 === 1;
          const photoClass = luxuryDishPhotoClass(index);

          return (
            <StaggerItem key={item.name}>
              <article
                className={`luxury-dish-feature ${isReversed ? "luxury-dish-feature--reverse" : ""}`}
              >
                <figure className={`luxury-dish-photo ${photoClass}`}>
                  <FlexibleImageFill
                    src={item.image}
                    alt={item.name}
                    className="luxury-image-fill"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                  {item.isSample ? (
                    <SampleLabel className="demo-sample-label--image" />
                  ) : null}
                </figure>

                <div className="luxury-dish-copy">
                  <h3 className="luxury-dish-name">{item.name}</h3>
                  <p className="luxury-dish-price">{item.price}</p>
                  {item.description ? (
                    <p className="luxury-dish-desc">{item.description}</p>
                  ) : null}
                  {item.isSample ? <SampleLabel /> : null}
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <FadeIn delay={0.15} className="mt-16 text-center sm:mt-20">
        <p className="font-mincho text-[11px] tracking-[0.35em] text-ink-muted/35">
          仕入れにより内容が変わる場合がございます
        </p>
      </FadeIn>
    </LuxurySection>
  );
}
