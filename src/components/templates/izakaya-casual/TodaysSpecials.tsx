import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type TodaysSpecialsProps = {
  todaysSpecials: IzakayaCasualMenuItem[];
};

export function TodaysSpecials({ todaysSpecials }: TodaysSpecialsProps) {
  if (todaysSpecials.length === 0) return null;

  return (
    <IzakayaSection id="specials">
      <IzakayaSectionHeading
        title="本日のおすすめ"
        subtitle="仕入れ次第で変わります"
        variant="minimal"
      />

      <StaggerContainer className="izk-specials-open">
        {todaysSpecials.map((item, index) => (
          <StaggerItem key={item.name}>
            <FadeIn delay={index * 0.05}>
              <article className="izk-specials-open-item">
                {item.image ? (
                  <figure className="izk-specials-open-photo">
                    <FlexibleImageFill
                      src={item.image}
                      alt={item.name}
                      className="izk-image-fill object-cover"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                    {item.isSample ? (
                      <SampleLabel className="demo-sample-label--image" />
                    ) : null}
                  </figure>
                ) : null}
                <div className="izk-specials-open-body">
                  <h3 className="izk-specials-open-name">{item.name}</h3>
                  {item.price ? (
                    <p className="izk-specials-open-price">{item.price}</p>
                  ) : null}
                  {item.description ? (
                    <p className="izk-specials-open-desc">{item.description}</p>
                  ) : null}
                  {item.isSample ? <SampleLabel /> : null}
                </div>
              </article>
            </FadeIn>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </IzakayaSection>
  );
}
