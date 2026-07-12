import { FadeIn } from "@/components/ui/FadeIn";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import { groupMenuByGenre } from "@/components/templates/izakaya-casual/utils/groupMenuByGenre";
import type { IzakayaCasualMenuItem } from "@/types/izakaya-casual";

type MenuBoardProps = {
  menuItems: IzakayaCasualMenuItem[];
};

export function MenuBoard({ menuItems }: MenuBoardProps) {
  if (menuItems.length === 0) return null;

  const genres = groupMenuByGenre(menuItems);

  return (
    <IzakayaSection id="menu" narrow>
      <IzakayaSectionHeading title="メニュー" variant="plain" align="center" />

      <FadeIn>
        <div className="izk-menu-book">
          <div className="izk-menu-book-page">
            {genres.map((genre) => (
              <section key={genre.name} className="izk-menu-chapter">
                <h3 className="izk-menu-chapter-title">{genre.name}</h3>
                <ul className="izk-menu-lines">
                  {genre.items.map((item) => (
                    <li key={item.name} className="izk-menu-line">
                      <span className="izk-menu-line-name">{item.name}</span>
                      <span className="izk-menu-line-leader" aria-hidden />
                      <span className="izk-menu-line-price">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </FadeIn>
    </IzakayaSection>
  );
}
