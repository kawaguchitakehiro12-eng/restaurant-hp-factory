import { FadeIn } from "@/components/ui/FadeIn";
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
    <IzakayaSection id="specials" tone="wood">
      <IzakayaSectionHeading
        label="Today"
        title="本日のおすすめ"
        subtitle="黒板に書いた、いま一番食べてほしいもの"
      />

      <FadeIn>
        <div className="izk-specials-board">
          <div className="izk-specials-list">
            {todaysSpecials.map((item) => {
              const hasPhoto = Boolean(item.image);

              return (
                <article
                  key={item.name}
                  className={`izk-specials-item ${hasPhoto ? "izk-specials-item--with-photo" : ""}`}
                >
                  {hasPhoto ? (
                    <figure className="izk-specials-photo">
                      <FlexibleImageFill
                        src={item.image}
                        alt={item.name}
                        className="izk-image-fill object-cover"
                        sizes="5.5rem"
                      />
                      {item.isSample ? (
                        <SampleLabel className="demo-sample-label--image" />
                      ) : null}
                    </figure>
                  ) : null}

                  <div className="izk-specials-body">
                    {item.badge ? (
                      <span className="izk-specials-badge">{item.badge}</span>
                    ) : null}
                    <div className="izk-specials-row">
                      <h3 className="izk-specials-name">{item.name}</h3>
                      <span className="izk-specials-dots" aria-hidden />
                      <span className="izk-specials-price">{item.price}</span>
                    </div>
                    {item.description ? (
                      <p className="izk-specials-desc">{item.description}</p>
                    ) : null}
                    {item.isSample ? <SampleLabel /> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </IzakayaSection>
  );
}
