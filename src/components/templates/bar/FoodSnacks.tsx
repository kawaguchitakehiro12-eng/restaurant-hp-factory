import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarMenuItem } from "@/types/bar";

type FoodSnacksProps = {
  foodSnacks: BarMenuItem[];
};

function FoodList({ items }: { items: BarMenuItem[] }) {
  return (
    <div className="bar-food-list">
      {items.map((item) => (
        <article key={item.name} className="bar-food-item">
          <div className="bar-food-item-header">
            <div>
              {item.nameEn ? (
                <span className="bar-food-item-name-en">{item.nameEn}</span>
              ) : null}
              <h3 className="bar-food-item-name">{item.name}</h3>
            </div>
            <span className="bar-food-item-price">{item.price}</span>
          </div>
          {item.description ? (
            <p className="bar-food-item-desc">{item.description}</p>
          ) : null}
          {item.isSample ? <SampleLabel /> : null}
        </article>
      ))}
    </div>
  );
}

export function FoodSnacks({ foodSnacks }: FoodSnacksProps) {
  if (foodSnacks.length === 0) return null;

  const photoItem = foodSnacks.find((item) => item.image);
  const hasPhoto = Boolean(photoItem);

  return (
    <BarSection id="food">
      <BarSectionHeading
        label="Food"
        title="フード & スナック"
        subtitle="グラスと共に楽しむ、軽やかな一皿"
      />

      <div
        className={`bar-food-block ${hasPhoto ? "" : "bar-food-block--list-only"}`}
      >
        {hasPhoto && photoItem ? (
          <FadeIn direction="left">
            <figure className="bar-food-photo">
              <FlexibleImageFill
                src={photoItem.image}
                alt={photoItem.name}
                className="bar-image-fill object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
              {photoItem.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          </FadeIn>
        ) : null}

        <FadeIn direction={hasPhoto ? "right" : "up"} delay={0.08}>
          <FoodList items={foodSnacks} />
        </FadeIn>
      </div>
    </BarSection>
  );
}
