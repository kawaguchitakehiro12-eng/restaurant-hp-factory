import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type SpecialtyDishesProps = {
  specialtyDishes: IzakayaCasualMenuItem[];
};

export function SpecialtyDishes({ specialtyDishes }: SpecialtyDishesProps) {
  if (specialtyDishes.length === 0) return null;

  const layoutClass =
    specialtyDishes.length === 1
      ? "izk-specialty-grid izk-specialty-grid--single"
      : specialtyDishes.length === 2
        ? "izk-specialty-grid izk-specialty-grid--duo"
        : "izk-specialty-grid izk-specialty-grid--multi";

  const imageSizes =
    specialtyDishes.length === 1
      ? "(max-width: 768px) 100vw, 30rem"
      : specialtyDishes.length === 2
        ? "(max-width: 768px) 100vw, 24rem"
        : "(max-width: 768px) 100vw, 33vw";

  return (
    <IzakayaSection id="specialty" tone="paper">
      <IzakayaSectionHeading
        label="Specialty"
        title="名物料理"
        subtitle="熱々・どか盛り・やみつきの一皿"
      />

      <StaggerContainer className={layoutClass}>
        {specialtyDishes.map((item) => (
          <StaggerItem key={item.name}>
            <article className="izk-specialty-item">
              <figure className="izk-specialty-photo">
                <FlexibleImageFill
                  src={item.image}
                  alt={item.name}
                  className="izk-image-fill object-cover"
                  sizes={imageSizes}
                />
                {item.badge ? (
                  <span className="izk-specialty-badge">{item.badge}</span>
                ) : null}
                {item.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>

              <div className="izk-specialty-meta">
                {item.nameEn ? (
                  <p className="izk-specialty-name-en">{item.nameEn}</p>
                ) : null}
                <div className="izk-specialty-row">
                  <h3 className="izk-specialty-name">{item.name}</h3>
                  <span className="izk-specialty-price">{item.price}</span>
                </div>
                {item.description ? (
                  <p className="izk-specialty-desc">{item.description}</p>
                ) : null}
                {item.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </IzakayaSection>
  );
}
