import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { MenuItem } from "@/types/luxury-izakaya";

type RecommendationsProps = {
  recommendations: MenuItem[];
};

function dishLayoutClass(index: number): string {
  if (index === 0) return "luxury-dish-feature--hero";
  if (index === 1) return "luxury-dish-feature--portrait";
  return "luxury-dish-feature--wide";
}

function photoClass(index: number): string {
  if (index === 0) return "luxury-dish-photo--xl";
  if (index === 1) return "luxury-dish-photo--tall";
  return "luxury-dish-photo--wide";
}

function shorten(text: string | undefined, max = 48): string | null {
  if (!text?.trim()) return null;
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <LuxurySection id="recommendations" wide bleed className="luxury-section--paper">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading
          label="Cuisine"
          title="四季が宿る一皿"
          subtitle="旬をそのまま、静かに盛りつけて"
        />
      </div>

      <StaggerContainer className="luxury-dish-showcase">
        {recommendations.map((item, index) => {
          const desc = shorten(item.description);

          return (
            <StaggerItem key={item.name}>
              <article className={`luxury-dish-feature ${dishLayoutClass(index)}`}>
                <figure className={`luxury-dish-photo atm-photo-frame ${photoClass(index)}`}>
                  <FlexibleImageFill
                    src={item.image}
                    alt={item.name}
                    className="luxury-image-fill atm-photo"
                    sizes="(max-width: 768px) 100vw, 90vw"
                  />
                  {item.isSample ? (
                    <SampleLabel className="demo-sample-label--image" />
                  ) : null}
                </figure>

                <div className="luxury-dish-copy">
                  <div className="luxury-dish-leader">
                    <h3 className="luxury-dish-name">{item.name}</h3>
                    <span className="luxury-dish-leader-dots" aria-hidden />
                    <p className="luxury-dish-price">{item.price}</p>
                  </div>
                  {desc ? <p className="luxury-dish-desc">{desc}</p> : null}
                  {item.isSample ? <SampleLabel /> : null}
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <FadeIn delay={0.1} className="mt-16 text-center sm:mt-20">
        <p className="font-mincho text-sm tracking-[0.28em] text-ink-muted/45">
          仕入れにより内容が変わる場合がございます
        </p>
      </FadeIn>
    </LuxurySection>
  );
}
