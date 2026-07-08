import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarMenuItem } from "@/types/bar";

type SignatureDrinksProps = {
  signatureDrinks: BarMenuItem[];
};

export function SignatureDrinks({ signatureDrinks }: SignatureDrinksProps) {
  if (signatureDrinks.length === 0) return null;

  const layoutClass =
    signatureDrinks.length === 1
      ? "bar-drinks-grid bar-drinks-grid--single"
      : signatureDrinks.length === 2
        ? "bar-drinks-grid bar-drinks-grid--duo"
        : "bar-drinks-grid bar-drinks-grid--multi";

  const imageSizes =
    signatureDrinks.length === 1
      ? "(max-width: 768px) 100vw, 28rem"
      : signatureDrinks.length === 2
        ? "(max-width: 768px) 100vw, 24rem"
        : "(max-width: 768px) 100vw, 33vw";

  return (
    <BarSection id="drinks" elevated>
      <BarSectionHeading
        label="Drinks"
        title="シグネチャードリンク"
        subtitle="バーテンダーが紡ぐ、一杯の物語"
      />

      <StaggerContainer className={layoutClass}>
        {signatureDrinks.map((item) => (
          <StaggerItem key={item.name}>
            <article className="bar-drinks-item">
              <figure className="bar-drinks-photo">
                <FlexibleImageFill
                  src={item.image}
                  alt={item.name}
                  className="bar-image-fill object-cover"
                  sizes={imageSizes}
                />
                {item.badge ? (
                  <span className="bar-drinks-badge">{item.badge}</span>
                ) : null}
                {item.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>

              <div className="bar-drinks-meta">
                {item.nameEn ? (
                  <p className="bar-drinks-name-en">{item.nameEn}</p>
                ) : null}
                <div className="bar-drinks-row">
                  <h3 className="bar-drinks-name">{item.name}</h3>
                  <span className="bar-drinks-price">{item.price}</span>
                </div>
                {item.description ? (
                  <p className="bar-drinks-desc">{item.description}</p>
                ) : null}
                {item.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </BarSection>
  );
}
