import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarMenuItem } from "@/types/bar";

type FoodSnacksProps = {
  foodSnacks: BarMenuItem[];
};

export function FoodSnacks({ foodSnacks }: FoodSnacksProps) {
  if (foodSnacks.length === 0) return null;

  return (
    <BarSection id="food" tone="smoke" wide>
      <div className="bar-food-layout">
        <div className="bar-food-main">
          <BarSectionHeading
            label="LATE BITES"
            title="フード"
            subtitle="グラスと共に楽しむ、夜の一皿"
            largeEn="Food"
            align="left"
          />

          <FadeIn className="bar-food-menu">
            {foodSnacks.map((item) => (
              <article key={item.name} className="bar-food-row">
                <div className="bar-food-leader">
                  <div className="bar-food-names">
                    {item.nameEn ? (
                      <span className="bar-food-name-en">{item.nameEn}</span>
                    ) : null}
                    <h3 className="bar-food-name">{item.name}</h3>
                  </div>
                  <span className="bar-food-dots" aria-hidden />
                  <span className="bar-food-price">{item.price}</span>
                </div>
                {item.description ? (
                  <p className="bar-food-desc">{item.description}</p>
                ) : null}
                {item.isSample ? <SampleLabel /> : null}
              </article>
            ))}
          </FadeIn>
        </div>

        <aside className="bar-food-aside" aria-hidden>
          <p className="bar-food-aside-bg">BITES</p>
          <p className="bar-food-aside-line">AFTER DARK</p>
          <div className="bar-food-aside-rule" />
          <p className="bar-food-aside-note">
            Hotel-night menu.
            <br />
            Quiet plates.
          </p>
        </aside>
      </div>
    </BarSection>
  );
}
