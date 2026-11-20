import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeMenuItem } from "@/types/cafe";

type PopularMenuProps = {
  popularMenu: CafeMenuItem[];
};

function shorten(text: string | undefined, max = 56): string | null {
  if (!text?.trim()) return null;
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function PopularMenu({ popularMenu }: PopularMenuProps) {
  if (popularMenu.length === 0) return null;

  return (
    <CafeSection id="menu" tone="ivory">
      <CafeSectionHeading
        label="MENU"
        title="おすすめ"
        subtitle="定番を、編集のように。"
        largeEn="Favorites"
        align="left"
      />

      <StaggerContainer className="cafe-popular-list">
        {popularMenu.map((item, index) => {
          const num = String(index + 1).padStart(2, "0");
          const desc = shorten(item.description);
          const reverse = index % 2 === 1;

          return (
            <StaggerItem key={item.name}>
              <article
                className={`cafe-popular-row ${reverse ? "cafe-popular-row--reverse" : ""}`}
              >
                <div className="cafe-popular-copy">
                  <p className="cafe-popular-num">{num}</p>
                  {item.badge ? (
                    <span className="cafe-popular-badge">{item.badge}</span>
                  ) : null}
                  {item.nameEn ? (
                    <p className="cafe-popular-name-en">{item.nameEn}</p>
                  ) : null}
                  <div className="cafe-popular-leader">
                    <h3 className="cafe-popular-name">{item.name}</h3>
                    <span className="cafe-popular-dots" aria-hidden />
                    <p className="cafe-popular-price">{item.price}</p>
                  </div>
                  {desc ? <p className="cafe-popular-desc">{desc}</p> : null}
                  {item.isSample ? <SampleLabel /> : null}
                </div>

                {item.image ? (
                  <FadeIn
                    direction={reverse ? "left" : "right"}
                    delay={0.05}
                    className="cafe-popular-photo-wrap"
                  >
                    <figure className="cafe-popular-photo">
                      <FlexibleImageFill
                        src={item.image}
                        alt={item.name}
                        className="cafe-image-fill object-cover"
                        sizes="(max-width: 768px) 70vw, 22vw"
                      />
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
    </CafeSection>
  );
}
