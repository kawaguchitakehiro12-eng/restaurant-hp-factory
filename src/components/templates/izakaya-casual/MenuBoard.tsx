import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import { IzakayaFillImage } from "@/components/templates/izakaya-casual/ui/IzakayaFillImage";
import { groupMenuByGenre } from "@/components/templates/izakaya-casual/utils/groupMenuByGenre";
import {
  guessIzkPhotoFocus,
  izkPhotoFocusClass,
} from "@/components/templates/izakaya-casual/utils/izkPhotoFocus";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type MenuBoardProps = {
  menuItems: IzakayaCasualMenuItem[];
};

/** Graphic single-character for category panels */
const GENRE_MARK: Record<string, string> = {
  焼きもの: "焼",
  "刺身・海鮮": "鮮",
  ドリンク: "酒",
  酒の肴: "肴",
  その他: "飯",
};

export function MenuBoard({ menuItems }: MenuBoardProps) {
  if (menuItems.length === 0) return null;

  const genres = groupMenuByGenre(menuItems);
  const spotlight = menuItems.filter((item) => item.image).slice(0, 3);

  return (
    <IzakayaSection id="menu" tone="white" className="izk-menu-section">
      <IzakayaSectionHeading
        kicker="MENU"
        title="メニュー"
        subtitle="串から一杯まで。見ているだけでお腹が空く。"
      />

      {spotlight.length > 0 ? (
        <FadeIn className="izk-menu-spotlight">
          {spotlight.map((item) => (
            <figure
              key={item.name}
              className="izk-menu-spot"
              style={{ position: "relative", aspectRatio: "3 / 2" }}
            >
              <IzakayaFillImage
                src={item.image!}
                alt={item.name}
                className={`izk-image-fill object-cover ${izkPhotoFocusClass(guessIzkPhotoFocus(item.name))}`}
                sizes="(max-width: 768px) 45vw, 14rem"
              />
              <div className="izk-photo-grade" aria-hidden />
              <figcaption>
                <span>{item.name}</span>
                {item.price ? (
                  <em className="izk-price">{item.price}</em>
                ) : null}
              </figcaption>
              {item.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          ))}
        </FadeIn>
      ) : null}

      <div className="izk-menu-board">
        {genres.map((genre) => (
          <FadeIn key={genre.name} className="izk-menu-genre">
            <div className="izk-menu-genre-head" aria-hidden>
              <span className="izk-menu-mark">
                {GENRE_MARK[genre.name] ?? genre.name.slice(0, 1)}
              </span>
              <h3 className="izk-menu-genre-title">{genre.name}</h3>
            </div>
            <ul className="izk-menu-lines">
              {genre.items.map((item) => (
                <li key={item.name} className="izk-menu-line">
                  <span className="izk-menu-line-name">{item.name}</span>
                  <span className="izk-menu-line-dots" aria-hidden />
                  <span className="izk-menu-line-price izk-price">
                    {item.price}
                  </span>
                  {item.isSample ? <SampleLabel /> : null}
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </div>
    </IzakayaSection>
  );
}
