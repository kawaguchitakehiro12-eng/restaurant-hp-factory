import { balNavItems } from "@/components/templates/bal/nav";
import type { BalStore } from "@/types/bal";

type FooterProps = {
  store: BalStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="bal-footer">
      <div className="bal-tile-strip bal-tile-strip--dark" aria-hidden />
      <div className="bal-shell bal-footer-inner">
        <div>
          <p className="bal-footer-logo">{store.name}</p>
          {store.nameEn ? <p className="bal-footer-en">{store.nameEn}</p> : null}
          <p className="bal-footer-hours">
            {store.hours.dinner}
            {store.hours.closed ? ` / 定休 ${store.hours.closed}` : ""}
          </p>
        </div>

        <nav className="bal-footer-nav" aria-label="フッターナビゲーション">
          {balNavItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.en}
            </a>
          ))}
          {store.instagramUrl ? (
            <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer">
              INSTAGRAM
            </a>
          ) : null}
        </nav>

        <p className="bal-footer-copy">© 2026 {store.name}</p>
      </div>
    </footer>
  );
}
