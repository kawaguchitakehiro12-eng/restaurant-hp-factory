import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import {
  guessIzkPhotoFocus,
  izkPhotoFocusClass,
} from "@/components/templates/izakaya-casual/utils/izkPhotoFocus";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type SpecialtyDishesProps = {
  specialtyDishes: IzakayaCasualMenuItem[];
};

function foodImgClass(label: string) {
  return `izk-image-fill object-cover ${izkPhotoFocusClass(guessIzkPhotoFocus(label))}`;
}

export function SpecialtyDishes({ specialtyDishes }: SpecialtyDishesProps) {
  if (specialtyDishes.length === 0) return null;

  const [hero, ...rest] = specialtyDishes;

  return (
    <IzakayaSection id="specialty" tone="white" bleed className="izk-specialty">
      <div className="izk-shell">
        <FadeIn className="izk-specialty-intro">
          <p className="izk-specialty-lead">まず、これ食べて。</p>
          <p className="izk-specialty-lead-sub">
            店の顔。炭火の香りでお腹が空くやつ。
          </p>
        </FadeIn>
      </div>

      <article className="izk-feat izk-feat--lead">
        <div className="izk-feat-photo izk-frame izk-frame--large">
          {hero.image ? (
            <>
              <FlexibleImageFill
                src={hero.image}
                alt={hero.name}
                className={foodImgClass(hero.name)}
                sizes="(max-width: 900px) 100vw, 58vw"
              />
              <div className="izk-photo-grade" aria-hidden />
              {hero.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </>
          ) : null}
        </div>
        <FadeIn className="izk-feat-copy">
          <p className="izk-feat-badge">{hero.badge || "名物"}</p>
          <h3 className="izk-feat-name">{hero.name}</h3>
          {hero.price ? (
            <p className="izk-feat-price izk-price">{hero.price}</p>
          ) : null}
          {hero.description ? (
            <p className="izk-feat-desc">{hero.description}</p>
          ) : null}
          {hero.isSample ? <SampleLabel /> : null}
        </FadeIn>
      </article>

      {rest.length > 0 ? (
        <StaggerContainer className="izk-feat-stack">
          {rest.map((item, index) => {
            const overlay = index === 0;
            const reverse = index % 2 === 1;

            if (overlay && item.image) {
              return (
                <StaggerItem key={item.name}>
                  <article className="izk-feat izk-feat--overlay">
                    <div className="izk-feat-photo">
                      <FlexibleImageFill
                        src={item.image}
                        alt={item.name}
                        className={foodImgClass(item.name)}
                        sizes="100vw"
                      />
                      <div className="izk-photo-grade" aria-hidden />
                      {item.isSample ? (
                        <SampleLabel className="demo-sample-label--image" />
                      ) : null}
                    </div>
                    <div className="izk-feat-overlay-copy">
                      <p className="izk-feat-badge">{item.badge || "人気"}</p>
                      <h3 className="izk-feat-name">{item.name}</h3>
                      {item.price ? (
                        <p className="izk-feat-price izk-price">{item.price}</p>
                      ) : null}
                      {item.description ? (
                        <p className="izk-feat-desc">{item.description}</p>
                      ) : null}
                    </div>
                  </article>
                </StaggerItem>
              );
            }

            return (
              <StaggerItem key={item.name}>
                <article
                  className={`izk-feat izk-feat--split${reverse ? " izk-feat--rev" : ""}`}
                >
                  <div className="izk-feat-photo izk-frame izk-frame--large">
                    {item.image ? (
                      <>
                        <FlexibleImageFill
                          src={item.image}
                          alt={item.name}
                          className={foodImgClass(item.name)}
                          sizes="(max-width: 900px) 100vw, 55vw"
                        />
                        <div className="izk-photo-grade" aria-hidden />
                        {item.isSample ? (
                          <SampleLabel className="demo-sample-label--image" />
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  <div className="izk-feat-copy">
                    <p className="izk-feat-badge">{item.badge || "看板"}</p>
                    <h3 className="izk-feat-name">{item.name}</h3>
                    {item.price ? (
                      <p className="izk-feat-price izk-price">{item.price}</p>
                    ) : null}
                    {item.description ? (
                      <p className="izk-feat-desc">{item.description}</p>
                    ) : null}
                    {item.isSample ? <SampleLabel /> : null}
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : null}
    </IzakayaSection>
  );
}
