import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeMenuItem } from "@/types/cafe";

type PopularMenuProps = {
  popularMenu: CafeMenuItem[];
};

export function PopularMenu({ popularMenu }: PopularMenuProps) {
  if (popularMenu.length === 0) return null;

  const layoutClass =
    popularMenu.length === 1
      ? "cafe-popular-grid cafe-popular-grid--single"
      : popularMenu.length === 2
        ? "cafe-popular-grid cafe-popular-grid--duo"
        : "cafe-popular-grid cafe-popular-grid--multi";

  const imageSizes =
    popularMenu.length === 1
      ? "(max-width: 768px) 100vw, 28rem"
      : popularMenu.length === 2
        ? "(max-width: 768px) 100vw, 22rem"
        : "(max-width: 768px) 100vw, 33vw";

  return (
    <CafeSection id="menu" warm>
      <CafeSectionHeading
        label="Recommend"
        title="おすすめメニュー"
        subtitle="Instagramでも人気の定番"
      />

      <StaggerContainer className={layoutClass}>
        {popularMenu.map((item) => (
          <StaggerItem key={item.name}>
            <article className="cafe-popular-item">
              <figure className="cafe-popular-photo">
                <FlexibleImageFill
                  src={item.image}
                  alt={item.name}
                  className="cafe-image-fill object-cover"
                  sizes={imageSizes}
                />
                {item.badge ? (
                  <span className="cafe-popular-badge">{item.badge}</span>
                ) : null}
                {item.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>

              <div className="cafe-popular-meta">
                {item.nameEn ? (
                  <p className="cafe-popular-name-en">{item.nameEn}</p>
                ) : null}
                <div className="cafe-popular-row">
                  <h3 className="cafe-popular-name">{item.name}</h3>
                  <span className="cafe-popular-price">{item.price}</span>
                </div>
                {item.description ? (
                  <p className="cafe-popular-desc">{item.description}</p>
                ) : null}
                {item.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </CafeSection>
  );
}
