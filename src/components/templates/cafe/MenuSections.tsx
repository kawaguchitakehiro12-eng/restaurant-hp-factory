import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeMenuItem } from "@/types/cafe";

type DrinkCategory = "Coffee" | "Tea" | "Others";

const TEA_PATTERN = /ティー|tea|抹茶|matcha|チャイ|chai|ハーブ|herbal/i;
const COFFEE_PATTERN =
  /ラテ|latte|コーヒー|coffee|エスプレッソ|espresso|cappuccino|americano|macchiato|mocha|brew|flat white|ホワイト|ドリップ|drip/i;

function drinkCategory(item: CafeMenuItem): DrinkCategory {
  const text = [item.name, item.nameEn, item.description]
    .filter(Boolean)
    .join(" ");
  if (TEA_PATTERN.test(text)) return "Tea";
  if (COFFEE_PATTERN.test(text)) return "Coffee";
  return "Others";
}

function groupDrinks(items: CafeMenuItem[]): { label: DrinkCategory; items: CafeMenuItem[] }[] {
  const order: DrinkCategory[] = ["Coffee", "Tea", "Others"];
  const map = new Map<DrinkCategory, CafeMenuItem[]>();
  for (const item of items) {
    const cat = drinkCategory(item);
    const list = map.get(cat) ?? [];
    list.push(item);
    map.set(cat, list);
  }
  return order
    .map((label) => ({ label, items: map.get(label) ?? [] }))
    .filter((g) => g.items.length > 0);
}

function MenuLedger({ items }: { items: CafeMenuItem[] }) {
  return (
    <div className="cafe-ledger">
      {items.map((item) => (
        <article key={item.name} className="cafe-ledger-row">
          <div className="cafe-ledger-main">
            {item.nameEn ? (
              <span className="cafe-ledger-en">{item.nameEn}</span>
            ) : null}
            <div className="cafe-ledger-line">
              <h3 className="cafe-ledger-name">{item.name}</h3>
              <span className="cafe-ledger-dots" aria-hidden />
              <span className="cafe-ledger-price">{item.price}</span>
            </div>
            {item.description ? (
              <p className="cafe-ledger-desc">{item.description}</p>
            ) : null}
            {item.isSample ? <SampleLabel /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function FoodMenu({ items }: { items: CafeMenuItem[] }) {
  if (items.length === 0) return null;
  const photoItem = items.find((item) => item.image);

  return (
    <CafeSection id="food" tone="mist">
      <div className="cafe-food-layout">
        <CafeSectionHeading
          label="FOOD"
          title="フード"
          subtitle="季節の素材を、シンプルに。"
          largeEn="Bites"
          align="left"
        />

        <div className="cafe-food-grid">
          <FadeIn className="cafe-food-list-wrap">
            <MenuLedger items={items} />
          </FadeIn>

          {photoItem ? (
            <FadeIn delay={0.1} className="cafe-food-aside">
              <p className="cafe-food-aside-label" aria-hidden>
                Seasonal
              </p>
              <figure className="cafe-food-photo">
                <FlexibleImageFill
                  src={photoItem.image}
                  alt={photoItem.name}
                  className="cafe-image-fill object-cover"
                  sizes="(max-width: 768px) 80vw, 28vw"
                />
                {photoItem.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>
              <p className="cafe-food-aside-cap">{photoItem.name}</p>
            </FadeIn>
          ) : null}
        </div>
      </div>
    </CafeSection>
  );
}

export function DrinkMenu({ items }: { items: CafeMenuItem[] }) {
  if (items.length === 0) return null;
  const groups = groupDrinks(items);
  const leadLabel = groups[0]?.label ?? "Coffee";

  return (
    <CafeSection id="drink" tone="sand">
      <div className="cafe-drink-layout">
        <div className="cafe-drink-main">
          <CafeSectionHeading
            label="COFFEE"
            title="ドリンク"
            subtitle="一杯ずつ、丁寧に。"
            align="left"
          />

          <FadeIn className="cafe-drink-board">
            {groups.map((group, index) => (
              <div key={group.label} className="cafe-drink-group">
                <div className="cafe-drink-cat-row">
                  <h3 className="cafe-drink-cat">{group.label}</h3>
                  <span className="cafe-drink-cat-num" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <MenuLedger items={group.items} />
              </div>
            ))}
          </FadeIn>
        </div>

        <aside className="cafe-drink-aside" aria-hidden>
          <p className="cafe-drink-aside-bg">{leadLabel}</p>
          <p className="cafe-drink-aside-index">01</p>
          <p className="cafe-drink-aside-label">{leadLabel.toUpperCase()}</p>
          <div className="cafe-drink-aside-rule" />
          <p className="cafe-drink-aside-note">
            Brewed to order,
            <br />
            one cup at a time.
          </p>
          <p className="cafe-drink-aside-vert">BREW</p>
        </aside>
      </div>
    </CafeSection>
  );
}
