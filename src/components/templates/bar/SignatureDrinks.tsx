import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarMenuItem } from "@/types/bar";

type SignatureDrinksProps = {
  signatureDrinks: BarMenuItem[];
};

function parseIngredients(description?: string): string | null {
  if (!description?.trim()) return null;
  const raw = description.trim();
  // 「材料。説明」形式なら材料部分を優先
  const beforePeriod = raw.split(/[。．]/)[0] ?? raw;

  if (/[／/]/.test(beforePeriod)) {
    const slashParts = beforePeriod
      .split(/[／/]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p.length < 24);
    if (slashParts.length >= 2) return slashParts.slice(0, 4).join(" / ");
  }

  const jpParts = beforePeriod
    .split(/[、,]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length < 24);
  // 短語の並び（材料名）のみを ingredients 扱い。説明文の読点は除外
  if (
    jpParts.length >= 2 &&
    jpParts.every((p) => p.length <= 10) &&
    (jpParts.length >= 3 || jpParts.every((p) => p.length <= 8))
  ) {
    return jpParts.slice(0, 4).join(" / ");
  }

  return null;
}

function categoryLabel(item: BarMenuItem, index: number): string {
  if (item.badge?.toLowerCase().includes("signature") || index === 0) {
    return "SIGNATURE";
  }
  const text = `${item.name} ${item.nameEn ?? ""} ${item.description ?? ""}`;
  if (/ウイスキー|whisky|whiskey|モルト|malt|バーボン|bourbon/i.test(text)) {
    return "WHISKY";
  }
  if (/ジン|gin|ネグローニ|negroni|マティーニ|martini/i.test(text)) {
    return "GIN";
  }
  return "COCKTAIL";
}

export function SignatureDrinks({ signatureDrinks }: SignatureDrinksProps) {
  if (signatureDrinks.length === 0) return null;

  return (
    <BarSection id="drinks" tone="charcoal" wide>
      <div className="bar-drinks-layout">
        <div className="bar-drinks-main">
          <BarSectionHeading
            label="COCKTAIL"
            title="シグネチャー"
            subtitle="バーテンダーが紡ぐ、一杯の物語"
            largeEn="Drinks"
            align="left"
          />

          <StaggerContainer className="bar-cocktail-book">
            {signatureDrinks.map((item, index) => {
              const ingredients = parseIngredients(item.description);
              const category = categoryLabel(item, index);
              const reverse = index % 2 === 1;

              return (
                <StaggerItem key={item.name}>
                  <article
                    className={`bar-cocktail-row ${reverse ? "bar-cocktail-row--reverse" : ""}`}
                  >
                    <div className="bar-cocktail-copy">
                      <div className="bar-cocktail-meta">
                        <span className="bar-cocktail-num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="bar-cocktail-cat">{category}</span>
                      </div>
                      {item.nameEn ? (
                        <p className="bar-cocktail-name-en">{item.nameEn}</p>
                      ) : null}
                      <div className="bar-cocktail-leader">
                        <h3 className="bar-cocktail-name">{item.name}</h3>
                        <span className="bar-cocktail-dots" aria-hidden />
                        <p className="bar-cocktail-price">{item.price}</p>
                      </div>
                      {ingredients ? (
                        <p className="bar-cocktail-ingredients">{ingredients}</p>
                      ) : item.description ? (
                        <p className="bar-cocktail-ingredients">{item.description}</p>
                      ) : null}
                      {item.isSample ? <SampleLabel /> : null}
                    </div>

                    {item.image ? (
                      <FadeIn
                        direction={reverse ? "left" : "right"}
                        delay={0.04}
                        className="bar-cocktail-photo-wrap"
                      >
                        <figure className="bar-cocktail-photo">
                          <FlexibleImageFill
                            src={item.image}
                            alt={item.name}
                            className="bar-image-fill object-cover"
                            sizes="(max-width: 768px) 55vw, 18vw"
                          />
                          <div className="bar-photo-grade" aria-hidden />
                          <div className="bar-photo-grain" aria-hidden />
                          {item.isSample ? (
                            <SampleLabel className="demo-sample-label--image" />
                          ) : null}
                        </figure>
                      </FadeIn>
                    ) : null}
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        <aside className="bar-drinks-aside" aria-hidden>
          <p className="bar-drinks-aside-bg">COCKTAIL</p>
          <p className="bar-drinks-aside-line">WHISKY</p>
          <p className="bar-drinks-aside-line">GIN</p>
          <p className="bar-drinks-aside-line">NIGHT</p>
          <div className="bar-drinks-aside-rule" />
          <p className="bar-drinks-aside-note">
            One glass,
            <br />
            one quiet hour.
          </p>
        </aside>
      </div>
    </BarSection>
  );
}
