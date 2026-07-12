import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type SpecialtyDishesProps = {
  specialtyDishes: IzakayaCasualMenuItem[];
};

function posterLabel(item: IzakayaCasualMenuItem): string {
  if (item.badge) {
    return item.badge.replace(/！$/, "");
  }
  return "名物";
}

export function SpecialtyDishes({ specialtyDishes }: SpecialtyDishesProps) {
  if (specialtyDishes.length === 0) return null;

  return (
    <IzakayaSection id="specialty" tone="warm">
      <p className="izk-specialty-kicker">看板メニュー</p>

      <div className="izk-poster-list">
        {specialtyDishes.map((item, index) => (
          <FadeIn key={item.name} delay={index * 0.06}>
            <article className="izk-poster-card">
              <header className="izk-poster-card-head">
                <span className="izk-poster-label">{posterLabel(item)}</span>
                <h3 className="izk-poster-title">{item.name}</h3>
                <span className="izk-poster-bang" aria-hidden>
                  ドン！
                </span>
              </header>

              <figure className="izk-poster-photo">
                <FlexibleImageFill
                  src={item.image}
                  alt={item.name}
                  className="izk-image-fill object-cover"
                  sizes="(max-width: 768px) 100vw, 72rem"
                />
                {item.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>

              <footer className="izk-poster-foot">
                {item.description ? (
                  <p className="izk-poster-desc">{item.description}</p>
                ) : null}
                {item.price ? (
                  <p className="izk-poster-price">{item.price}</p>
                ) : null}
                {item.isSample ? <SampleLabel /> : null}
              </footer>
            </article>
          </FadeIn>
        ))}
      </div>
    </IzakayaSection>
  );
}
