import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type MenuBoardProps = {
  menuItems: IzakayaCasualMenuItem[];
};

export function MenuBoard({ menuItems }: MenuBoardProps) {
  if (menuItems.length === 0) return null;

  return (
    <IzakayaSection id="menu">
      <IzakayaSectionHeading
        label="Menu"
        title="メニュー"
        subtitle="つまみから定番まで、気軽にどうぞ"
      />

      <StaggerContainer className="izk-menu-grid">
        {menuItems.map((item) => {
          const hasPhoto = Boolean(item.image);

          return (
            <StaggerItem key={item.name}>
              <article
                className={`izk-menu-card ${hasPhoto ? "" : "izk-menu-card--text-only"}`}
              >
                {hasPhoto ? (
                  <figure className="izk-menu-photo">
                    <FlexibleImageFill
                      src={item.image}
                      alt={item.name}
                      className="izk-image-fill object-cover"
                      sizes="5.25rem"
                    />
                    {item.isSample ? (
                      <SampleLabel className="demo-sample-label--image" />
                    ) : null}
                  </figure>
                ) : null}

                <div className="izk-menu-meta">
                  {item.badge ? (
                    <span className="izk-menu-badge">{item.badge}</span>
                  ) : null}
                  {item.nameEn ? (
                    <p className="izk-menu-name-en">{item.nameEn}</p>
                  ) : null}
                  <div className="izk-menu-row">
                    <h3 className="izk-menu-name">{item.name}</h3>
                    <span className="izk-menu-price">{item.price}</span>
                  </div>
                  {item.description ? (
                    <p className="izk-menu-desc">{item.description}</p>
                  ) : null}
                  {item.isSample ? <SampleLabel /> : null}
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </IzakayaSection>
  );
}
