import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import { IzakayaFillImage } from "@/components/templates/izakaya-casual/ui/IzakayaFillImage";
import {
  guessIzkPhotoFocus,
  izkPhotoFocusClass,
} from "@/components/templates/izakaya-casual/utils/izkPhotoFocus";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type TodaysSpecialsProps = {
  todaysSpecials: IzakayaCasualMenuItem[];
};

export function TodaysSpecials({ todaysSpecials }: TodaysSpecialsProps) {
  if (todaysSpecials.length === 0) return null;

  return (
    <IzakayaSection id="specials" tone="smoke">
      <IzakayaSectionHeading
        kicker="TODAY"
        title="本日のおすすめ"
        subtitle="仕入れ次第。見つけたらラッキー。"
      />

      <StaggerContainer className="izk-today-grid">
        {todaysSpecials.map((item) => (
          <StaggerItem key={item.name}>
            <article className="izk-today-card">
              {item.image ? (
                <div
                  className="izk-today-photo"
                  style={{ position: "relative", aspectRatio: "1 / 1" }}
                >
                  <IzakayaFillImage
                    src={item.image}
                    alt={item.name}
                    className={`izk-image-fill object-cover ${izkPhotoFocusClass(guessIzkPhotoFocus(item.name))}`}
                    sizes="(max-width: 700px) 100vw, 10rem"
                  />
                  <div className="izk-photo-grade" aria-hidden />
                  {item.isSample ? (
                    <SampleLabel className="demo-sample-label--image" />
                  ) : null}
                </div>
              ) : null}
              <div className="izk-today-body">
                <h3 className="izk-today-name">{item.name}</h3>
                {item.price ? (
                  <p className="izk-today-price izk-price">{item.price}</p>
                ) : null}
                {item.description ? (
                  <p className="izk-today-desc">{item.description}</p>
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
