import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeMenuItem } from "@/types/cafe";

type MenuSectionProps = {
  items: CafeMenuItem[];
  id: string;
  label: string;
  title: string;
  subtitle: string;
  reverse?: boolean;
  warm?: boolean;
};

function MenuList({ items }: { items: CafeMenuItem[] }) {
  return (
    <div className="cafe-menu-list">
      {items.map((item) => (
        <article key={item.name} className="cafe-menu-item">
          <div className="cafe-menu-item-header">
            <div>
              {item.nameEn ? (
                <span className="cafe-menu-item-name-en">{item.nameEn}</span>
              ) : null}
              <h3 className="cafe-menu-item-name">{item.name}</h3>
            </div>
            <span className="cafe-menu-item-price">{item.price}</span>
          </div>
          {item.description ? (
            <p className="cafe-menu-item-desc">{item.description}</p>
          ) : null}
          {item.isSample ? <SampleLabel /> : null}
        </article>
      ))}
    </div>
  );
}

export function FoodMenu({ items }: { items: CafeMenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <MenuSection
      id="food"
      label="Food"
      title="フード"
      subtitle="季節の素材を、シンプルに。"
      items={items}
      reverse={false}
    />
  );
}

export function DrinkMenu({ items }: { items: CafeMenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <MenuSection
      id="drink"
      label="Drink"
      title="ドリンク"
      subtitle="一杯ずつ、丁寧に。"
      items={items}
      reverse
      warm
    />
  );
}

function MenuSection({
  items,
  id,
  label,
  title,
  subtitle,
  reverse = false,
  warm = false,
}: MenuSectionProps) {
  const photoItem = items.find((item) => item.image);
  const hasPhoto = Boolean(photoItem);

  return (
    <CafeSection id={id} warm={warm}>
      <CafeSectionHeading label={label} title={title} subtitle={subtitle} />

      <div
        className={`cafe-menu-block ${reverse ? "cafe-menu-block--reverse" : ""} ${hasPhoto ? "" : "cafe-menu-block--list-only"}`}
      >
        {hasPhoto && photoItem ? (
          <FadeIn direction={reverse ? "right" : "left"}>
            <figure className="cafe-menu-photo">
              <FlexibleImageFill
                src={photoItem.image}
                alt={photoItem.name}
                className="cafe-image-fill object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
              {photoItem.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          </FadeIn>
        ) : null}

        <FadeIn direction={hasPhoto ? (reverse ? "left" : "right") : "up"} delay={0.08}>
          <MenuList items={items} />
        </FadeIn>
      </div>
    </CafeSection>
  );
}
